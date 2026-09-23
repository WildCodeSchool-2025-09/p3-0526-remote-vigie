import { getIncidentTypes } from "@/services/incidentTypeService";
import type { IncidentType } from "@/types/incidentForm";
import { useCallback, useEffect, useState } from "react";

export default function useIncidentTypes(enabled: boolean) {
	const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
	const [loadingTypes, setLoadingTypes] = useState(true);
	const [typesError, setTypesError] = useState<string | null>(null);

	const loadIncidentTypes = useCallback((signal?: AbortSignal) => {
		setLoadingTypes(true);
		setTypesError(null);

		getIncidentTypes(signal)
			.then((types) => {
				setIncidentTypes(types);
				setLoadingTypes(false);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				setTypesError(
					"Impossible de charger les types de signalement...",
				);
				setLoadingTypes(false);
			});
	}, []);

	useEffect(() => {
		if (!enabled) return;

		const controller = new AbortController();
		loadIncidentTypes(controller.signal);
		return () => controller.abort();
	}, [loadIncidentTypes, enabled]);

	return {
		incidentTypes,
		loadingTypes,
		typesError,
		onRetry: () => loadIncidentTypes(),
	};
}
