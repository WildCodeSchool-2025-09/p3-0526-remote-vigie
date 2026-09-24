import "dotenv/config";

import databaseClient from "../../database/client";
import incidentRepository from "../modules/incident/incidentRepository";
import expiryService from "./expiryService";

import type { Result, Rows } from "../../database/client";

let userId: number;

async function insertIncident(
	status: "in_progress" | "resolved",
	expiresAt: Date,
): Promise<number> {
	const [result] = await databaseClient.query<Result>(
		`INSERT INTO incident
			(user_id, danger_level_id, title, latitude, longitude,
			 base_lifespan_hours, base_alert_radius_meters, city, insee_code,
			 status, expires_at)
		VALUES (?, 1, 'Test expiryService', 48.8566, 2.3522, 24, 1000, 'Paris', '75056', ?, ?)`,
		[userId, status, expiresAt],
	);

	return result.insertId;
}

async function readStatus(id: number): Promise<string> {
	const [rows] = await databaseClient.query<Rows>(
		"SELECT status FROM incident WHERE id = ?",
		[id],
	);

	return rows[0].status;
}

async function deleteIncident(id: number): Promise<void> {
	await databaseClient.query("DELETE FROM incident WHERE id = ?", [id]);
}

beforeAll(async () => {
	const [users] = await databaseClient.query<Rows>(
		"SELECT id FROM user LIMIT 1",
	);
	userId = users[0].id;
});

afterAll(async () => {
	await databaseClient.end();
});

describe("expiryService.run", () => {
	// Nothing to close: should resolve cleanly, no throw.
	test("aucun incident à clôturer : se termine sans erreur", async () => {
		await expect(expiryService.run()).resolves.toBeUndefined();
	});

	// Past expires_at + in_progress: gets closed.
	test("incident échu : passe en resolved", async () => {
		const id = await insertIncident(
			"in_progress",
			new Date(Date.now() - 60 * 60 * 1000),
		);

		await expiryService.run();

		expect(await readStatus(id)).toBe("resolved");

		await deleteIncident(id);
	});

	// Future expires_at: left untouched.
	test("incident non échu : reste in_progress", async () => {
		const id = await insertIncident(
			"in_progress",
			new Date(Date.now() + 60 * 60 * 1000),
		);

		await expiryService.run();

		expect(await readStatus(id)).toBe("in_progress");

		await deleteIncident(id);
	});

	// Already resolved, even with a past expires_at: never reprocessed.
	test("incident déjà résolu : n'est jamais retraité", async () => {
		const id = await insertIncident(
			"resolved",
			new Date(Date.now() - 60 * 60 * 1000),
		);

		await expiryService.run();

		expect(await readStatus(id)).toBe("resolved");

		await deleteIncident(id);
	});

	// Run twice back to back: the second pass is a no-op, no crash.
	test("exécution rejouée : la deuxième passe ne change plus rien", async () => {
		const id = await insertIncident(
			"in_progress",
			new Date(Date.now() - 60 * 60 * 1000),
		);

		await expiryService.run();
		expect(await readStatus(id)).toBe("resolved");

		await expect(expiryService.run()).resolves.toBeUndefined();
		expect(await readStatus(id)).toBe("resolved");

		await deleteIncident(id);
	});

	// Two overlapping calls on the same row: MySQL's row locking on UPDATE
	// serializes them, so the row ends up resolved exactly once, no crash.
	test("deux exécutions simultanées ne clôturent pas deux fois le même incident", async () => {
		const id = await insertIncident(
			"in_progress",
			new Date(Date.now() - 60 * 60 * 1000),
		);

		await expect(
			Promise.all([
				incidentRepository.closeExpired(),
				incidentRepository.closeExpired(),
			]),
		).resolves.toBeDefined();

		expect(await readStatus(id)).toBe("resolved");

		await deleteIncident(id);
	});

	// closeExpired() throws: run() catches it, logs it, and doesn't crash the process.
	test("erreur pendant la clôture : journalisée, ne fait pas planter run()", async () => {
		const consoleError = jest
			.spyOn(console, "error")
			.mockImplementation(() => {});
		const closeExpired = jest
			.spyOn(incidentRepository, "closeExpired")
			.mockRejectedValueOnce(new Error("boom"));

		await expect(expiryService.run()).resolves.toBeUndefined();

		expect(consoleError).toHaveBeenCalled();

		closeExpired.mockRestore();
		consoleError.mockRestore();

		// The next run behaves normally again (nothing stuck/broken).
		await expect(expiryService.run()).resolves.toBeUndefined();
	});
});
