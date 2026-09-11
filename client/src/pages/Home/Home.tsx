import { useCallback, useEffect, useState } from "react";

import IncidentList from "@/components/IncidentList/IncidentList";
import { getAllIncidents } from "@/services/incidentService";
import type { IncidentListItem } from "@/types/incidentList";

const INCIDENTS_LIST_LIMIT = 15;

export default function Home() {
	const [incidents, setIncidents] = useState<IncidentListItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);

	const loadIncidents = useCallback(() => {
		setIsLoading(true);
		setHasError(false);

		let cancelled = false;

		getAllIncidents(INCIDENTS_LIST_LIMIT).then((result) => {
			if (cancelled) return;

			if (result.status === "ok") {
				setIncidents(result.incidents);
			} else {
				setHasError(true);
			}
			setIsLoading(false);
		});

		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		return loadIncidents();
	}, [loadIncidents]);

	return (
		<div className="flex flex-col gap-4 p-4">
			<h1 className="font-title text-2xl font-bold text-primary">
				Vigie
			</h1>

			<IncidentList
				incidents={incidents}
				isLoading={isLoading}
				hasError={hasError}
				onRetry={loadIncidents}
				limit={INCIDENTS_LIST_LIMIT}
			/>

			{/* US04 : <IncidentMap incidents={incidents} isLoading={isLoading} hasError={hasError} /> viendra ici, même donnée */}
		</div>
	);
}
