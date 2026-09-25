import cron from "node-cron";
import incidentRepository from "../modules/incident/incidentRepository";

const INTERVAL_MINUTES = 5;

async function run(): Promise<void> {
	try {
		const count = await incidentRepository.closeExpired();
		console.info(`[expiryService] ${count} incident(s) clôturé(s)`);
	} catch (err) {
		console.error("[expiryService] erreur pendant la clôture :", err);
	}
}

function schedule(): void {
	cron.schedule(`*/${INTERVAL_MINUTES} * * * *`, run);
}

export default { run, schedule };
