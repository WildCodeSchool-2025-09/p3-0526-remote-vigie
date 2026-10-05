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

// Mêmes valeurs que FRANCE_BOUNDS dans client/src/utils/franceBounds.ts (à garder
// synchronisées).
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

// Interroge Overpass pour une catégorie, avec réessai ; lève une erreur si tout
// échoue. Une réponse partielle (`remark`) ou vide compte comme un échec.
async function fetchElements(
	category: UsefulPlaceCategory,
): Promise<OverpassElement[]> {
	const query = buildQuery(category);
	let lastMessage = "";

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
				remark?: string;
			};
			if (result.remark) {
				throw new Error(
					`Réponse partielle d'Overpass : ${result.remark}`,
				);
			}

			const elements = result.elements ?? [];
			if (elements.length === 0) {
				throw new Error("Aucun élément renvoyé");
			}
			return elements;
		} catch (error) {
			lastMessage =
				error instanceof Error ? error.message : String(error);
			console.error(
				`Échec de la requête Overpass pour "${category}" (tentative ${attempt}/${MAX_ATTEMPTS})`,
				lastMessage,
			);
			if (attempt < MAX_ATTEMPTS) {
				await sleep(RETRY_DELAY_MS);
			}
		}
	}

	throw new Error(
		`Overpass : échec pour "${category}" après ${MAX_ATTEMPTS} tentatives (${lastMessage})`,
	);
}

// Tailles des colonnes de `useful_place` (voir schema.sql).
const NAME_MAX_LENGTH = 150;
const STREET_MAX_LENGTH = 255;
const CITY_MAX_LENGTH = 100;
const PHONE_MAX_LENGTH = 20;

// Compte en caractères, comme MySQL (et non en unités UTF-16) : ne coupe pas un
// emoji en deux.
function truncate(value: string, maxLength: number): string {
	const characters = Array.from(value);
	return characters.length <= maxLength
		? value
		: characters.slice(0, maxLength).join("");
}

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

	const streetLine =
		street == null
			? null
			: houseNumber != null
				? `${houseNumber} ${street}`
				: street;

	return {
		streetLine:
			streetLine == null ? null : truncate(streetLine, STREET_MAX_LENGTH),
		city: city == null ? null : truncate(city, CITY_MAX_LENGTH),
	};
}

function resolvePhone(tags: Record<string, string>): string | null {
	const raw = tags.phone ?? tags["contact:phone"];
	if (raw == null) return null;

	const firstNumber = raw.split(";")[0].trim();
	return truncate(firstNumber, PHONE_MAX_LENGTH);
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
		name: truncate(name, NAME_MAX_LENGTH),
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

// Au-delà de cette part de la catégorie, le retrait est refusé : un résultat
// partiel d'Overpass ne doit pas vider la carte.
const MAX_PURGE_RATIO = 0.5;

const CATEGORIES = Object.keys(CATEGORY_OVERPASS_TAGS) as UsefulPlaceCategory[];

function toKey(osmType: string, osmId: number): string {
	return `${osmType}/${osmId}`;
}

// Retire les lieux importés qui ne figurent plus dans la réponse d'Overpass
// (lieu fermé ou supprimé d'OpenStreetMap depuis la dernière synchro).
async function removeStalePlaces(
	category: UsefulPlaceCategory,
	keptRows: UsefulPlaceUpsertRow[],
): Promise<number> {
	const existing = await usefulPlaceRepository.readSyncKeys(category);
	const keptKeys = new Set(
		keptRows.map((row) => toKey(row.osmType, row.osmId)),
	);
	const staleIds = existing
		.filter(({ osmType, osmId }) => !keptKeys.has(toKey(osmType, osmId)))
		.map(({ id }) => id);

	if (staleIds.length === 0) return 0;

	if (staleIds.length > existing.length * MAX_PURGE_RATIO) {
		throw new Error(
			`retrait refusé : ${staleIds.length} lieux sur ${existing.length} seraient supprimés`,
		);
	}

	await usefulPlaceRepository.deleteByIds(staleIds);
	return staleIds.length;
}

async function syncCategory(category: UsefulPlaceCategory): Promise<void> {
	const elements = await fetchElements(category);
	const rows = elements
		.map((element) => transformElement(element, category))
		.filter((row): row is UsefulPlaceUpsertRow => row != null);

	await usefulPlaceRepository.upsertMany(rows);
	const removedCount = await removeStalePlaces(category, rows);

	console.info(
		`[usefulPlaceSyncService] ${category} : ${rows.length}/${elements.length} lieux importés (${elements.length - rows.length} ignorés), ${removedCount} retirés.`,
	);
}

// Synchronise les catégories une par une. Une catégorie en échec n'empêche pas
// les suivantes ; la synchro se termine alors par une erreur qui les nomme.
async function run(
	categories: UsefulPlaceCategory[] = CATEGORIES,
): Promise<void> {
	const failedCategories: UsefulPlaceCategory[] = [];

	for (const [index, category] of categories.entries()) {
		console.info(
			`[usefulPlaceSyncService] ${category} : interrogation d'Overpass…`,
		);

		try {
			await syncCategory(category);
		} catch (error) {
			failedCategories.push(category);
			console.error(
				`[usefulPlaceSyncService] ${category} : échec`,
				error instanceof Error ? error.message : error,
			);
		}

		const isLastCategory = index === categories.length - 1;
		if (!isLastCategory) {
			await sleep(CATEGORY_PAUSE_MS);
		}
	}

	if (failedCategories.length > 0) {
		throw new Error(
			`Synchronisation incomplète, catégories en échec : ${failedCategories.join(", ")}. Pour les relancer : npm run sync:places -- ${failedCategories.join(" ")}`,
		);
	}
}

// Catégories demandées en ligne de commande ; aucune = toutes.
function parseCategories(args: string[]): UsefulPlaceCategory[] {
	if (args.length === 0) return CATEGORIES;

	const unknown = args.filter(
		(arg) => !CATEGORIES.includes(arg as UsefulPlaceCategory),
	);
	if (unknown.length > 0) {
		throw new Error(
			`Catégorie inconnue : ${unknown.join(", ")}. Valeurs possibles : ${CATEGORIES.join(", ")}`,
		);
	}

	return CATEGORIES.filter((category) => args.includes(category));
}

export default {
	transformElement,
	buildQuery,
	fetchElements,
	run,
	parseCategories,
};
export type { OverpassElement };
