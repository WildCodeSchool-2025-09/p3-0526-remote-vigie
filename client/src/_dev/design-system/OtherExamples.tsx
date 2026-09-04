// ⚠️ DEV ONLY — famille "Others" de la galerie de composants (/help/components).

import Example from "@/_dev/design-system/Example";
import SectionLabel from "@/_dev/design-system/SectionLabel";
import Icon from "@/components/Icon/Icon";

export default function OtherExamples() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <SectionLabel>Pastilles</SectionLabel>

      <Example
        title="MessageInfo"
        description="Pastille d'information : icône ronde (marker) + titre et détail sur deux lignes. Fond bg-light."
        code={`<div className="inline-flex items-start gap-3 rounded-2xl bg-base-300 px-5 py-3">
  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary">
    <Icon name="marker" className="h-3.5 w-3.5 fill-base-300" aria-hidden="true" />
  </span>
  <div>
    <p className="text-sm font-bold text-primary">Incident élevé</p>
    <p className="mt-0.5 text-sm text-primary/60">1 type · rayon 3 km</p>
  </div>
</div>`}
      >
        <div className="inline-flex items-start gap-3 rounded-2xl bg-base-300 px-5 py-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary">
            <Icon name="marker" className="h-3.5 w-3.5 fill-base-300" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold text-primary">Incident élevé</p>
            <p className="mt-0.5 text-sm text-primary/60">1 type · rayon 3 km</p>
          </div>
        </div>
      </Example>

      <Example
        title="MessInfo_error"
        description="Pastille d'erreur : icône exclamation (déjà un rond plein, pas besoin de la recomposer) + texte. Tokens error de la charte (bg-error/10, text-error)."
        code={`<div className="inline-flex items-center gap-3 rounded-2xl bg-error/10 px-5 py-3">
  <Icon name="exclamation" className="h-6 w-6 shrink-0 fill-error" aria-hidden="true" />
  <p className="text-sm font-bold text-error">3 champs à corriger</p>
</div>`}
      >
        <div className="inline-flex items-center gap-3 rounded-2xl bg-error/10 px-5 py-3">
          <Icon name="exclamation" className="h-6 w-6 shrink-0 fill-error" aria-hidden="true" />
          <p className="text-sm font-bold text-error">3 champs à corriger</p>
        </div>
      </Example>

      <Example
        title="MessInfo_success"
        description="Pastille de résolution : icône check-circle (déjà un rond plein, pas besoin de la recomposer) + texte. Fond bg-light."
        code={`<div className="inline-flex items-start gap-3 rounded-2xl bg-base-300 px-5 py-3">
  <Icon name="checkCircle" className="h-6 w-6 shrink-0 fill-success" aria-hidden="true" />
  <p className="text-sm text-primary">
    Incident résolu le 12 mars à 18:40 — fiche conservée en archive.
  </p>
</div>`}
      >
        <div className="inline-flex items-start gap-3 rounded-2xl bg-base-300 px-5 py-3">
          <Icon name="checkCircle" className="h-6 w-6 shrink-0 fill-success" aria-hidden="true" />
          <p className="text-sm text-primary">
            Incident résolu le 12 mars à 18:40 — fiche conservée en archive.
          </p>
        </div>
      </Example>

      <Example
        title="MessageInfo · toast"
        description="Notification de confirmation (ex. après une sauvegarde) : fond accent plein, icône check dans un cercle primary. Même gabarit que les autres MessageInfo (cercle 24px, texte text-sm, px-5 py-3) — seule la couleur change."
        code={`<div className="flex items-start gap-3 rounded-2xl bg-accent px-5 py-3">
  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
    <Icon name="check" className="h-3.5 w-3.5 fill-white" aria-hidden="true" />
  </span>
  <div>
    <p className="text-sm font-bold text-primary">Modifications enregistrées</p>
    <p className="mt-0.5 text-sm text-primary/70">Vos voisins n'ont pas reçu de nouvelle alerte.</p>
  </div>
</div>`}
      >
        <div className="flex items-start gap-3 rounded-2xl bg-accent px-5 py-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
            <Icon name="check" className="h-3.5 w-3.5 fill-white" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold text-primary">Modifications enregistrées</p>
            <p className="mt-0.5 text-sm text-primary/70">Vos voisins n'ont pas reçu de nouvelle alerte.</p>
          </div>
        </div>
      </Example>

      <SectionLabel>Chips</SectionLabel>

      <Example
        className="sm:col-span-2 lg:col-span-3"
        title="Chip · gravité"
        description="Un badge daisyUI par niveau de gravité (voir ColorPalette.tsx). Les couleurs --level-x ne sont pas des tokens daisyUI : classes badge/badge-sm pour la forme, couleur en style={{ }}."
        code={`<div className="flex flex-wrap items-center gap-2">
  <div className="badge badge-sm border font-bold" style={{ borderColor: "var(--level-1)", backgroundColor: "var(--bg-level-1)", color: "var(--level-1)" }}>
    Incident faible
  </div>
  <div className="badge badge-sm border font-bold" style={{ borderColor: "var(--level-2)", backgroundColor: "var(--bg-level-2)", color: "var(--level-2)" }}>
    Incident modéré
  </div>
  <div className="badge badge-sm border font-bold" style={{ borderColor: "var(--level-3)", backgroundColor: "var(--bg-level-3)", color: "var(--level-3)" }}>
    Incident important
  </div>
  <div className="badge badge-sm border font-bold" style={{ borderColor: "var(--level-4)", backgroundColor: "var(--bg-level-4)", color: "var(--level-4)" }}>
    Incident élevé
  </div>
  <div className="badge badge-sm border font-bold" style={{ borderColor: "var(--level-5)", backgroundColor: "var(--bg-level-5)", color: "var(--level-5)" }}>
    Incident critique
  </div>
</div>`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="badge badge-sm border font-bold"
            style={{ borderColor: "var(--level-1)", backgroundColor: "var(--bg-level-1)", color: "var(--level-1)" }}
          >
            Incident faible
          </div>
          <div
            className="badge badge-sm border font-bold"
            style={{ borderColor: "var(--level-2)", backgroundColor: "var(--bg-level-2)", color: "var(--level-2)" }}
          >
            Incident modéré
          </div>
          <div
            className="badge badge-sm border font-bold"
            style={{ borderColor: "var(--level-3)", backgroundColor: "var(--bg-level-3)", color: "var(--level-3)" }}
          >
            Incident important
          </div>
          <div
            className="badge badge-sm border font-bold"
            style={{ borderColor: "var(--level-4)", backgroundColor: "var(--bg-level-4)", color: "var(--level-4)" }}
          >
            Incident élevé
          </div>
          <div
            className="badge badge-sm border font-bold"
            style={{ borderColor: "var(--level-5)", backgroundColor: "var(--bg-level-5)", color: "var(--level-5)" }}
          >
            Incident critique
          </div>
        </div>
      </Example>

      <Example
        title="Chip · statut (en cours) · success"
        description="Badge daisyUI (badge-soft badge-success) avec puce ronde : fond success teinté, texte success. Pour un statut en cours de vie."
        code={`<div className="badge badge-soft badge-success badge-sm gap-1.5 font-bold">
  <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
  En cours
</div>`}
      >
        <div className="badge badge-soft badge-success badge-sm gap-1.5 font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
          En cours
        </div>
      </Example>

      <Example
        title="Chip · statut (en cours) · accent"
        description="Même statut, variante accent : badge-accent (fond jaune plein) — accent-content vaut déjà primary dans le thème daisyUI, pas besoin de forcer la couleur du texte."
        code={`<div className="badge badge-accent badge-sm gap-1.5 font-bold">
  <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
  En cours
</div>`}
      >
        <div className="badge badge-accent badge-sm gap-1.5 font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
          En cours
        </div>
      </Example>

      <Example
        title="Chip · statut (résolu)"
        description="Même badge, statut suivant : icône check à la place de la puce. Réutilise l'icône check déjà chargée (voir Buttons.tsx)."
        code={`<div className="badge badge-soft badge-success badge-sm gap-1.5 font-bold">
  <Icon name="check" className="h-3.5 w-3.5 fill-success" aria-hidden="true" />
  Résolu
</div>`}
      >
        <div className="badge badge-soft badge-success badge-sm gap-1.5 font-bold">
          <Icon name="check" className="h-3 w-3 fill-success" aria-hidden="true" />
          Résolu
        </div>
      </Example>

      <Example
        title="Chips · paire"
        description="Gravité + statut affichés côte à côte, comme sur la fiche d'un incident."
        code={`<div className="flex flex-wrap items-center gap-2">
  <div className="badge badge-sm border font-bold" style={{ borderColor: "var(--level-4)", backgroundColor: "var(--bg-level-4)", color: "var(--level-4)" }}>
    Incident élevé
  </div>
  <div className="badge badge-soft badge-success badge-sm gap-1.5 font-bold">
    <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
    En cours
  </div>
</div>`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="badge badge-sm border font-bold"
            style={{ borderColor: "var(--level-4)", backgroundColor: "var(--bg-level-4)", color: "var(--level-4)" }}
          >
            Incident élevé
          </div>
          <div className="badge badge-soft badge-success badge-sm gap-1.5 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
            En cours
          </div>
        </div>
      </Example>

      <Example
        className="sm:col-span-2 lg:col-span-3"
        title="Chip · type"
        description="Un badge par type d'incident : icône dédiée (couleurs déjà dans le SVG, pas de fill à poser) + fond bg-x (la teinte la plus claire) + texte x. Voir ColorPalette.tsx pour les 12 types."
        code={`<div className="flex flex-wrap items-center gap-2">
  <div className="badge badge-sm gap-1.5 font-bold" style={{ backgroundColor: "var(--bg-fire)", color: "var(--fire)" }}>
    <Icon name="fire" className="h-3.5 w-3.5" aria-hidden="true" />
    Feu
  </div>
  <div className="badge badge-sm gap-1.5 font-bold" style={{ backgroundColor: "var(--bg-flood)", color: "var(--flood)" }}>
    <Icon name="flood" className="h-3.5 w-3.5" aria-hidden="true" />
    Inondation
  </div>
  <div className="badge badge-sm gap-1.5 font-bold" style={{ backgroundColor: "var(--bg-glaze)", color: "var(--glaze)" }}>
    <Icon name="glaze" className="h-3.5 w-3.5" aria-hidden="true" />
    Verglas
  </div>
  <div className="badge badge-sm gap-1.5 font-bold" style={{ backgroundColor: "var(--bg-hail)", color: "var(--hail)" }}>
    <Icon name="hail" className="h-3.5 w-3.5" aria-hidden="true" />
    Grêle
  </div>
  <div className="badge badge-sm gap-1.5 font-bold" style={{ backgroundColor: "var(--bg-insect)", color: "var(--insect)" }}>
    <Icon name="insect" className="h-3.5 w-3.5" aria-hidden="true" />
    Nid d'insectes
  </div>
  <div className="badge badge-sm gap-1.5 font-bold" style={{ backgroundColor: "var(--bg-rockfall)", color: "var(--rockfall)" }}>
    <Icon name="rockfall" className="h-3.5 w-3.5" aria-hidden="true" />
    Éboulement
  </div>
  <div className="badge badge-sm gap-1.5 font-bold" style={{ backgroundColor: "var(--bg-snow)", color: "var(--snow)" }}>
    <Icon name="snow" className="h-3.5 w-3.5" aria-hidden="true" />
    Neige
  </div>
  <div className="badge badge-sm gap-1.5 font-bold" style={{ backgroundColor: "var(--bg-storm)", color: "var(--storm)" }}>
    <Icon name="storm" className="h-3.5 w-3.5" aria-hidden="true" />
    Tempête
  </div>
  <div className="badge badge-sm gap-1.5 font-bold" style={{ backgroundColor: "var(--bg-tornado)", color: "var(--tornado)" }}>
    <Icon name="tornado" className="h-3.5 w-3.5" aria-hidden="true" />
    Tornade
  </div>
  <div className="badge badge-sm gap-1.5 font-bold" style={{ backgroundColor: "var(--bg-tree)", color: "var(--tree)" }}>
    <Icon name="tree" className="h-3.5 w-3.5" aria-hidden="true" />
    Chute d'arbre
  </div>
  <div className="badge badge-sm gap-1.5 font-bold" style={{ backgroundColor: "var(--bg-wild)", color: "var(--wild)" }}>
    <Icon name="wild" className="h-3.5 w-3.5" aria-hidden="true" />
    Animal sauvage
  </div>
  <div className="badge badge-sm gap-1.5 font-bold" style={{ backgroundColor: "var(--bg-animal)", color: "var(--animal)" }}>
    <Icon name="animal" className="h-3.5 w-3.5" aria-hidden="true" />
    Animal perdu
  </div>
</div>`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="badge badge-sm gap-1.5 font-bold" style={{ backgroundColor: "var(--bg-fire)", color: "var(--fire)" }}>
            <Icon name="fire" className="h-3.5 w-3.5" aria-hidden="true" />
            Feu
          </div>
          <div className="badge badge-sm gap-1.5 font-bold" style={{ backgroundColor: "var(--bg-flood)", color: "var(--flood)" }}>
            <Icon name="flood" className="h-3.5 w-3.5" aria-hidden="true" />
            Inondation
          </div>
          <div className="badge badge-sm gap-1.5 font-bold" style={{ backgroundColor: "var(--bg-glaze)", color: "var(--glaze)" }}>
            <Icon name="glaze" className="h-3.5 w-3.5" aria-hidden="true" />
            Verglas
          </div>
          <div className="badge badge-sm gap-1.5 font-bold" style={{ backgroundColor: "var(--bg-hail)", color: "var(--hail)" }}>
            <Icon name="hail" className="h-3.5 w-3.5" aria-hidden="true" />
            Grêle
          </div>
          <div className="badge badge-sm gap-1.5 font-bold" style={{ backgroundColor: "var(--bg-insect)", color: "var(--insect)" }}>
            <Icon name="insect" className="h-3.5 w-3.5" aria-hidden="true" />
            Nid d'insectes
          </div>
          <div className="badge badge-sm gap-1.5 font-bold" style={{ backgroundColor: "var(--bg-rockfall)", color: "var(--rockfall)" }}>
            <Icon name="rockfall" className="h-3.5 w-3.5" aria-hidden="true" />
            Éboulement
          </div>
          <div className="badge badge-sm gap-1.5 font-bold" style={{ backgroundColor: "var(--bg-snow)", color: "var(--snow)" }}>
            <Icon name="snow" className="h-3.5 w-3.5" aria-hidden="true" />
            Neige
          </div>
          <div className="badge badge-sm gap-1.5 font-bold" style={{ backgroundColor: "var(--bg-storm)", color: "var(--storm)" }}>
            <Icon name="storm" className="h-3.5 w-3.5" aria-hidden="true" />
            Tempête
          </div>
          <div className="badge badge-sm gap-1.5 font-bold" style={{ backgroundColor: "var(--bg-tornado)", color: "var(--tornado)" }}>
            <Icon name="tornado" className="h-3.5 w-3.5" aria-hidden="true" />
            Tornade
          </div>
          <div className="badge badge-sm gap-1.5 font-bold" style={{ backgroundColor: "var(--bg-tree)", color: "var(--tree)" }}>
            <Icon name="tree" className="h-3.5 w-3.5" aria-hidden="true" />
            Chute d'arbre
          </div>
          <div className="badge badge-sm gap-1.5 font-bold" style={{ backgroundColor: "var(--bg-wild)", color: "var(--wild)" }}>
            <Icon name="wild" className="h-3.5 w-3.5" aria-hidden="true" />
            Animal sauvage
          </div>
          <div className="badge badge-sm gap-1.5 font-bold" style={{ backgroundColor: "var(--bg-animal)", color: "var(--animal)" }}>
            <Icon name="animal" className="h-3.5 w-3.5" aria-hidden="true" />
            Animal perdu
          </div>
        </div>
      </Example>
    </div>
  );
}
