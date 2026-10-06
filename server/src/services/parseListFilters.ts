export const INCIDENT_SORTS = ["date", "severity"] as const;
export type IncidentSort = (typeof INCIDENT_SORTS)[number];

export const MAX_SEARCH_LENGTH = 100;

export type ListFilters = {
	includeResolved: boolean;
	sort: IncidentSort;
	search: string | null;
};

export type ParsedListFilters =
	| { status: "ok"; filters: ListFilters }
	| { status: "invalid" };

// `sort` et `includeResolved` retombent sur leur valeur par défaut si elles sont
// absentes ou inconnues. Seule `search` est refusée (« invalid ») : elle doit
// être une chaîne d'au plus MAX_SEARCH_LENGTH caractères, sans quoi la tronquer
// changerait silencieusement les résultats.
export default function parseListFilters(query: {
	search?: unknown;
	sort?: unknown;
	includeResolved?: unknown;
}): ParsedListFilters {
	const sort = INCIDENT_SORTS.find((value) => value === query.sort) ?? "date";
	const includeResolved = query.includeResolved === "true";

	if (query.search === undefined) {
		return {
			status: "ok",
			filters: { includeResolved, sort, search: null },
		};
	}
	if (typeof query.search !== "string") return { status: "invalid" };

	const search = query.search.trim();
	if (search.length > MAX_SEARCH_LENGTH) return { status: "invalid" };

	return {
		status: "ok",
		filters: {
			includeResolved,
			sort,
			search: search === "" ? null : search,
		},
	};
}
