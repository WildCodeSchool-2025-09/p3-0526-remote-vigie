import type { Incident } from "@/types/incidentDetails";
import withPreposition from "@/utils/withPreposition";

type ShareableIncident = Pick<
	Incident,
	"id" | "types" | "city" | "latitude" | "longitude"
>;

export default function buildShareContent(incident: ShareableIncident) {
	const primaryType = incident.types[0];

	const location =
		incident.city != null
			? withPreposition(incident.city)
			: `(${Number(incident.latitude).toFixed(5)}, ${Number(
					incident.longitude,
				).toFixed(5)})`;

	const text =
		primaryType.code === "danger"
			? `Une personne est en danger ${location} — alerte Vigie.`
			: `${primaryType.label} ${location} — signalé sur Vigie.`;

	return {
		title: "Alerte Vigie",
		text,
		url: `${import.meta.env.VITE_PUBLIC_URL}/incident/${incident.id}`,
	};
}
