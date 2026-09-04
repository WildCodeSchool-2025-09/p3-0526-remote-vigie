/**
 * Carte interactive Vigie — composant réutilisable, importable par les pages.
 * Support de l'US04 « Carte interactive (incidents + lieux utiles) » ; prévu pour
 * être aussi consommé par l'US01 (choix de la position d'un incident) et l'US02
 * (mini-carte du détail).
 *
 * Fond de carte : tuiles OpenStreetMap via Leaflet (cf. VIGIE.md §8).
 * Marqueurs : les icônes de `src/assets/icons/types` (via <Icon>), posées sur une
 * pastille blanche cerclée de la couleur du type (tokens --fire, --flood… de
 * theme.css). Ces SVG sont des illustrations multicolores (pas de `currentColor`) :
 * on ne les teinte pas, l'anneau porte l'information « type ».
 *
 * Le HTML d'un marqueur est produit avec renderToStaticMarkup puis passé à
 * L.divIcon (Leaflet attend une chaîne HTML, pas un composant React).
 *
 * Le CSS de Leaflet est importé ici une fois ; il ne faut pas l'importer ailleurs.
 */

import "leaflet/dist/leaflet.css";
import type { IconName } from "@/assets/icons";
import Icon from "@/components/Icon/Icon";
import L from "leaflet";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const OSM_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

/** Marqueur Vigie : icône de type sur une pastille blanche cerclée de `color`. */
export function typeMarker(name: IconName, color: string) {
  const html = renderToStaticMarkup(
    <span
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        borderRadius: "9999px",
        background: "white",
        border: `2px solid ${color}`,
        boxShadow: "0 1px 5px rgba(0,0,0,.35)",
      }}
    >
      <Icon name={name} width={22} height={22} />
    </span>,
  );

  return L.divIcon({
    html,
    className: "", // retire le style .leaflet-div-icon par défaut
    iconSize: [36, 36],
    iconAnchor: [18, 18], // centre de la pastille
    popupAnchor: [0, -18],
  });
}

export type IncidentMarker = {
  id: number | string;
  /** Libellé du type, affiché en gras dans la popup. */
  type: string;
  /** Icône de `src/assets/icons/types`. */
  icon: IconName;
  /** Couleur du type — token CSS, ex. "var(--fire)". */
  color: string;
  position: [number, number];
  /** Contenu additionnel de la popup, sous le libellé du type. */
  popup?: ReactNode;
};

type IncidentsMapProps = {
  incidents: IncidentMarker[];
  center: [number, number];
  zoom?: number;
  scrollWheelZoom?: boolean;
  /**
   * Classes du conteneur de la carte. DOIT fixer une hauteur (ex. "h-72"),
   * sinon Leaflet calcule une hauteur nulle et la carte ne s'affiche pas.
   */
  className?: string;
};

export default function IncidentsMap({
  incidents,
  center,
  zoom = 13,
  scrollWheelZoom = false,
  className = "h-72 w-full",
}: IncidentsMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={scrollWheelZoom}
      className={className}
    >
      <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_URL} />
      {incidents.map((incident) => (
        <Marker
          key={incident.id}
          position={incident.position}
          icon={typeMarker(incident.icon, incident.color)}
        >
          <Popup>
            <strong>{incident.type}</strong>
            {incident.popup ? (
              <>
                <br />
                {incident.popup}
              </>
            ) : null}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
