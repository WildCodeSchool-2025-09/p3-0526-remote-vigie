import { apiFetch } from "@/services/apiClient";
import type { IncidentType } from "@/types/incidentForm";

export async function getIncidentTypes(
	signal?: AbortSignal,
): Promise<IncidentType[]> {
	const response = await apiFetch("/api/incident-types", { signal });
	if (!response.ok) {
		throw new Error(`GET /api/incident-types → ${response.status}`);
	}
	return response.json();
}
