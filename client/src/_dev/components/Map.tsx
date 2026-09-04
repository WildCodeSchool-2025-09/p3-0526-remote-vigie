/**
 * ⚠️ DEV ONLY — exemples "Map" rattachés à la famille "Cards" de la galerie
 * (/help/components). Support de l'US04 « Carte interactive ».
 *
 * Particularité : contrairement aux autres familles (source TSX écrite à la main
 * et dupliquée), ces exemples IMPORTENT le vrai composant réutilisable
 * `src/components/Map/IncidentsMap.tsx`. La carte porte de la logique (Leaflet,
 * divIcon, renderToStaticMarkup) : la dupliquer en string serait ingérable.
 * Le `code` affiché ne montre donc que l'import + l'usage du composant.
 * (`_dev` peut importer l'app ; l'inverse reste interdit.)
 */

import Example from "@/_dev/components/Example";
import IncidentsMap, {
  type IncidentMarker,
} from "@/components/Map/IncidentsMap";

const CAPITOLE: [number, number] = [43.6045, 1.4442];

// Jeu de données factice : ce que renverra l'API incidents de l'US04.
const incidents: IncidentMarker[] = [
  {
    id: 1,
    type: "Feu",
    icon: "fire",
    color: "var(--fire)",
    position: [43.6045, 1.444],
    popup: "Signalé il y a 2 h · 4 confirmations",
  },
  {
    id: 2,
    type: "Inondation",
    icon: "flood",
    color: "var(--flood)",
    position: [43.6122, 1.4265],
    popup: "Signalé il y a 40 min",
  },
  {
    id: 3,
    type: "Tempête",
    icon: "storm",
    color: "var(--storm)",
    position: [43.5972, 1.452],
  },
  {
    id: 4,
    type: "Chute d'arbre",
    icon: "tree",
    color: "var(--tree)",
    position: [43.6088, 1.462],
  },
  {
    id: 5,
    type: "Animal errant",
    icon: "animal",
    color: "var(--animal)",
    position: [43.594, 1.433],
  },
];

export default function Maps() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Example
        className="sm:col-span-2 lg:col-span-3"
        title="Map · carte de base dans une card"
        description="Le composant <IncidentsMap> encapsulé dans un conteneur arrondi (overflow-hidden) qui rogne les coins de la carte. La hauteur vient de className (h-72) : sans hauteur, Leaflet ne s'affiche pas. Ici un seul incident."
        code={`import IncidentsMap from "@/components/Map/IncidentsMap";

<div className="w-full overflow-hidden rounded-2xl border border-primary/10">
  <IncidentsMap
    center={[43.6045, 1.4442]}
    incidents={[
      { id: 1, type: "Feu", icon: "fire", color: "var(--fire)", position: [43.6045, 1.444] },
    ]}
    className="h-72 w-full"
  />
</div>`}
      >
        <div className="w-full overflow-hidden rounded-2xl border border-primary/10">
          <IncidentsMap
            center={CAPITOLE}
            incidents={incidents.slice(0, 1)}
            className="h-72 w-full"
          />
        </div>
      </Example>

      <Example
        className="sm:col-span-2 lg:col-span-3"
        title="Map · incidents par type"
        description="Le même composant avec plusieurs incidents. Chaque marqueur = l'icône du type (src/assets/icons/types) sur une pastille cerclée de la couleur du type (tokens theme.css). La prop `popup` ajoute du détail sous le libellé du type."
        code={`import IncidentsMap, { type IncidentMarker } from "@/components/Map/IncidentsMap";

const incidents: IncidentMarker[] = [
  { id: 1, type: "Feu", icon: "fire", color: "var(--fire)", position: [43.6045, 1.444], popup: "Signalé il y a 2 h" },
  { id: 2, type: "Inondation", icon: "flood", color: "var(--flood)", position: [43.6122, 1.4265] },
  { id: 3, type: "Tempête", icon: "storm", color: "var(--storm)", position: [43.5972, 1.452] },
  { id: 4, type: "Chute d'arbre", icon: "tree", color: "var(--tree)", position: [43.6088, 1.462] },
  { id: 5, type: "Animal errant", icon: "animal", color: "var(--animal)", position: [43.594, 1.433] },
];

<div className="w-full overflow-hidden rounded-2xl border border-primary/10">
  <IncidentsMap center={[43.6045, 1.4442]} incidents={incidents} className="h-72 w-full" />
</div>`}
      >
        <div className="w-full overflow-hidden rounded-2xl border border-primary/10">
          <IncidentsMap
            center={CAPITOLE}
            incidents={incidents}
            className="h-72 w-full"
          />
        </div>
      </Example>
    </div>
  );
}
