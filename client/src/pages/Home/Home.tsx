import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

import bgHome from "@/assets/images/background-home.jpg";
import VigieLogo from "@/assets/images/vigie-ligne.svg?react";
import EmailVerificationBanner from "@/components/EmailVerificationBanner/EmailVerificationBanner";
import Icon from "@/components/Icon/Icon";
import { IncidentSearchField } from "@/components/IncidentList/IncidentFilters";
import IncidentList from "@/components/IncidentList/IncidentList";
import IncidentOptionsMenu from "@/components/IncidentList/IncidentOptionsMenu";
import IncidentMap from "@/components/IncidentMap/IncidentMap";
import WelcomeToast from "@/components/WelcomeToast/WelcomeToast";
import { useAuth } from "@/contexts/auth/AuthContext";
import { getAllIncidents } from "@/services/incidentService";
import type { Bounds } from "@/types/bounds";
import type { IncidentListItem, IncidentSort } from "@/types/incidentList";
import { getStartView } from "@/utils/getDefaultMapCenter";
import { useDebouncedValue } from "./useDebouncedValue";
import { useDeviceLocation } from "./useDeviceLocation";

const INCIDENTS_LIST_LIMIT = 15;
// Même plafond que MAX_LIST_LIMIT côté serveur : une recherche, ou les résolus
// inclus, listent tous les résultats au lieu de la page par défaut.
const EXTENDED_LIST_LIMIT = 100;
const SEARCH_DEBOUNCE_MS = 300;

export default function Home() {
	const { user, loading: isAuthLoading } = useAuth();
	const deviceLocation = useDeviceLocation();
	// Position de l'appareil, puis adresse principale, puis Paris.
	const startView = useMemo(
		() =>
			getStartView(
				user,
				deviceLocation.status === "found"
					? deviceLocation.position
					: null,
			),
		[user, deviceLocation],
	);
	const [incidents, setIncidents] = useState<IncidentListItem[]>([]);
	const [isTruncated, setIsTruncated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState<IncidentSort>("date");
	const [includeResolved, setIncludeResolved] = useState(false);
	// Recherche appliquée : attend une pause de frappe, sans espaces aux extrémités.
	const [debouncedSearch, applySearchNow] = useDebouncedValue(
		searchTerm,
		SEARCH_DEBOUNCE_MS,
	);
	const search = debouncedSearch.trim();
	const listLimit =
		search === "" && !includeResolved
			? INCIDENTS_LIST_LIMIT
			: EXTENDED_LIST_LIMIT;
	// Zone visible de la carte, inconnue tant qu'elle n'a pas signalé la sienne.
	const [bounds, setBounds] = useState<Bounds | null>(null);
	// Une recherche ignore la zone : la liste ne dépend alors pas de ses changements.
	const zone = search === "" ? bounds : null;
	const criteria = `${listLimit}|${search}|${sortBy}|${includeResolved}`;
	// Critères de la dernière liste affichée : seule la zone change, la liste reste en place.
	const loadedCriteriaRef = useRef<string | null>(null);
	// Seule la réponse à la dernière requête est retenue.
	const latestRequestRef = useRef(0);
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

	// Entrée : la recherche part sans attendre, et le focus passe à la liste
	// (le clavier mobile se referme, le clavier physique peut avancer).
	function handleSearchSubmit() {
		applySearchNow();
		document.getElementById("incident-list")?.focus();
	}

	const loadIncidents = useCallback(() => {
		latestRequestRef.current += 1;
		const requestId = latestRequestRef.current;
		if (loadedCriteriaRef.current !== criteria) setIsLoading(true);
		setHasError(false);

		// Sans recherche, la liste attend la première zone de la carte.
		if (search === "" && zone === null) return;

		getAllIncidents({
			limit: listLimit,
			search,
			sort: sortBy,
			includeResolved,
			bounds: zone,
		}).then((result) => {
			if (requestId !== latestRequestRef.current) return; // réponse périmée

			if (result.status === "ok") {
				setIncidents(result.incidents);
				setIsTruncated(result.truncated);
				loadedCriteriaRef.current = criteria;
			} else {
				setHasError(true);
			}
			setIsLoading(false);
		});
	}, [listLimit, search, sortBy, includeResolved, zone, criteria]);

	useEffect(() => {
		loadIncidents();
	}, [loadIncidents]);

	const showsEmailVerificationBanner = user != null && !user.emailVerified;

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

			<div
				className={`relative shrink-0 px-4 ${showsEmailVerificationBanner ? "" : "-mt-8"}`}
			>
				<a
					href="#incident-list"
					className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-6 focus:z-1100 focus:rounded-full focus:bg-accent focus:px-3 focus:py-1 focus:text-xs focus:font-bold focus:text-primary"
				>
					Aller à la liste des incidents
				</a>
				{isAuthLoading ? (
					// La carte attend l'utilisateur : son adresse décide du point de départ.
					<div
						aria-hidden="true"
						className="skeleton h-[38vh] w-full rounded-2xl"
					/>
				) : (
					<IncidentMap
						selectedIncidentId={selectedIncidentId}
						onSelectIncident={setSelectedIncidentId}
						panRequest={mapPanRequest}
						includeResolved={includeResolved}
						onBoundsChange={setBounds}
						startView={startView}
						isStartViewFinal={deviceLocation.status !== "locating"}
						searchActive={searchTerm.trim() !== ""}
						className="h-[38vh] w-full overflow-hidden rounded-2xl"
					/>
				)}
				{/* Au-dessus des commandes de Leaflet (z-index 1000). */}
				<div className="pointer-events-none absolute top-2 right-6 left-6 z-1100 flex items-start justify-between gap-2">
					<div className="pointer-events-auto min-w-0 flex-1">
						<IncidentSearchField
							value={searchTerm}
							onChange={setSearchTerm}
							onSubmit={handleSearchSubmit}
						/>
					</div>
					<div className="pointer-events-auto shrink-0">
						<IncidentOptionsMenu
							includeResolved={includeResolved}
							onIncludeResolvedChange={setIncludeResolved}
						/>
					</div>
				</div>
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
					isTruncated={isTruncated}
					limit={listLimit}
					search={search}
					includeResolved={includeResolved}
					sortBy={sortBy}
					onSortChange={setSortBy}
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
