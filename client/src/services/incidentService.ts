import { apiFetch } from "@/services/apiClient";
import type { Incident } from "@/types/incidentDetails";
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

type GetIncidentResult =
	| { status: "ok"; incident: Incident }
	| { status: "notFound" }
	| { status: "error" };

export async function getIncidentById(id: string): Promise<GetIncidentResult> {
	try {
		const res = await apiFetch(`/api/incidents/${id}`);

		if (res.status === 404) return { status: "notFound" };
		if (!res.ok) return { status: "error" };

		return { status: "ok", incident: (await res.json()) as Incident };
	} catch {
		return { status: "error" }; // réseau, CORS, JSON illisible
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
