const VIGILANCE_URL =
	"https://public-api.meteofrance.fr/public/DPVigilance/v1/cartevigilance/encours";

const TIMEOUT_MS = 3000;

export type VigilanceLevel = "yellow" | "orange" | "red";

// Couleurs Météo-France : 1 vert (pas de bandeau), 2 jaune, 3 orange, 4 rouge.
const LEVELS: Record<number, VigilanceLevel> = {
	2: "yellow",
	3: "orange",
	4: "red",
};

export type Phenomenon =
	| "wind"
	| "rain-flood"
	| "storms"
	| "floods"
	| "snow-ice"
	| "heat-wave"
	| "cold-wave"
	| "avalanches"
	| "waves-submersion";

// Identifiants Météo-France des phénomènes (cf. meteofrance-api).
const PHENOMENA = new Map<string, Phenomenon>([
	["1", "wind"],
	["2", "rain-flood"],
	["3", "storms"],
	["4", "floods"],
	["5", "snow-ice"],
	["6", "heat-wave"],
	["7", "cold-wave"],
	["8", "avalanches"],
	["9", "waves-submersion"],
]);

type TimeSlot = { begin_time?: string; end_time?: string; color_id?: number };

type PhenomenonItem = {
	phenomenon_id?: string;
	phenomenon_max_color_id?: number;
	timelaps_items?: TimeSlot[];
};

type DomainItem = {
	domain_id?: string;
	max_color_id?: number;
	phenomenon_items?: PhenomenonItem[];
};

// Seuls les champs lus ici ; la réponse complète en contient beaucoup d'autres.
type VigilanceMap = {
	product?: {
		update_time?: string;
		periods?: {
			echeance?: string;
			timelaps?: { domain_ids?: DomainItem[] };
		}[];
	};
};

function findDomain(
	map: VigilanceMap | null,
	echeance: "J" | "J1",
	department: string,
): DomainItem | undefined {
	return map?.product?.periods
		?.find((period) => period.echeance === echeance)
		?.timelaps?.domain_ids?.find((item) => item.domain_id === department);
}

// "J" = période du jour ("J1" = demain, ignorée).
export function levelFromMap(
	map: VigilanceMap | null,
	department: string,
): VigilanceLevel | null {
	const domain = findDomain(map, "J", department);

	if (domain?.max_color_id == null) return null;

	return LEVELS[domain.max_color_id] ?? null;
}

export function detailsFromMap(
	map: VigilanceMap | null,
	department: string,
): { phenomena: Phenomenon[]; endTime: string | null } {
	const today = findDomain(map, "J", department);
	const tomorrow = findDomain(map, "J1", department);

	// Phénomènes connus en vigilance aujourd'hui (au moins jaune).
	const todayIds = new Set(
		(today?.phenomenon_items ?? [])
			.filter((item) => (item.phenomenon_max_color_id ?? 1) >= 2)
			.map((item) => item.phenomenon_id ?? "")
			.filter((id) => PHENOMENA.has(id)),
	);

	const phenomena = [...todayIds]
		.map((id) => PHENOMENA.get(id))
		.filter((name): name is Phenomenon => name != null);

	// Fin = dernier créneau coloré de CES phénomènes, aujourd'hui ou demain (J1).
	const endTimes = [today, tomorrow]
		.flatMap((domain) => domain?.phenomenon_items ?? [])
		.filter((item) => todayIds.has(item.phenomenon_id ?? ""))
		.flatMap((item) => item.timelaps_items ?? [])
		.filter((slot) => (slot.color_id ?? 1) >= 2)
		.map((slot) => slot.end_time)
		.filter((end): end is string => end != null)
		.sort();

	return { phenomena, endTime: endTimes.at(-1) ?? null };
}

export type Vigilance = {
	level: VigilanceLevel;
	updatedAt: string | null;
	phenomena: Phenomenon[];
	endTime: string | null;
};

async function getVigilance(department: string): Promise<Vigilance | null> {
	try {
		const res = await fetch(VIGILANCE_URL, {
			headers: { apikey: process.env.METEO_API_KEY ?? "" },
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});
		if (!res.ok) {
			throw new Error(`Response status: ${res.status}`);
		}

		const map = (await res.json()) as VigilanceMap;
		const level = levelFromMap(map, department);
		if (level == null) return null;

		return {
			level,
			updatedAt: map.product?.update_time ?? null,
			...detailsFromMap(map, department),
		};
	} catch (error) {
		console.error(
			error instanceof Error
				? error.message
				: "Erreur inconnue lors de l'appel à la vigilance Météo-France",
			{ department },
		);

		return null;
	}
}

export default { getVigilance };
