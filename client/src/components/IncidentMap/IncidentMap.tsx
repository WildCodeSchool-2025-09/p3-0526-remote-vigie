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
	useMap,
	useMapEvents,
} from "react-leaflet";
import { Link } from "react-router";
import "leaflet/dist/leaflet.css";

import { type IconName, icons } from "@/assets/icons";
import UsefulPlaceMarker from "@/components/UsefulPlaceMarker/UsefulPlaceMarker";
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
import type { StartView, StartViewSource } from "@/utils/getDefaultMapCenter";
import {
	POPUP_AUTO_PAN_BOTTOM_RIGHT,
	POPUP_AUTO_PAN_TOP_LEFT,
	POPUP_MAX_WIDTH,
} from "@/utils/popupAutoPan";
import { useDelayedFlag } from "./useDelayedFlag";

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
function isTargetAlreadyInView(
	map: L.Map,
	lat: number,
	lng: number,
	zoom: number,
): boolean {
	return map.getZoom() === zoom && map.getBounds().contains([lat, lng]);
}

// Recentrage demandé à la carte (liste ou recherche). `zoom` : 15 par défaut ;
// `announcement` : phrase lue par les lecteurs d'écran.
// `rememberView` garde la vue d'avant pour pouvoir y revenir (type « restore »).
export type MapPanRequest =
	| {
			type?: "center";
			lat: number;
			lng: number;
			zoom?: number;
			announcement?: string;
			rememberView?: boolean;
	  }
	| { type: "restore"; announcement?: string };

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
	const map = useMap();
	// Objet stable : un nouvel objet à chaque rendu ferait retirer puis remettre
	// l'écouteur, et un recentrage lancé par un autre composant au même moment
	// passerait sans être vu (zone et incidents jamais rechargés).
	const handlers = useMemo(
		() => ({
			moveend: () =>
				onViewportChange(
					leafletBoundsToBounds(map.getBounds()),
					map.getZoom(),
				),
		}),
		[map, onViewportChange],
	);
	useMapEvents(handlers);

	// biome-ignore lint/correctness/useExhaustiveDependencies: montage uniquement (`map` est stable, `onViewportChange` mémoïsée).
	useEffect(() => {
		onViewportChange(leafletBoundsToBounds(map.getBounds()), map.getZoom());
	}, []);

	return null;
}

const START_VIEW_MESSAGES: Record<StartViewSource, string> = {
	device: "Carte centrée sur votre position.",
	address: "Carte centrée sur votre adresse.",
	default:
		"Carte centrée sur Paris : votre position et votre adresse sont indisponibles.",
};

// Marqueur du point de départ : point bleu pulsant pour la position de l'appareil
// (« Vous êtes ici »), pastille verte avec repère pour l'adresse. Distincts des
// marqueurs d'incident (pastille blanche) et de lieu utile.
function createStartViewIcon(source: StartViewSource) {
	const AddressIcon = icons.landLocation;
	const isDevice = source === "device";
	const size = isDevice ? 24 : 32;
	const html = renderToStaticMarkup(
		isDevice ? (
			<div className="relative flex size-6 items-center justify-center">
				<span
					aria-hidden="true"
					className="animate-marker-pulse pointer-events-none absolute inset-0 rounded-full bg-blue-500"
				/>
				<span className="relative size-4 rounded-full border-2 border-white bg-blue-600 shadow-[0_1px_4px_rgba(0,0,0,0.4)]" />
			</div>
		) : (
			<div className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-primary shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
				<AddressIcon className="size-4 fill-white" aria-hidden="true" />
			</div>
		),
	);

	return L.divIcon({
		html,
		className: "",
		iconSize: [size, size],
		iconAnchor: [size / 2, size / 2],
	});
}

function StartViewMarker({ startView }: { startView: StartView }) {
	const icon = useMemo(
		() => createStartViewIcon(startView.source),
		[startView.source],
	);
	const label =
		startView.source === "device" ? "Vous êtes ici" : "Votre adresse";

	return (
		<Marker
			position={startView.center}
			icon={icon}
			title={label}
			// Sous les marqueurs d'incident, au-dessus des lieux utiles.
			zIndexOffset={-500}
		>
			<Popup
				autoPanPaddingTopLeft={POPUP_AUTO_PAN_TOP_LEFT}
				autoPanPaddingBottomRight={POPUP_AUTO_PAN_BOTTOM_RIGHT}
				maxWidth={POPUP_MAX_WIDTH}
			>
				<p className="font-title text-sm font-bold text-primary">
					{label}
				</p>
			</Popup>
		</Marker>
	);
}

