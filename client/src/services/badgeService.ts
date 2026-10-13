import { apiFetch } from "@/services/apiClient";
import type { Badge } from "@/types/badge";

async function getMyBadges(): Promise<Badge[]> {
	const response = await apiFetch("/api/badges/me");
	if (!response.ok)
		throw new Error("Erreur lors de la récupération des badges");
	return response.json() as Promise<Badge[]>;
}

export default {
	getMyBadges,
};
