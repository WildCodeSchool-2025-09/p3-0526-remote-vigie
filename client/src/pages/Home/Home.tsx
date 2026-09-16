import { useCallback, useEffect, useState } from "react";

import bgHome from "@/assets/images/backgroud-home.jpg";
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
		<div className="flex h-full flex-col bg-base-100">
			{/* Commune en dur en attendant la géolocalisation. */}
			<header className="relative isolate flex h-44 shrink-0 flex-col justify-end overflow-hidden bg-primary px-4 pt-4 pb-12">
				<img
					src={bgHome}
					alt=""
					aria-hidden="true"
					className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70 mix-blend-multiply"
				/>
				<h1 className="font-title text-2xl font-bold text-accent">
					Vigie
				</h1>
				<p className="mt-1 text-sm text-white/85">Alès (30100)</p>
			</header>

			<div className="relative -mt-8 flex min-h-0 flex-1 flex-col space-y-4 px-4 pb-6">
				{/* <section className="rounded-2xl bg-base-300 p-4"> */}
					{/* US04 : <IncidentMap incidents={incidents} isLoading={isLoading} hasError={hasError} /> viendra ici, même donnée. Encart séparé de celui de la liste, taille/scroll à définir avec l'US04. */}
				{/* </section> */}

				<section className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-2xl bg-base-300 p-4">
					<IncidentList
						incidents={incidents}
						isLoading={isLoading}
						hasError={hasError}
						onRetry={loadIncidents}
						limit={INCIDENTS_LIST_LIMIT}
					/>
				</section>
			</div>
		</div>
	);
}
