/**
 * ⚠️ DEV ONLY — famille "Others" de la galerie de composants (/help/components), rendu par
 * SafetyInstructions.tsx aux côtés de la carte consignes. Chaque exemple : un rendu live
 * (Tailwind + daisyUI) + sa source TSX (string, à garder synchro).
 * Pastille d'info : icône ronde + texte, sur fond bg-light (= base-300, cf. daisyui.css).
 * Version 1/3.
 */

import Example from "@/_dev/components/Example";
import Icon from "@/components/Icon/Icon";

export default function MessageInfo() {
  return (
    <Example
      title="MessageInfo · v1"
      description="Pastille d'information : icône ronde (marker) + texte. Fond bg-light."
      code={`<div className="inline-flex items-center gap-2 rounded-full bg-base-300 px-4 py-2">
  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary">
    <Icon name="marker" className="h-3.5 w-3.5 fill-base-300" aria-hidden="true" />
  </span>
  <p className="text-sm text-primary">
    <span className="font-bold">Incident élevé</span>
    <span className="text-primary/60"> — 1 type · rayon 3 km</span>
  </p>
</div>`}
    >
      <div className="inline-flex items-center gap-2 rounded-full bg-base-300 px-4 py-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary">
          <Icon name="marker" className="h-3.5 w-3.5 fill-base-300" aria-hidden="true" />
        </span>
        <p className="text-sm text-primary">
          <span className="font-bold">Incident élevé</span>
          <span className="text-primary/60"> — 1 type · rayon 3 km</span>
        </p>
      </div>
    </Example>
  );
}
