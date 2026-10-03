import usefulPlaceRepository from "../modules/usefulPlace/usefulPlaceRepository";
import type {
	UsefulPlaceCategory,
	UsefulPlaceUpsertRow,
} from "../modules/usefulPlace/usefulPlaceRepository";

// Élément Overpass : un `node` a lat/lon, un `way`/`relation` a `center`.
type OverpassElement = {
	type: "node" | "way" | "relation";
	id: number;
	lat?: number;
	lon?: number;
	center?: { lat: number; lon: number };
	tags?: Record<string, string>;
};

// Catégorie (`useful_place.category`) → tag OSM à interroger.
const CATEGORY_OVERPASS_TAGS: Record<
	UsefulPlaceCategory,
	{ key: string; value: string }
> = {
	fire_station: { key: "amenity", value: "fire_station" },
	veterinary: { key: "amenity", value: "veterinary" },
	hospital: { key: "amenity", value: "hospital" },
	pharmacy: { key: "amenity", value: "pharmacy" },
	police: { key: "amenity", value: "police" },
};

// Mêmes valeurs que FRANCE_BOUNDS dans IncidentMap.tsx (à garder synchronisées).
const FRANCE_BOUNDS = { south: 41.0, west: -5.5, north: 51.5, east: 9.8 };

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const OVERPASS_TIMEOUT_SECONDS = 180;
// Un peu plus que le timeout Overpass (OVERPASS_TIMEOUT_SECONDS).
const FETCH_TIMEOUT_MS = 190_000;
const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 5000;

function buildQuery(category: UsefulPlaceCategory): string {
	const { key, value } = CATEGORY_OVERPASS_TAGS[category];
	const { south, west, north, east } = FRANCE_BOUNDS;

	return `[out:json][timeout:${OVERPASS_TIMEOUT_SECONDS}];
area["ISO3166-1"="FR"][admin_level=2]->.fr;
nwr["${key}"="${value}"](area.fr)(${south},${west},${north},${east});
out center tags;`;
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Interroge Overpass pour une catégorie, avec réessai ; renvoie [] si tout échoue.
async function fetchElements(
	category: UsefulPlaceCategory,
): Promise<OverpassElement[]> {
	const query = buildQuery(category);

	for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
		try {
			const res = await fetch(OVERPASS_URL, {
				method: "POST",
				headers: {
					"Content-Type": "text/plain",
					"User-Agent":
						"Vigie/1.0 (projet étudiant Wild Code School)",
				},
				body: query,
				signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
			});

			if (!res.ok) {
				throw new Error(`Response status: ${res.status}`);
			}

			const result = (await res.json()) as {
				elements?: OverpassElement[];
			};
			return result.elements ?? [];
		} catch (error) {
			console.error(
				`Échec de la requête Overpass pour "${category}" (tentative ${attempt}/${MAX_ATTEMPTS})`,
				error instanceof Error ? error.message : error,
			);
			if (attempt < MAX_ATTEMPTS) {
				await sleep(RETRY_DELAY_MS);
			}
		}
	}

	return [];
}

// Taille de la colonne `phone_number`.
const PHONE_MAX_LENGTH = 20;

// Préfixes OSM marquant un lieu fermé.
const CLOSED_TAG_PREFIXES = ["disused:", "was:", "abandoned:"];

function isClosed(tags: Record<string, string>): boolean {
	if (tags.office === "vacant") return true;
	return Object.keys(tags).some((key) =>
		CLOSED_TAG_PREFIXES.some((prefix) => key.startsWith(prefix)),
	);
}

function resolveCoordinates(
	element: OverpassElement,
): { latitude: number; longitude: number } | null {
	if (element.type === "node") {
		if (element.lat == null || element.lon == null) return null;
		return { latitude: element.lat, longitude: element.lon };
	}
	if (element.center == null) return null;
	return { latitude: element.center.lat, longitude: element.center.lon };
}

function resolveAddress(tags: Record<string, string>): {
	streetLine: string | null;
	city: string | null;
} {
	const houseNumber = tags["addr:housenumber"] ?? tags["contact:housenumber"];
	const street = tags["addr:street"] ?? tags["contact:street"];
	const city = tags["addr:city"] ?? tags["contact:city"] ?? null;

	if (street == null) {
		return { streetLine: null, city };
	}

	const streetLine =
		houseNumber != null ? `${houseNumber} ${street}` : street;
	return { streetLine, city };
}

function resolvePhone(tags: Record<string, string>): string | null {
	const raw = tags.phone ?? tags["contact:phone"];
	if (raw == null) return null;

	const firstNumber = raw.split(";")[0].trim();
	return firstNumber.slice(0, PHONE_MAX_LENGTH);
}

// Transforme un élément Overpass en ligne `useful_place`, ou `null` s'il faut
// l'ignorer (lieu fermé, ni nom ni exploitant). Fonction pure.
function transformElement(
	element: OverpassElement,
	category: UsefulPlaceCategory,
): UsefulPlaceUpsertRow | null {
	const tags = element.tags ?? {};

	if (isClosed(tags)) return null;

	const name = tags.name ?? tags.operator;
	if (name == null) return null;

	const coordinates = resolveCoordinates(element);
	if (coordinates == null) return null;

	if (tags.fixme != null) {
		console.warn(
			`useful_place ${element.type}/${element.id} a un tag "fixme" laissé par un contributeur OSM : ${tags.fixme}`,
		);
	}

	const { streetLine, city } = resolveAddress(tags);

	return {
		name,
		category,
		latitude: coordinates.latitude,
		longitude: coordinates.longitude,
		streetLine,
		city,
		phoneNumber: resolvePhone(tags),
		osmType: element.type,
		osmId: element.id,
	};
}

// Pause entre deux catégories (courtoisie envers Overpass).
const CATEGORY_PAUSE_MS = 2000;

const CATEGORIES = Object.keys(CATEGORY_OVERPASS_TAGS) as UsefulPlaceCategory[];

// Synchronise les catégories une par une : récupère, transforme et enregistre
// chacune avant de passer à la suivante.
async function run(): Promise<void> {
	for (const [index, category] of CATEGORIES.entries()) {
		console.info(
			`[usefulPlaceSyncService] ${category} : interrogation d'Overpass…`,
		);

		const elements = await fetchElements(category);
		const rows = elements
			.map((element) => transformElement(element, category))
			.filter((row): row is UsefulPlaceUpsertRow => row != null);

		await usefulPlaceRepository.upsertMany(rows);

		console.info(
			`[usefulPlaceSyncService] ${category} : ${rows.length}/${elements.length} lieux importés (${elements.length - rows.length} ignorés).`,
		);

		const isLastCategory = index === CATEGORIES.length - 1;
		if (!isLastCategory) {
			await sleep(CATEGORY_PAUSE_MS);
		}
	}
}

export default { transformElement, buildQuery, fetchElements, run };
export type { OverpassElement };
