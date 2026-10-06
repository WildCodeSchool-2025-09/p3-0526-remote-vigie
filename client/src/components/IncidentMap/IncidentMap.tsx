import L from "leaflet";
import {
	type CSSProperties,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
	MapContainer,
	Marker,
	Popup,
	TileLayer,
	ZoomControl,
	useMap,
	useMapEvents,
} from "react-leaflet";
import { Link } from "react-router";
import "leaflet/dist/leaflet.css";

import { type IconName, icons } from "@/assets/icons";
import UsefulPlaceMarker from "@/components/UsefulPlaceMarker/UsefulPlaceMarker";
import { useAuth } from "@/contexts/auth/AuthContext";
import {
	MAP_INCIDENTS_LIMIT,
	getIncidentsInBounds,
} from "@/services/incidentService";
import {
	USEFUL_PLACES_LIMIT,
	getUsefulPlaces,
} from "@/services/usefulPlaceService";
import type { Bounds } from "@/types/bounds";
import type { IncidentListItem } from "@/types/incidentList";
import type { UsefulPlace } from "@/types/usefulPlace";
import { FRANCE_BOUNDS } from "@/utils/franceBounds";
import { getDefaultMapCenter } from "@/utils/getDefaultMapCenter";
import { useDelayedFlag } from "./useDelayedFlag";

const DEFAULT_ZOOM = 6;
const MIN_ZOOM = 5;
const SELECTION_ZOOM = 15;
// Sous ce zoom, les lieux utiles ne sont ni chargés ni affichés.
const USEFUL_PLACES_MIN_ZOOM = 14;
// L'indice « Zoomez… » n'apparaît qu'à partir de ce zoom, assez près pour que zoomer révèle des lieux.
const ZOOM_HINT_MIN_ZOOM = 11;
const SELECTION_TRANSITION_DURATION_SECONDS = 1;
const MAP_TRANSITION_FADE_MS = 900;
const BOUNDS_FETCH_DEBOUNCE_MS = 400;
// Un message de chargement n'apparaît que si l'attente dépasse ce délai.
const LOADING_MESSAGE_DELAY_MS = 400;
const LOADING_MESSAGE_MIN_VISIBLE_MS = 400;

// Vrai si aucune nouvelle tuile n'est à charger (même zoom, point déjà visible).
function isTargetAlreadyInView(map: L.Map, lat: number, lng: number): boolean {
	return (
		map.getZoom() === SELECTION_ZOOM && map.getBounds().contains([lat, lng])
	);
}

function leafletBoundsToBounds(bounds: L.LatLngBounds): Bounds {
	return {
		north: bounds.getNorth(),
		south: bounds.getSouth(),
		east: bounds.getEast(),
		west: bounds.getWest(),
	};
}

// Gris neutre des incidents résolus : 5,3:1 sur blanc, sans rapport avec la couleur d'un type.
const RESOLVED_MARKER_COLOR = "#6b6b6b";

// Icône du marqueur : pastille blanche cerclée de la couleur du type. Quand
// `isSelected`, elle grossit et un anneau pulse autour. Un incident résolu est
// grisé, plus petit, en pointillés, avec une coche : le gris seul ne suffirait pas.
function createIncidentDivIcon(
	iconName: IconName,
	color: string,
	isSelected: boolean,
	isResolved: boolean,
) {
	const SvgIcon = icons[iconName];
	const CheckIcon = icons.check;
	let size = 36;
	let sizeClass = "size-[36px]";
	let iconSizeClass = "size-[20px]";
	if (isSelected) {
		size = 44;
		sizeClass = "size-[44px]";
		iconSizeClass = "size-[24px]";
	} else if (isResolved) {
		size = 32;
		sizeClass = "size-[32px]";
		iconSizeClass = "size-[18px]";
	}
	const frameClass = isSelected
		? "border-[3px] shadow-[0_0_0_3px_color-mix(in_srgb,var(--marker-color)_35%,transparent)]"
		: "border-2 shadow-[0_1px_4px_rgba(0,0,0,0.3)]";
	const resolvedClass = isResolved ? "border-dashed bg-gray-200" : "bg-white";

	// La couleur du type n'est connue qu'à l'exécution : passée en variable CSS.
	const html = renderToStaticMarkup(
		<div
			className={`animate-pop relative flex items-center justify-center ${sizeClass}`}
			style={{ "--marker-color": color } as CSSProperties}
		>
			{isSelected && (
				<span
					aria-hidden="true"
					className="animate-marker-pulse pointer-events-none absolute inset-0 rounded-full bg-(--marker-color)"
				/>
			)}
			<div
				className={`relative flex items-center justify-center rounded-full border-(--marker-color) ${resolvedClass} ${sizeClass} ${frameClass}`}
			>
				<SvgIcon
					className={`fill-(--marker-color) ${iconSizeClass}`}
					aria-hidden="true"
				/>
			</div>
			{isResolved && (
				<span
					aria-hidden="true"
					className="absolute -right-1 -bottom-1 flex size-[16px] items-center justify-center rounded-full border border-white bg-(--marker-color)"
				>
					<CheckIcon
						className="size-[10px] fill-white"
						aria-hidden="true"
					/>
				</span>
			)}
		</div>,
	);

	return L.divIcon({
		html,
		className: "",
		iconSize: [size, size],
		iconAnchor: [size / 2, size / 2],
	});
}

