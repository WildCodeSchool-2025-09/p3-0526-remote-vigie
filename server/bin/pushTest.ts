// Load environment variables from .env file
import "dotenv/config";

// Sends a test push to one user's registered devices, with the real content of
// each case. Usage (from /server):
//   npm run push:test -- <pseudo> [incident|danger|resolved|comment|mention] [city]
import databaseClient from "../database/client";
import pushSubscriptionRepository from "../src/modules/pushSubscription/pushSubscriptionRepository";
import {
	commentPayload,
	incidentResolvedPayload,
	mentionPayload,
	newIncidentPayload,
} from "../src/services/pushPayloads";
import pushService from "../src/services/pushService";
import webPushClient from "../src/services/webPushClient";

import type { Rows } from "../database/client";
import type { PushPayload } from "../src/services/pushService";

const CASES = ["incident", "danger", "resolved", "comment", "mention"];

function buildPayload(
	kind: string,
	incidentId: number,
	city: string,
): PushPayload {
	switch (kind) {
		case "danger":
			return newIncidentPayload({ incidentId, city, isDanger: true });
		case "resolved":
			return incidentResolvedPayload({ incidentId, city });
		case "comment":
			return commentPayload({ incidentId, city });
		case "mention":
			return mentionPayload({ incidentId, city });
		default:
			return newIncidentPayload({ incidentId, city });
	}
}

async function main() {
	const [pseudo, kind = "incident", city = "Colmar"] = process.argv.slice(2);

	if (!pseudo || !CASES.includes(kind)) {
		console.error(
			`Usage: npm run push:test -- <pseudo> [${CASES.join("|")}] [city]`,
		);
		process.exitCode = 1;
		return;
	}

	if (webPushClient.getWebPush() == null) {
		process.exitCode = 1;
		return;
	}

	const [users] = await databaseClient.query<Rows>(
		"SELECT id FROM user WHERE pseudo_normalized = ?",
		[pseudo.trim().toLowerCase()],
	);
	if (users.length === 0) {
		console.error(`No user found with the pseudo "${pseudo}".`);
		process.exitCode = 1;
		return;
	}
	const userId = users[0].id as number;

	const devices = await pushSubscriptionRepository.findByUser(userId);
	if (devices.length === 0) {
		console.info(
			"No registered device: enable notifications from the profile page.",
		);
		return;
	}

	// The link opens a real incident, so that the click can be tested too
	const [incidents] = await databaseClient.query<Rows>(
		"SELECT id FROM incident ORDER BY id DESC LIMIT 1",
	);
	const incidentId = (incidents[0]?.id as number | undefined) ?? 1;

	const payload = buildPayload(kind, incidentId, city);
	console.info(
		`Sending "${payload.title}" to ${devices.length} device(s)...`,
	);

	const results = await pushService.send(userId, payload);
	for (const result of results) {
		const relay = new URL(result.endpoint).hostname;
		console.info(
			result.ok
				? `  ${relay}: sent`
				: `  ${relay}: failed (status ${result.statusCode ?? "none"})`,
		);
	}

	const remaining = await pushSubscriptionRepository.findByUser(userId);
	if (remaining.length < devices.length) {
		console.info(
			`${devices.length - remaining.length} unreachable device(s) removed (404 or 410).`,
		);
	}
}

main()
	.catch((err) => {
		console.error(err);
		process.exitCode = 1;
	})
	.finally(() => databaseClient.end());
