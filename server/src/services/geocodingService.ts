const EMPTY_RESULT = {
	streetLine: null,
	city: null,
	postalCode: null,
	inseeCode: null,
};

const TIMEOUT_MS = 3000;

async function reverse(
	latitude: number,
	longitude: number,
): Promise<{
	streetLine: string | null;
	city: string | null;
	postalCode: string | null;
	inseeCode: string | null;
}> {
	const url = `https://api-adresse.data.gouv.fr/reverse/?lon=${longitude}&lat=${latitude}`;

	try {
		const res = await fetch(url, {
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});
		if (!res.ok) {
			throw new Error(`Response status: ${res.status}`);
		}
		const result = await res.json();
		const properties = result.features[0]?.properties;

		if (!properties) {
			return EMPTY_RESULT;
		}

		return {
			streetLine: properties.name ?? null,
			city: properties.city ?? null,
			postalCode: properties.postcode ?? null,
			inseeCode: properties.citycode ?? null,
		};
	} catch (error) {
		console.error(
			error instanceof Error
				? error.message
				: "Erreur inconnue lors du géocodage inverse",
			{ latitude, longitude },
		);

		return EMPTY_RESULT;
	}
}

async function search(query: string): Promise<
	{
		name: string;
		city: string;
		postalCode: string;
		inseeCode: string;
		latitude: number;
		longitude: number;
	}[]
> {
	const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}`;

	try {
		const res = await fetch(url, {
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});
		if (!res.ok) {
			throw new Error(`Response status: ${res.status}`);
		}
		const result = await res.json();
		const features = result.features ?? [];

		return features.map(
			(feature: {
				properties: Record<string, string>;
				geometry: { coordinates: [number, number] };
			}) => ({
				name: feature.properties.label,
				city: feature.properties.city,
				postalCode: feature.properties.postcode,
				inseeCode: feature.properties.citycode,
				latitude: feature.geometry.coordinates[1],
				longitude: feature.geometry.coordinates[0],
			}),
		);
	} catch (error) {
		console.error(
			error instanceof Error
				? error.message
				: "Erreur inconnue lors de la recherche d'adresse",
			{ query },
		);

		throw error;
	}
}

async function geocodeCentroid(
	city: string,
	postalCode: string,
): Promise<{
	inseeCode: string;
	latitude: number;
	longitude: number;
} | null> {
	const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(city)}&postcode=${encodeURIComponent(postalCode)}&type=municipality&limit=1`;

	try {
		const res = await fetch(url, {
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});
		if (!res.ok) {
			throw new Error(`Response status: ${res.status}`);
		}
		const result = await res.json();
		const feature = result.features?.[0];

		if (!feature) {
			return null;
		}

		return {
			inseeCode: feature.properties.citycode,
			latitude: feature.geometry.coordinates[1],
			longitude: feature.geometry.coordinates[0],
		};
	} catch (error) {
		console.error(
			error instanceof Error
				? error.message
				: "Erreur inconnue lors de la recherche",
			{ city, postalCode },
		);

		return null;
	}
}

export default { reverse, search, geocodeCentroid };
