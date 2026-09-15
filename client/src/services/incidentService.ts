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
