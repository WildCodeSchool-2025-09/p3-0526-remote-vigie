import { useCallback, useEffect, useState } from "react";

import bgHome from "@/assets/images/background-home.jpg";
import VigieLogo from "@/assets/images/vigie-ligne.svg?react";
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

	// Chevauchement avec le header réservé aux états "placeholder" (chargement,
	// erreur, vide) : la vraie liste de cartes n'en a pas besoin. À revoir avec
	// l'US04 : la carte, une fois codée, deviendra l'élément qui chevauche le
	// header, indépendamment de l'état de la liste en dessous.
	const showsPlaceholder = isLoading || hasError || incidents.length === 0;

	return (
		<div className="fixed inset-x-0 top-0 flex h-[calc(100dvh-var(--navigation-height))] flex-col bg-base-100">
			<header className="relative isolate flex h-44 shrink-0 flex-col justify-end overflow-hidden bg-primary px-4 pt-4 pb-12">
				<img
					src={bgHome}
					alt=""
					aria-hidden="true"
					className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70 mix-blend-multiply"
				/>
				<h1>
					<VigieLogo
						role="img"
						aria-label="Vigie"
						className="h-8 w-auto"
					/>
				</h1>
			</header>

			<div
				className={`relative flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto px-4 pb-6 ${showsPlaceholder ? "-mt-8" : ""}`}
			>
				<IncidentList
					incidents={incidents}
					isLoading={isLoading}
					hasError={hasError}
					onRetry={loadIncidents}
					limit={INCIDENTS_LIST_LIMIT}
				/>
			</div>
		</div>
	);
}
