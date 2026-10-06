import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";

import bgHome from "@/assets/images/background-home.jpg";
import VigieLogo from "@/assets/images/vigie-ligne.svg?react";
import EmailVerificationBanner from "@/components/EmailVerificationBanner/EmailVerificationBanner";
import Icon from "@/components/Icon/Icon";
import IncidentList from "@/components/IncidentList/IncidentList";
import IncidentMap from "@/components/IncidentMap/IncidentMap";
import PushOptInBanner from "@/components/PushOptInBanner/PushOptInBanner";
import { usePushOptIn } from "@/components/PushOptInBanner/usePushOptIn";
import WelcomeToast from "@/components/WelcomeToast/WelcomeToast";
import { useAuth } from "@/contexts/auth/AuthContext";
import { getAllIncidents } from "@/services/incidentService";
import type { IncidentListItem } from "@/types/incidentList";

const INCIDENTS_LIST_LIMIT = 15;

export default function Home() {
	const { user } = useAuth();
	const pushOptIn = usePushOptIn();
	const [incidents, setIncidents] = useState<IncidentListItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);
	// Incident sélectionné, partagé entre la carte et la liste.
	const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(
		null,
	);
	// Recentrage demandé à la carte quand la sélection vient de la liste.
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

	const showsEmailVerificationBanner = user != null && !user.emailVerified;
	const showsTopBanner = showsEmailVerificationBanner || pushOptIn.visible;

	return (
		<div className="flex h-full flex-col bg-base-100">
			<WelcomeToast />
			<header className="relative isolate flex h-36 shrink-0 flex-col justify-end overflow-hidden bg-primary px-4 pt-4 pb-16">
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

			{showsEmailVerificationBanner && (
				<div className="relative -mt-8 mb-4 px-4">
					<EmailVerificationBanner email={user.email} />
				</div>
			)}

			{pushOptIn.visible && (
				<div
					className={`relative mb-4 px-4 ${showsEmailVerificationBanner ? "" : "-mt-8"}`}
				>
					<PushOptInBanner
						accepting={pushOptIn.accepting}
						error={pushOptIn.error}
						onAccept={pushOptIn.accept}
						onDismiss={pushOptIn.dismiss}
					/>
				</div>
			)}

			<div
				className={`relative shrink-0 px-4 ${showsTopBanner ? "" : "-mt-8"}`}
			>
				<a
					href="#incident-list"
					className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-6 focus:z-1100 focus:rounded-full focus:bg-accent focus:px-3 focus:py-1 focus:text-xs focus:font-bold focus:text-primary"
				>
					Aller à la liste des incidents
				</a>
				<IncidentMap
					selectedIncidentId={selectedIncidentId}
					onSelectIncident={setSelectedIncidentId}
					panRequest={mapPanRequest}
					className="h-[38vh] w-full overflow-hidden rounded-2xl"
				/>
			</div>

			<section
				id="incident-list"
				tabIndex={-1}
				aria-label="Liste des incidents"
				className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6 focus:outline-none"
			>
				<IncidentList
					incidents={incidents}
					isLoading={isLoading}
					hasError={hasError}
					onRetry={loadIncidents}
					limit={INCIDENTS_LIST_LIMIT}
					selectedIncidentId={selectedIncidentId}
					onSelectIncident={handleSelectFromList}
				/>

				<Link
					to="/numbers"
					className="flex w-full items-center gap-3 rounded-2xl bg-accent px-5 py-3"
				>
					<span className="btn btn-square btn-md shrink-0 rounded-2xl border-none bg-primary">
						<Icon
							name="phoneFlip"
							className="h-5 w-5 fill-accent"
							aria-hidden="true"
						/>
					</span>
					<div className="min-w-0 flex-1">
						<p className="font-title text-lg font-bold text-primary">
							Numéros utiles
						</p>
						<p className="mt-0.5 text-sm text-primary/70">
							Urgences, santé et services
						</p>
					</div>
					<Icon
						name="angleSmallRight"
						className="h-4 w-4 shrink-0 fill-primary/60"
						aria-hidden="true"
					/>
				</Link>
			</section>
		</div>
	);
}