// Recentre la carte sur le point de départ une fois la position de l'appareil
// tranchée, sauf si l'utilisateur a déjà pris la main (déplacement de la carte,
// recherche, carte choisie dans la liste).
function MapStartViewWatcher({
	startView,
	isFinal,
	hasUserTakenOverRef,
	onApplied,
}: {
	startView: StartView;
	isFinal: boolean;
	hasUserTakenOverRef: { current: boolean };
	onApplied: (message: string) => void;
}) {
	const map = useMap();
	const hasAppliedRef = useRef(false);

	useEffect(() => {
		const container = map.getContainer();
		const markTakenOver = () => {
			hasUserTakenOverRef.current = true;
		};
		const events = ["pointerdown", "wheel", "keydown"] as const;
		for (const event of events) {
			container.addEventListener(event, markTakenOver, { passive: true });
		}
		return () => {
			for (const event of events) {
				container.removeEventListener(event, markTakenOver);
			}
		};
	}, [map, hasUserTakenOverRef]);

	useEffect(() => {
		if (!isFinal || hasAppliedRef.current || hasUserTakenOverRef.current)
			return;
		hasAppliedRef.current = true;

		map.setView(startView.center, startView.zoom);
		onApplied(START_VIEW_MESSAGES[startView.source]);
	}, [map, startView, isFinal, hasUserTakenOverRef, onApplied]);

	return null;
}

// Zoom de Leaflet avec, entre « + » et « − », un bouton qui ramène la carte à la
// vue de départ (`center` / `zoom`, lus au clic).
function MapZoomControl({
	center,
	zoom,
}: {
	center: L.LatLngExpression;
	zoom: number;
}) {
	const map = useMap();
	const startViewRef = useRef({ center, zoom });

	useEffect(() => {
		startViewRef.current = { center, zoom };
	}, [center, zoom]);

	useEffect(() => {
		const control = L.control.zoom({
			position: "topright",
			zoomInTitle: "Zoom avant",
			zoomOutTitle: "Zoom arrière",
		});
		control.addTo(map);

		const container = control.getContainer();
		const resetButton = L.DomUtil.create("a", "leaflet-control-zoom-reset");
		const BulletIcon = icons.bullet;
		resetButton.href = "#";
		resetButton.title = "Revenir à la position de départ";
		resetButton.setAttribute("role", "button");
		resetButton.setAttribute(
			"aria-label",
			"Revenir à la position de départ",
		);
		resetButton.innerHTML = renderToStaticMarkup(
			<BulletIcon
				className="inline-block size-5 fill-current align-middle"
				aria-hidden="true"
			/>,
		);
		L.DomEvent.on(resetButton, "click", (event) => {
			L.DomEvent.stop(event);
			map.closePopup();
			map.setView(startViewRef.current.center, startViewRef.current.zoom);
		});
		container?.insertBefore(resetButton, container.lastElementChild);

		return () => {
			control.remove();
		};
	}, [map]);

	return null;
}

