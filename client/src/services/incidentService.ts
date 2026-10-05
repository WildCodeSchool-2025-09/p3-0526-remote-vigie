import { apiFetch } from "@/services/apiClient";
import type { Bounds } from "@/types/bounds";
import type { Incident, IncidentCounts } from "@/types/incidentDetails";
import type { NearbyIncident } from "@/types/incidentForm";
import type { IncidentListItem } from "@/types/incidentList";

type GetAllIncidentsResult =
	| { status: "ok"; incidents: IncidentListItem[] }
	| { status: "error" };

export async function getAllIncidents(
	limit = 15,
): Promise<GetAllIncidentsResult> {
	try {
		const res = await apiFetch(`/api/incidents?limit=${limit}`);

		if (!res.ok) return { status: "error" };

		return {
			status: "ok",
			incidents: (await res.json()) as IncidentListItem[],
		};
	} catch {
		return { status: "error" }; // réseau, CORS, JSON illisible
	}
}

// Même plafond que MAX_MAP_LIMIT côté serveur (incidentActions.ts).
export const MAP_INCIDENTS_LIMIT = 300;

// Incidents in the map's visible zone (separate call from getAllIncidents).
export async function getIncidentsInBounds(
	bounds: Bounds,
	limit = MAP_INCIDENTS_LIMIT,
): Promise<GetAllIncidentsResult> {
	try {
		const params = new URLSearchParams({
			north: String(bounds.north),
			south: String(bounds.south),
			east: String(bounds.east),
			west: String(bounds.west),
			limit: String(limit),
		});

		const res = await apiFetch(`/api/incidents?${params.toString()}`);

		if (!res.ok) return { status: "error" };

		return {
			status: "ok",
			incidents: (await res.json()) as IncidentListItem[],
		};
	} catch {
		return { status: "error" };
	}
}

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
		const res = await apiFetch(`/api/incidents/${id}`);

		if (res.status === 404) return { status: "notFound" };
		if (!res.ok) return { status: "error" };

		return { status: "ok", incident: (await res.json()) as Incident };
	} catch {
		return { status: "error" };
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

		const res = await apiFetch(
			`/api/incidents/nearby?${params.toString()}`,
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

type UpdateIncidentPayload = {
	title: string;
	description: string | null;
	// Data URL de la nouvelle photo ; null la retire ; absent (undefined) la garde.
	photo?: string | null;
};

type UpdateIncidentResult =
	| { status: "ok"; incident: Incident }
	| { status: "invalid"; message?: string }
	| { status: "forbidden" }
	| { status: "notFound" }
	| { status: "resolved" }
	| { status: "error" };

export async function updateIncident(
	id: string,
	payload: UpdateIncidentPayload,
): Promise<UpdateIncidentResult> {
	try {
		const res = await apiFetch(`/api/incidents/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (res.status === 400) {
			// Les erreurs de photo portent un message ; les autres 400 n'ont pas de corps.
			const body = (await res.json().catch(() => null)) as {
				message?: string;
			} | null;
			return { status: "invalid", message: body?.message };
		}
		if (res.status === 403) return { status: "forbidden" };
		if (res.status === 404) return { status: "notFound" };
		if (res.status === 409) return { status: "resolved" };
		if (!res.ok) return { status: "error" };

		return { status: "ok", incident: (await res.json()) as Incident };
	} catch {
		return { status: "error" };
	}
}

type CreateIncidentPayload = {
	typeIds: number[];
	latitude: number;
	longitude: number;
	dangerLevelId: number;
	title: string;
	description: string | null;
	// Data URL de la photo redimensionnée, ou null.
	photo: string | null;
};

type CreateIncidentResult =
	| { status: "ok"; incident: Incident }
	| { status: "invalid"; error: string; message: string }
	| { status: "unauthorized" }
	| { status: "forbidden"; message: string }
	| { status: "tooManyRequests"; message: string }
	| { status: "duplicate"; message: string }
	| { status: "networkError" }
	| { status: "error" };

export async function createIncident(
	payload: CreateIncidentPayload,
): Promise<CreateIncidentResult> {
	try {
		const res = await apiFetch("/api/incidents", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (res.status === 400) {
			const body = (await res.json()) as {
				error: string;
				message: string;
			};
			return {
				status: "invalid",
				error: body.error,
				message: body.message,
			};
		}
		if (res.status === 401) return { status: "unauthorized" };
		if (res.status === 403) {
			const body = (await res.json()) as { message: string };
			return { status: "forbidden", message: body.message };
		}
		if (res.status === 429) {
			const body = (await res.json()) as { message: string };
			return { status: "tooManyRequests", message: body.message };
		}
		if (res.status === 409) {
			const body = (await res.json()) as { message: string };
			return { status: "duplicate", message: body.message };
		}
		if (!res.ok) return { status: "error" };

		return { status: "ok", incident: (await res.json()) as Incident };
	} catch {
		return { status: "networkError" };
	}
}

type CreateContributionResult =
	| { status: "ok"; counts: IncidentCounts; expiresAt: string }
	| { status: "invalid" }
	| { status: "forbidden" }
	| { status: "notFound" }
	| { status: "resolved" }
	| { status: "error" };

export async function createContribution(
	incidentId: string,
	type: "confirm" | "deny",
): Promise<CreateContributionResult> {
	try {
		const res = await apiFetch(
			`/api/incidents/${incidentId}/contributions`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ type }),
			},
		);

		if (res.status === 400) return { status: "invalid" };
		if (res.status === 403) return { status: "forbidden" };
		if (res.status === 404) return { status: "notFound" };
		if (res.status === 409) return { status: "resolved" };
		if (!res.ok) return { status: "error" };

		return {
			status: "ok",
			...((await res.json()) as {
				counts: IncidentCounts;
				expiresAt: string;
			}),
		};
	} catch {
		return { status: "error" };
	}
}
