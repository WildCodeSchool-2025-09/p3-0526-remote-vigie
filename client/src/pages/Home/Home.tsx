import { useCallback, useEffect, useState } from "react";

import bgHome from "@/assets/images/backgroud-home.jpg";
import VigieLogo from "@/assets/images/vigie-ligne.svg?react";
import IncidentList from "@/components/IncidentList/IncidentList";
import IncidentMap from "@/components/IncidentMap/IncidentMap";
import { getAllIncidents } from "@/services/incidentService";
import type { IncidentListItem } from "@/types/incidentList";

const INCIDENTS_LIST_LIMIT = 15;

export default function Home() {
	const [incidents, setIncidents] = useState<IncidentListItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);
	// Partagé avec IncidentMap (clic en deux temps) et IncidentList (surbrillance) —
	// voir plan US04, décision du 24/09.
	const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(
		null,
	);
	// Demande de recentrage transmise à IncidentMap quand la sélection vient
	// d'une carte de la liste plutôt que d'un marqueur (décision du 25/09) —
	// Home.tsx n'a pas accès à l'instance Leaflet, seule IncidentMap l'a.
	const [mapPanRequest, setMapPanRequest] = useState<{
		lat: number;
		lng: number;
	} | null>(null);

	const handleSelectFromList = useCallback((incident: IncidentListItem) => {
		setSelectedIncidentId(incident.id);
		setMapPanRequest({
			lat: Number(incident.latitude),
			lng: Number(incident.longitude),
		});
	}, []);

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

	// Chevauchement avec le header : c'est la carte qui le porte (premier
	// élément sous le header) — repris de la dette technique tracée sur US03
	// depuis le 18/09, avec l'US04.
	// Comportement de défilement tranché le 25/09 : header et carte restent
	// fixes, seule la liste défile en dessous. La carte est donc sortie du
	// conteneur `overflow-y-auto` (plutôt qu'un `position: sticky` sur place),
	// pour un layout à trois blocs empilés simple à raisonner : header / carte
	// / zone de liste qui défile.
	return (
		<div className="flex h-full flex-col bg-base-100">
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

			<div className="-mt-8 shrink-0 px-4">
				<IncidentMap
					selectedIncidentId={selectedIncidentId}
					onSelectIncident={setSelectedIncidentId}
					panRequest={mapPanRequest}
					className="h-[38vh] w-full overflow-hidden rounded-2xl"
				/>
			</div>

			<div className="mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-6">
				<IncidentList
					incidents={incidents}
					isLoading={isLoading}
					hasError={hasError}
					onRetry={loadIncidents}
					limit={INCIDENTS_LIST_LIMIT}
					selectedIncidentId={selectedIncidentId}
					onSelectIncident={handleSelectFromList}
				/>
			</div>
		</div>
	);
}