// Recentre la carte sur la demande reçue en prop (carte choisie dans la liste,
// ou résultat le plus récent d'une recherche validée), ou la ramène à la vue
// d'avant la recherche quand celle-ci ne donne rien.
function MapPanRequestWatcher({
	request,
	onTransitionStart,
	onAnnounce,
}: {
	request: MapPanRequest | null;
	onTransitionStart: () => void;
	onAnnounce: (message: string) => void;
}) {
	const map = useMap();
	// Vue d'avant la recherche : oubliée dès que l'utilisateur déplace la carte lui-même.
	const previousViewRef = useRef<{ center: L.LatLng; zoom: number } | null>(
		null,
	);

	useEffect(() => {
		const container = map.getContainer();
		const forgetPreviousView = () => {
			previousViewRef.current = null;
		};
		const events = ["pointerdown", "wheel", "keydown"] as const;
		for (const event of events) {
			container.addEventListener(event, forgetPreviousView, {
				passive: true,
			});
		}
		return () => {
			for (const event of events) {
				container.removeEventListener(event, forgetPreviousView);
			}
		};
	}, [map]);

	useEffect(() => {
		if (!request) return;

		if (request.type === "restore") {
			const previous = previousViewRef.current;
			if (!previous) return;
			previousViewRef.current = null;
			onTransitionStart();
			map.closePopup();
			map.setView(previous.center, previous.zoom, {
				animate: true,
				duration: SELECTION_TRANSITION_DURATION_SECONDS,
			});
			onAnnounce(request.announcement ?? "");
			return;
		}

		const zoom = request.zoom ?? SELECTION_ZOOM;
		if (request.rememberView) {
			previousViewRef.current ??= {
				center: map.getCenter(),
				zoom: map.getZoom(),
			};
		} else {
			// Un autre déplacement (carte de la liste) remplace la vue d'avant.
			previousViewRef.current = null;
		}
		if (!isTargetAlreadyInView(map, request.lat, request.lng, zoom)) {
			onTransitionStart();
		}
		// Une popup restée ouverte gênerait le déplacement (autoPan).
		map.closePopup();
		map.setView([request.lat, request.lng], zoom, {
			animate: true,
			duration: SELECTION_TRANSITION_DURATION_SECONDS,
		});
		onAnnounce(request.announcement ?? "");
	}, [request, map, onTransitionStart, onAnnounce]);

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
			<Popup
				autoPanPaddingTopLeft={POPUP_AUTO_PAN_TOP_LEFT}
				autoPanPaddingBottomRight={POPUP_AUTO_PAN_BOTTOM_RIGHT}
				maxWidth={POPUP_MAX_WIDTH}
			>
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
	panRequest?: MapPanRequest | null;
	// Montre aussi les incidents résolus (sinon : seulement ceux en cours).
	includeResolved?: boolean;
	// Appelée avec la zone visible à chaque rechargement des données de la carte.
	onBoundsChange?: (bounds: Bounds) => void;
	// Point de départ retenu ; `isStartViewFinal` : la position de l'appareil est tranchée.
	startView: StartView;
	isStartViewFinal: boolean;
	// Une recherche saisie empêche tout recentrage automatique sur le point de départ.
	searchActive?: boolean;
	className?: string;
};

export default function IncidentMap({
	selectedIncidentId,
	onSelectIncident,
	panRequest = null,
	includeResolved = false,
	onBoundsChange,
	startView,
	isStartViewFinal,
	searchActive = false,
	className = "h-[38vh] w-full",
}: IncidentMapProps) {
	// Message de la carte (point de départ, recentrage), lu par les lecteurs d'écran.
	const [mapAnnouncement, setMapAnnouncement] = useState("");
	// Vrai dès que l'utilisateur a pris la main : plus aucun recentrage automatique.
	const hasUserTakenOverRef = useRef(false);

	useEffect(() => {
		if (searchActive || panRequest) hasUserTakenOverRef.current = true;
	}, [searchActive, panRequest]);

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
	// Garde `loadMapData` stable quel que soit le parent.
	const onBoundsChangeRef = useRef(onBoundsChange);

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
			onBoundsChangeRef.current?.(bounds);
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
		onBoundsChangeRef.current = onBoundsChange;
	}, [onBoundsChange]);

	useEffect(() => {
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
			if (transitionTimeoutRef.current) {
				clearTimeout(transitionTimeoutRef.current);
			}
		};
	}, []);

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
			if (!isTargetAlreadyInView(map, lat, lng, SELECTION_ZOOM)) {
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
		<div className={`relative ${className}`}>
			<output aria-live="polite" className="sr-only">
				{mapAnnouncement}
			</output>
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
					className="absolute top-14 right-14 left-2 z-1000 flex items-center justify-center gap-3 rounded-2xl bg-(--bg-error) px-3 py-2 text-sm text-(--error-text)"
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
				{!isStartViewFinal && (
					<output
						aria-live="polite"
						className="rounded-full bg-base-100/90 px-3 py-1 text-center text-xs font-bold text-primary shadow"
					>
						Votre position sert uniquement à centrer la carte : elle
						n'est ni enregistrée ni envoyée.
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
				center={startView.center}
				zoom={startView.zoom}
				zoomControl={false}
				minZoom={MIN_ZOOM}
				maxBounds={FRANCE_BOUNDS}
				maxBoundsViscosity={1}
				className="h-full w-full"
			>
				<MapZoomControl
					center={startView.center}
					zoom={startView.zoom}
				/>
				<MapStartViewWatcher
					startView={startView}
					isFinal={isStartViewFinal}
					hasUserTakenOverRef={hasUserTakenOverRef}
					onApplied={setMapAnnouncement}
				/>
				{isStartViewFinal && startView.source !== "default" && (
					<StartViewMarker startView={startView} />
				)}
				<MapViewportWatcher onViewportChange={handleViewportChange} />
				<MapPanRequestWatcher
					request={panRequest}
					onAnnounce={setMapAnnouncement}
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
