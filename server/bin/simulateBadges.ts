// Load environment variables from .env file
import "dotenv/config";

// Dev only: simulates badge progress for a user, to preview the badges page.
// Usage (from /server):
//   npm run simulate:badges -- <pseudo>          add simulated activity
//   npm run simulate:badges -- <pseudo> reset    remove it, and the user's badges and votes
import databaseClient from "../database/client";
import badgeService from "../src/modules/badge/badgeService";

import type { Executor, Result, Rows } from "../database/client";

const TEST_MARKER = "badge-test";
const DANGER_LEVEL_ID = 3;
const COMMENT_COUNT = 12;
const VOTES_ON_OTHERS_INCIDENTS = 10;
const LYNX_CONFIRMATIONS = 3;
const LYNX_INCIDENTS = 2;

// Incidents created for the user: [incident type code, how many]
const INCIDENTS_BY_TYPE: [string, number][] = [
	["fire", 4],
	["wild", 5],
];

async function findUserId(pseudo: string): Promise<number | null> {
	const [rows] = await databaseClient.query<Rows>(
		"SELECT id FROM user WHERE pseudo_normalized = ?",
		[pseudo.trim().toLowerCase()],
	);

	return rows[0]?.id ?? null;
}

async function removeTestActivity(userId: number, executor: Executor) {
	await executor.query(
		"DELETE FROM comment WHERE user_id = ? AND content = ?",
		[userId, TEST_MARKER],
	);
	await executor.query(
		"DELETE FROM incident WHERE user_id = ? AND title = ?",
		[userId, TEST_MARKER],
	);
}

async function simulate(userId: number, executor: Executor) {
	// Idempotent: a second run starts again from the same state
	await removeTestActivity(userId, executor);

	const [others] = await executor.query<Rows>(
		"SELECT id FROM incident WHERE user_id <> ? ORDER BY id LIMIT ?",
		[userId, VOTES_ON_OTHERS_INCIDENTS],
	);

	if (others.length > 0) {
		await executor.query(
			"INSERT INTO comment (user_id, incident_id, content) VALUES ?",
			[
				Array.from({ length: COMMENT_COUNT }, () => [
					userId,
					others[0].id,
					TEST_MARKER,
				]),
			],
		);
		await executor.query(
			"INSERT IGNORE INTO contribution (incident_id, user_id, type) VALUES ?",
			[others.map((incident) => [incident.id, userId, "confirm"])],
		);
	}

	// One zone per incident (0.5 degree apart): none is a duplicate of another
	let zone = 0;
	const lynxIncidentIds: number[] = [];

	for (const [typeCode, count] of INCIDENTS_BY_TYPE) {
		for (let index = 0; index < count; index++) {
			const [incident] = await executor.query<Result>(
				`INSERT INTO incident
					(user_id, danger_level_id, title, latitude, longitude,
					 base_lifespan_hours, base_alert_radius_meters, expires_at)
				VALUES (?, ?, ?, ?, 2, 24, 1000, DATE_ADD(NOW(), INTERVAL 1 DAY))`,
				[userId, DANGER_LEVEL_ID, TEST_MARKER, 42 + zone * 0.5],
			);
			zone++;

			await executor.query(
				`INSERT INTO incident_incident_type (incident_id, incident_type_id)
				SELECT ?, id FROM incident_type WHERE code = ?`,
				[incident.insertId, typeCode],
			);

			if (lynxIncidentIds.length < LYNX_INCIDENTS) {
				lynxIncidentIds.push(incident.insertId);
			}
		}
	}

	// Confirmations from other users on two of the user's incidents
	const [voters] = await executor.query<Rows>(
		"SELECT id FROM user WHERE id <> ? ORDER BY id LIMIT ?",
		[userId, LYNX_CONFIRMATIONS],
	);
	const confirmations = lynxIncidentIds.flatMap((incidentId) =>
		voters.map((voter) => [incidentId, voter.id, "confirm"]),
	);

	if (confirmations.length > 0) {
		await executor.query(
			"INSERT IGNORE INTO contribution (incident_id, user_id, type) VALUES ?",
			[confirmations],
		);
	}
}

async function reset(userId: number, executor: Executor) {
	await removeTestActivity(userId, executor);
	await executor.query("DELETE FROM contribution WHERE user_id = ?", [
		userId,
	]);
	await executor.query("DELETE FROM user_badge WHERE user_id = ?", [userId]);
}

async function printCollection(userId: number) {
	const collection = await badgeService.readCollection(userId);

	for (const badge of collection) {
		const state = badge.progress
			? `${badge.progress.current}/${badge.progress.target}`
			: "obtenu";
		console.info(`${badge.code.padEnd(20)} ${state}`);
	}
}

const main = async () => {
	if (process.env.NODE_ENV === "production") {
		throw new Error("simulate:badges is a dev-only script.");
	}

	const [pseudo, command] = process.argv.slice(2);

	if (!pseudo || (command !== undefined && command !== "reset")) {
		console.error("Usage: npm run simulate:badges -- <pseudo> [reset]");
		process.exitCode = 1;
		return;
	}

	const userId = await findUserId(pseudo);

	if (userId == null) {
		console.error(`No user found with the pseudo "${pseudo}".`);
		process.exitCode = 1;
		return;
	}

	const connection = await databaseClient.getConnection();

	try {
		await connection.beginTransaction();
		await (command === "reset"
			? reset(userId, connection)
			: simulate(userId, connection));
		await connection.commit();
	} catch (error) {
		await connection.rollback();
		throw error;
	} finally {
		connection.release();
	}

	console.info(
		command === "reset"
			? `Simulated activity, votes and badges removed for "${pseudo}".`
			: `Simulated activity added for "${pseudo}". Log in again to be granted the reached badges.`,
	);
	await printCollection(userId);
};

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => databaseClient.end());
