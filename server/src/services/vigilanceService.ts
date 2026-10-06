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

// Seuls les champs lus ici ; la réponse complète en contient beaucoup d'autres.
type VigilanceMap = {
	product?: {
		periods?: {
			echeance?: string;
			timelaps?: {
				domain_ids?: { domain_id?: string; max_color_id?: number }[];
			};
		}[];
	};
};

// "J" = période du jour ("J1" = demain, ignorée).
export function levelFromMap(
	map: VigilanceMap | null,
	department: string,
): VigilanceLevel | null {
	const today = map?.product?.periods?.find(
		(period) => period.echeance === "J",
	);
	const domain = today?.timelaps?.domain_ids?.find(
		(item) => item.domain_id === department,
	);

	if (domain?.max_color_id == null) return null;

	return LEVELS[domain.max_color_id] ?? null;
}

async function getVigilanceLevel(
	department: string,
): Promise<VigilanceLevel | null> {
	try {
		const res = await fetch(VIGILANCE_URL, {
			headers: { apikey: process.env.METEO_API_KEY ?? "" },
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});
		if (!res.ok) {
			throw new Error(`Response status: ${res.status}`);
		}

		return levelFromMap((await res.json()) as VigilanceMap, department);
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

export default { getVigilanceLevel };
