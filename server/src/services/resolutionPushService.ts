import addressRepository from "../modules/address/addressRepository";
import type { ClosedIncident } from "../modules/incident/incidentRepository";
import { incidentResolvedPayload } from "./pushPayloads";
import pushService from "./pushService";

// Matches the push TTL: after an outage, incidents closed in bulk are not
// announced one by one hours later
const FRESH_WINDOW_MINUTES = 60;

// Creator plus the people who got the initial alert: the same radius (stored at
// creation) and the same lookup as alertService, so the same addresses
async function notify(incident: ClosedIncident): Promise<void> {
	if (incident.expiredForMinutes > FRESH_WINDOW_MINUTES) return;

	const neighbours = await addressRepository.findAddressesInRadius(
		Number(incident.longitude),
		Number(incident.latitude),
		incident.alertRadiusMeters,
		incident.userId,
	);

	await pushService.sendToUsers(
		[incident.userId, ...neighbours.map((row) => Number(row.user_id))],
		incidentResolvedPayload({
			incidentId: incident.id,
			city: incident.city,
		}),
	);
}

export default { notify };
