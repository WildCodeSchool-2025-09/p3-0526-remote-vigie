import cron from "node-cron";
import incidentRepository from "../modules/incident/incidentRepository";
import type { ClosedIncident } from "../modules/incident/incidentRepository";
import resolutionPushService from "./resolutionPushService";

const INTERVAL_MINUTES = 5;

// Resolution pushes are slow (one lookup and several relays per incident): they
// run in a queue, one batch after the other, outside the 5-minute task. The
// closing never waits for them, and two runs never push at the same time.
let notifications: Promise<void> = Promise.resolve();

function enqueueNotifications(closed: ClosedIncident[]): void {
	notifications = notifications.then(async () => {
		for (const incident of closed) {
			try {
				await resolutionPushService.notify(incident);
			} catch (err) {
				console.error(
					`[expiryService] push de résolution impossible (incident ${incident.id}) :`,
					err,
				);
			}
		}
	});
}

// Resolves when the queued pushes are done (for the manual script)
function whenIdle(): Promise<void> {
	return notifications;
}

async function run(): Promise<void> {
	try {
		const closed = await incidentRepository.closeExpired();
		console.info(`[expiryService] ${closed.length} incident(s) clôturé(s)`);

		// After the commit: a push failure must not undo the closing
		enqueueNotifications(closed);
	} catch (err) {
		console.error("[expiryService] erreur pendant la clôture :", err);
	}
}

function schedule(): void {
	cron.schedule(`*/${INTERVAL_MINUTES} * * * *`, run);
}

export default { run, schedule, whenIdle };
