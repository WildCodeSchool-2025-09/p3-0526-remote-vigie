import { apiFetch } from "@/services/apiClient";
import type { WeatherVigilance } from "@/types/vigilance";

// 200 → vigilance ; tout le reste (204, 401, 500, réseau) → null = pas de bandeau.
export async function getWeatherVigilance(): Promise<WeatherVigilance | null> {
	try {
		const res = await apiFetch("/api/weather-vigilance");
		if (res.status !== 200) return null;

		return (await res.json()) as WeatherVigilance;
	} catch {
		return null; // réseau, JSON illisible
	}
}
