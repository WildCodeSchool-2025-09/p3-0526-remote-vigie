import { apiFetch } from "@/services/apiClient";
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
	photoUrl: string | null;
};

type UpdateIncidentResult =
	| { status: "ok"; incident: Incident }
	| { status: "invalid" }
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

		if (res.status === 400) return { status: "invalid" };
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
	photoUrl: string | null;
};

type CreateIncidentResult =
	| { status: "ok"; incident: Incident }
	| { status: "invalid"; error: string; message: string }
	| { status: "unauthorized" }
	| { status: "forbidden"; message: string }
	| { status: "tooManyRequests"; message: string }
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
			const body = (await res.json()) as { error: string; message: string };
			return { status: "invalid", error: body.error, message: body.message };
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
		if (!res.ok) return { status: "error" };

		return { status: "ok", incident: (await res.json()) as Incident };
	} catch {
		return { status: "error" };
	}
}
