import type { Incident } from "@/types/incidentDetails";
import type { NearbyIncident } from "@/types/incidentForm";

type GetIncidentResult =
	| { status: "ok"; incident: Incident }
	| { status: "notFound" }
	| { status: "error" };

type GetNearbyIncidentResult =
	| { status: "ok"; nearbyIncident: NearbyIncident | null }
	| { status: "badRequest" }
	| { status: "error" };

export async function getIncidentById(id: string): Promise<GetIncidentResult> {
	try {
		const res = await fetch(
			`${import.meta.env.VITE_API_URL}/api/incidents/${id}`,
		);

		if (res.status === 404) return { status: "notFound" };
		if (!res.ok) return { status: "error" };

		return { status: "ok", incident: (await res.json()) as Incident };
	} catch {
		return { status: "error" }; // réseau, CORS, JSON illisible
	}
}

export async function getNearbyIncident(
	lat: number,
	lng: number,
	typeIds: number[],
): Promise<GetNearbyIncidentResult> {
	try {
		const params = new URLSearchParams();
		params.set("lat", String(lat));
		params.set("lng", String(lng));
		for (const id of typeIds) {
			params.append("types", String(id));
		}

		const res = await fetch(
			`${import.meta.env.VITE_API_URL}/api/incidents/nearby?${params.toString()}`,
		);
		if (res.status === 400) return { status: "badRequest" };
		if (!res.ok) return { status: "error" };

		return {
			status: "ok",
			nearbyIncident: await res.json(),
		};
	} catch {
		return { status: "error" };
	}
}
