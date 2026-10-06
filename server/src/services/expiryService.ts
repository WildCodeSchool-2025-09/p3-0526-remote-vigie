import cron from "node-cron";
import incidentRepository from "../modules/incident/incidentRepository";
import resolutionPushService from "./resolutionPushService";

const INTERVAL_MINUTES = 5;

async function run(): Promise<void> {
	try {
		const closed = await incidentRepository.closeExpired();
		console.info(`[expiryService] ${closed.length} incident(s) clôturé(s)`);

		// After the commit: a push failure must not undo the closing
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
	} catch (err) {
		console.error("[expiryService] erreur pendant la clôture :", err);
	}
}

function schedule(): void {
	cron.schedule(`*/${INTERVAL_MINUTES} * * * *`, run);
}

export default { run, schedule };
