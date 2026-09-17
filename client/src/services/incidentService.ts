import type { Incident } from "@/types/incidentDetails";

type GetIncidentResult =
	| { status: "ok"; incident: Incident }
	| { status: "notFound" }
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

type UpdateIncidentPayload = {
	title: string;
	description: string | null;
	photoUrl: string | null;
};

type UpdateIncidentResult =
	| { status: "ok"; incident: Incident }
	| { status: "invalid" }
	| { status: "notFound" }
	| { status: "error" };

export async function updateIncident(
	id: string,
	payload: UpdateIncidentPayload,
): Promise<UpdateIncidentResult> {
	try {
		const res = await fetch(
			`${import.meta.env.VITE_API_URL}/api/incidents/${id}`,
			{
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			},
		);

		if (res.status === 400) return { status: "invalid" };
		if (res.status === 404) return { status: "notFound" };
		if (!res.ok) return { status: "error" };

		return { status: "ok", incident: (await res.json()) as Incident };
	} catch {
		return { status: "error" };
	}
}
