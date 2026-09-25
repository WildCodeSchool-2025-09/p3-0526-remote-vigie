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

export default { reverse };
