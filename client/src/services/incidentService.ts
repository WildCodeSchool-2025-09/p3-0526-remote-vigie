import type { IncidentListItem } from "@/types/incidentList";

type GetAllIncidentsResult =
	| { status: "ok"; incidents: IncidentListItem[] }
	| { status: "error" };

export async function getAllIncidents(
	limit = 15,
): Promise<GetAllIncidentsResult> {
	try {
		const res = await fetch(
			`${import.meta.env.VITE_API_URL}/api/incidents?limit=${limit}`,
		);

		if (!res.ok) return { status: "error" };

		return {
			status: "ok",
			incidents: (await res.json()) as IncidentListItem[],
		};
	} catch {
		return { status: "error" }; // réseau, CORS, JSON illisible
	}
}
