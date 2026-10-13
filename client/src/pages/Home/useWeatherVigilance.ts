import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/auth/AuthContext";
import { getWeatherVigilance } from "@/services/vigilanceService";
import type { WeatherVigilance } from "@/types/vigilance";

export default function useWeatherVigilance() {
	const { user } = useAuth();
	const userId = user?.id;
	const [isLoading, setIsLoading] = useState(false);
	const [vigilance, setVigilance] = useState<WeatherVigilance | null>(null);

	useEffect(() => {
		setVigilance(null);
		if (userId == null) {
			setIsLoading(false);
			return;
		}

		let cancelled = false;
		setIsLoading(true);

		getWeatherVigilance().then((result) => {
			if (cancelled) return;
			setVigilance(result);
			setIsLoading(false);
		});

		return () => {
			cancelled = true;
		};
	}, [userId]);

	return { isLoading, vigilance };
}