// Composant sans rendu : seuls les enfants de <MapContainer> accèdent à
// l'instance Leaflet (hooks react-leaflet). Signale la zone visible et le zoom au parent.
function MapViewportWatcher({
	onViewportChange,
}: {
	onViewportChange: (bounds: Bounds, zoom: number) => void;
}) {
	const map = useMapEvents({
		moveend: () =>
			onViewportChange(
				leafletBoundsToBounds(map.getBounds()),
				map.getZoom(),
			),
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: montage uniquement (`map` est stable, `onViewportChange` mémoïsée).
	useEffect(() => {
		onViewportChange(leafletBoundsToBounds(map.getBounds()), map.getZoom());
	}, []);

	return null;
}

// Recentre la carte sur la demande reçue en prop (sélection depuis la liste).
function MapPanRequestWatcher({
	request,
	onTransitionStart,
}: {
	request: { lat: number; lng: number } | null;
	onTransitionStart: () => void;
}) {
	const map = useMap();

	useEffect(() => {
		if (request) {
			if (!isTargetAlreadyInView(map, request.lat, request.lng)) {
				onTransitionStart();
			}
			// Une popup restée ouverte gênerait le déplacement (autoPan).
			map.closePopup();
			map.setView([request.lat, request.lng], SELECTION_ZOOM, {
				animate: true,
				duration: SELECTION_TRANSITION_DURATION_SECONDS,
			});
		}
	}, [request, map, onTransitionStart]);

	return null;
}

function IncidentMarker({
	incident,
	isSelected,
	onSelect,
}: {
	incident: IncidentListItem;
	isSelected: boolean;
	onSelect: (incident: IncidentListItem, map: L.Map) => void;
}) {
	const map = useMap();

	const iconName: IconName =
		incident.type && incident.type.icon in icons
			? (incident.type.icon as IconName)
			: "marker";
	const isResolved = incident.status === "resolved";
	const color = isResolved
		? RESOLVED_MARKER_COLOR
		: (incident.type?.color ?? "var(--primary)");

	const icon = useMemo(
		() => createIncidentDivIcon(iconName, color, isSelected, isResolved),
		[iconName, color, isSelected, isResolved],
	);

	return (
		<Marker
			position={[Number(incident.latitude), Number(incident.longitude)]}
			icon={icon}
			title={`${incident.type?.label ?? "Incident"} : ${incident.title}${
				incident.city ? `, ${incident.city}` : ""
			}${isResolved ? " (résolu)" : ""}`}
			eventHandlers={{ click: () => onSelect(incident, map) }}
		>
			<Popup>
				<p className="font-title text-sm font-bold text-primary">
					{incident.title}
				</p>
				{isResolved && (
					<p className="mt-1 text-xs font-bold text-primary/70">
						Incident résolu
					</p>
				)}
				<div className="mt-2 flex justify-center">
					<Link
						to={`/incident/${incident.id}`}
						className="btn btn-accent btn-xs rounded-full"
					>
						Voir les détails
					</Link>
				</div>
			</Popup>
		</Marker>
	);
}

type IncidentMapProps = {
	selectedIncidentId: number | null;
	onSelectIncident: (id: number) => void;
	// Demande de recentrage venue de la liste.
	panRequest?: { lat: number; lng: number } | null;
	// Montre aussi les incidents résolus (sinon : seulement ceux en cours).
	includeResolved?: boolean;
	className?: string;
};

export default function IncidentMap({
	selectedIncidentId,
	onSelectIncident,
	panRequest = null,
	includeResolved = false,
	className = "h-[38vh] w-full",
}: IncidentMapProps) {
	const { user } = useAuth();

	// Données propres à la carte, indépendantes de la liste (zone visible).
	const [mapIncidents, setMapIncidents] = useState<IncidentListItem[]>([]);
	const [mapIncidentsTruncated, setMapIncidentsTruncated] = useState(false);
	const [mapIncidentsLoading, setMapIncidentsLoading] = useState(true);
	const [mapError, setMapError] = useState(false);

	const [usefulPlaces, setUsefulPlaces] = useState<UsefulPlace[]>([]);
	const [usefulPlacesLoading, setUsefulPlacesLoading] = useState(false);
	const [usefulPlacesError, setUsefulPlacesError] = useState(false);
	const [showsZoomHint, setShowsZoomHint] = useState(false);

	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastBoundsRef = useRef<Bounds | null>(null);
	// Lu au moment de la requête : un anti-rebond en attente ne doit pas utiliser un filtre périmé.
	const includeResolvedRef = useRef(includeResolved);
	// Seule la réponse à la dernière requête de signalements est retenue.
	const incidentsRequestRef = useRef(0);

	// Voile affiché pendant le déplacement, le temps que les tuiles se chargent.
	const [isTransitioning, setIsTransitioning] = useState(false);
	const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);

	const triggerTransitionFade = useCallback(() => {
		setIsTransitioning(true);
		if (transitionTimeoutRef.current) {
			clearTimeout(transitionTimeoutRef.current);
		}
		transitionTimeoutRef.current = setTimeout(() => {
			setIsTransitioning(false);
		}, MAP_TRANSITION_FADE_MS);
	}, []);

	const loadMapIncidents = useCallback((bounds: Bounds) => {
		incidentsRequestRef.current += 1;
		const requestId = incidentsRequestRef.current;
		setMapIncidentsLoading(true);
		setMapError(false);
		getIncidentsInBounds(bounds, includeResolvedRef.current).then(
			(result) => {
				if (requestId !== incidentsRequestRef.current) return; // réponse périmée
				if (result.status === "ok") {
					setMapIncidents(result.incidents);
					setMapIncidentsTruncated(result.truncated);
				} else {
					setMapError(true);
				}
				setMapIncidentsLoading(false);
			},
		);
	}, []);

	// Relance uniquement les signalements, sur la dernière zone demandée.
	const retryMapIncidents = useCallback(() => {
		if (lastBoundsRef.current) loadMapIncidents(lastBoundsRef.current);
	}, [loadMapIncidents]);

	const loadUsefulPlaces = useCallback((bounds: Bounds, zoom: number) => {
		if (zoom < USEFUL_PLACES_MIN_ZOOM) {
			setShowsZoomHint(zoom >= ZOOM_HINT_MIN_ZOOM);
			setUsefulPlaces([]);
			setUsefulPlacesLoading(false);
			setUsefulPlacesError(false);
			return;
		}

		setShowsZoomHint(false);
		setUsefulPlacesLoading(true);
		setUsefulPlacesError(false);
		getUsefulPlaces(bounds).then((result) => {
			if (lastBoundsRef.current !== bounds) return;
			if (result.status === "ok") {
				setUsefulPlaces(result.usefulPlaces);
			} else {
				setUsefulPlacesError(true);
			}
			setUsefulPlacesLoading(false);
		});
	}, []);

	const loadMapData = useCallback(
		(bounds: Bounds, zoom: number) => {
			lastBoundsRef.current = bounds;
			loadMapIncidents(bounds);
			loadUsefulPlaces(bounds, zoom);
		},
		[loadMapIncidents, loadUsefulPlaces],
	);

	const handleViewportChange = useCallback(
		(bounds: Bounds, zoom: number) => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
			debounceRef.current = setTimeout(() => {
				loadMapData(bounds, zoom);
			}, BOUNDS_FETCH_DEBOUNCE_MS);
		},
		[loadMapData],
	);

	// Au changement du filtre, recharge sur la dernière zone connue (aucune au montage).
	useEffect(() => {
		includeResolvedRef.current = includeResolved;
		if (lastBoundsRef.current) loadMapIncidents(lastBoundsRef.current);
	}, [includeResolved, loadMapIncidents]);

	useEffect(() => {
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
			if (transitionTimeoutRef.current) {
				clearTimeout(transitionTimeoutRef.current);
			}
		};
	}, []);

	const initialCenter = useMemo(() => getDefaultMapCenter(user), [user]);

	const showMapIncidentsLoading = useDelayedFlag(
		mapIncidentsLoading,
		LOADING_MESSAGE_DELAY_MS,
		LOADING_MESSAGE_MIN_VISIBLE_MS,
	);
	const showUsefulPlacesLoading = useDelayedFlag(
		usefulPlacesLoading,
		LOADING_MESSAGE_DELAY_MS,
		LOADING_MESSAGE_MIN_VISIBLE_MS,
	);

	// Vrai quand la zone ne contient aucun signalement (les lieux utiles ne comptent pas).
	const isZoneEmpty =
		!mapIncidentsLoading && !mapError && mapIncidents.length === 0;

	// Le serveur plafonne les réponses : à la limite, des éléments sont masqués.
	const isIncidentLimitReached =
		!mapIncidentsLoading && !mapError && mapIncidentsTruncated;
	const isPlacesLimitReached =
		!usefulPlacesLoading &&
		!usefulPlacesError &&
		usefulPlaces.length >= USEFUL_PLACES_LIMIT;

	// Sélectionne l'incident et recentre la carte dessus.
	const handleSelectIncident = useCallback(
		(incident: IncidentListItem, map: L.Map) => {
			onSelectIncident(incident.id);
			const lat = Number(incident.latitude);
			const lng = Number(incident.longitude);
			if (!isTargetAlreadyInView(map, lat, lng)) {
				triggerTransitionFade();
			}
			// Pas de closePopup() : fermerait la popup que ce clic vient d'ouvrir.
			map.setView([lat, lng], SELECTION_ZOOM, {
				animate: true,
				duration: SELECTION_TRANSITION_DURATION_SECONDS,
			});
		},
		[onSelectIncident, triggerTransitionFade],
	);

	return (
		<div
			className={`relative ${className} [&_.leaflet-top.leaflet-right]:mt-14`}
		>
			{showMapIncidentsLoading && (
				<output
					aria-live="polite"
					className="absolute top-14 right-2 left-2 z-1000 flex justify-center"
				>
					<span className="rounded-full bg-base-100/90 px-3 py-1 text-xs font-bold text-primary shadow">
						Chargement…
					</span>
				</output>
			)}
			{mapError && (
				<div
					role="alert"
					className="absolute top-14 right-2 left-2 z-1000 flex items-center justify-center gap-3 rounded-2xl bg-(--bg-error) px-3 py-2 text-sm text-(--error-text)"
				>
					<span>
						Impossible de charger les signalements sur la carte.
					</span>
					<button
						type="button"
						onClick={retryMapIncidents}
						className="btn btn-sm shrink-0 rounded-full border-none bg-error px-4 font-bold text-white"
					>
						Réessayer
					</button>
				</div>
			)}
			<div className="pointer-events-none absolute right-2 bottom-6 left-2 z-1000 flex flex-col items-center gap-1">
				{isZoneEmpty && (
					<output
						aria-live="polite"
						className="rounded-full bg-base-100/90 px-3 py-1 text-xs font-bold text-primary shadow"
					>
						Rien à signaler autour de vous.
					</output>
				)}
				{isIncidentLimitReached && (
					<output
						aria-live="polite"
						className="rounded-full bg-base-100/90 px-3 py-1 text-xs font-bold text-primary shadow"
					>
						Seuls les {MAP_INCIDENTS_LIMIT} incidents les plus
						récents sont affichés : zoomez pour affiner.
					</output>
				)}
				{isPlacesLimitReached && (
					<output
						aria-live="polite"
						className="rounded-full bg-base-100/90 px-3 py-1 text-xs font-bold text-primary shadow"
					>
						Zoomez pour voir tous les lieux utiles.
					</output>
				)}
				{(showsZoomHint || showUsefulPlacesLoading) && (
					<output
						aria-live="polite"
						className="rounded-full bg-base-100/90 px-3 py-1 text-xs font-bold text-primary shadow"
					>
						{showsZoomHint
							? "Zoomez pour voir les lieux utiles"
							: "Chargement des lieux utiles…"}
					</output>
				)}
				{usefulPlacesError && (
					<div
						role="alert"
						className="rounded-full bg-(--bg-error) px-3 py-1 text-xs font-bold text-(--error-text) shadow"
					>
						Lieux utiles indisponibles.
					</div>
				)}
			</div>
			{/* Voile de fondu : MapContainer ne met pas à jour son className après le montage. */}
			<div
				aria-hidden="true"
				className={`pointer-events-none absolute inset-0 z-1000 bg-base-100 transition-opacity duration-300 ${
					isTransitioning ? "opacity-80" : "opacity-0"
				}`}
			/>
			<MapContainer
				center={initialCenter}
				zoom={DEFAULT_ZOOM}
				zoomControl={false}
				minZoom={MIN_ZOOM}
				maxBounds={FRANCE_BOUNDS}
				maxBoundsViscosity={1}
				className="h-full w-full"
			>
				<ZoomControl position="topright" />
				<MapViewportWatcher onViewportChange={handleViewportChange} />
				<MapPanRequestWatcher
					request={panRequest}
					onTransitionStart={triggerTransitionFade}
				/>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				{mapIncidents.map((incident) => (
					<IncidentMarker
						key={incident.id}
						incident={incident}
						isSelected={incident.id === selectedIncidentId}
						onSelect={handleSelectIncident}
					/>
				))}
				{usefulPlaces.map((place) => (
					<UsefulPlaceMarker key={place.id} place={place} />
				))}
			</MapContainer>
		</div>
	);
}
