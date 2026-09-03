/**
 * ⚠️ DEV ONLY — famille "Others" de la galerie de composants (/help/components), rendu par
 * SafetyInstructions.tsx aux côtés de la carte consignes. Chaque exemple : un rendu live
 * (Tailwind + daisyUI) + sa source TSX (string, à garder synchro).
 * Pastille d'info : icône ronde + texte, sur fond bg-light (= base-300, cf. daisyui.css).
 * Version 3/3.
 */

import Example from "@/_dev/components/Example";
import Icon from "@/components/Icon/Icon";

export default function MessageInfo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Example
        title="MessageInfo"
        description="Pastille d'information : icône ronde (marker) + texte. Fond bg-light."
        code={`<div className="inline-flex items-center gap-3 rounded-2xl bg-base-300 px-5 py-3">
  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary">
    <Icon name="marker" className="h-3.5 w-3.5 fill-base-300" aria-hidden="true" />
  </span>
  <p className="text-sm text-primary">
    <span className="font-bold">Incident élevé</span>
    <span className="text-primary/60"> — 1 type · rayon 3 km</span>
  </p>
</div>`}
      >
        <div className="inline-flex items-center gap-3 rounded-2xl bg-base-300 px-5 py-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary">
            <Icon name="marker" className="h-3.5 w-3.5 fill-base-300" aria-hidden="true" />
          </span>
          <p className="text-sm text-primary">
            <span className="font-bold">Incident élevé</span>
            <span className="text-primary/60"> — 1 type · rayon 3 km</span>
          </p>
        </div>
      </Example>

      <Example
        title="MessInfo_error"
        description="Pastille d'erreur : icône exclamation (déjà un rond plein, pas besoin de la recomposer) + texte. Tokens error de la charte (border-error/30, bg-error/10, text-error)."
        code={`<div className="inline-flex items-center gap-3 rounded-2xl border border-error/30 bg-error/10 px-5 py-3">
  <Icon name="exclamation" className="h-6 w-6 shrink-0 fill-error" aria-hidden="true" />
  <p className="text-sm font-bold text-error">3 champs à corriger</p>
</div>`}
      >
        <div className="inline-flex items-center gap-3 rounded-2xl border border-error/30 bg-error/10 px-5 py-3">
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
    </div>
  );
}
