/**
 * ⚠️ DEV ONLY — famille "Cards" de la galerie de composants (/help/components).
 * Chaque exemple : un rendu live (Tailwind + daisyUI) + sa source TSX (string, à garder synchro).
 * Les couleurs par type (--fire, --storm, …) ne sont pas des tokens daisyUI : pas d'utilitaire
 * Tailwind pour elles, on passe par style={{ color: "var(--x)" }} (voir ColorPalette.tsx).
 */

import Example from "@/_dev/components/Example";
import Icon from "@/components/Icon/Icon";
import { useState } from "react";

function SafetyInstructionsDemo() {
  const [open, setOpen] = useState(true);

  return (
    <div
      className="w-full rounded-2xl p-4"
      style={{ background: "var(--primary-light)" }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left cursor-pointer"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-primary">
          <Icon
            name="shield"
            className="h-4 w-4 fill-success"
            aria-hidden="true"
          />
          Consignes de sécurité (2)
        </span>
        <Icon
          name={open ? "angleSmallUp" : "angleSmallDown"}
          className="h-4 w-4 fill-primary/60"
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="mt-3 space-y-3 border-t border-primary/10 pt-3 text-sm leading-relaxed">
          <p>
            <span className="font-bold" style={{ color: "var(--fire)" }}>
              Feu
            </span>
            <span className="text-black">
              {" "}
              — Éloignez-vous dans la direction opposée au vent pour éviter les
              fumées. Appelez le 18 ou le 112. Fermez portes et volets si vous
              restez chez vous.
            </span>
          </p>
          <p>
            <span className="font-bold" style={{ color: "var(--storm)" }}>
              Tempête
            </span>
            <span className="text-black">
              {" "}
              — Restez à l'abri et limitez vos déplacements. Rangez ou arrimez
              les objets pouvant être emportés. Éloignez-vous des arbres et des
              lignes électriques.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

export default function SafetyInstructions() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Example
        className="sm:col-span-2 lg:col-span-3"
        title="Safety instructions"
        description="Carte pliable listant les consignes de sécurité par type d'incident concerné. Cliquer sur l'en-tête plie/déplie réellement le contenu."
        code={`function SafetyInstructionsCard() {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--primary-light)" }}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left cursor-pointer"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-primary">
          <Icon name="shield" className="h-4 w-4 fill-success" aria-hidden="true" />
          Consignes de sécurité (2)
        </span>
        <Icon
          name={open ? "angleSmallUp" : "angleSmallDown"}
          className="h-4 w-4 fill-primary/60"
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="mt-3 space-y-3 border-t border-primary/10 pt-3 text-sm leading-relaxed">
          <p>
            <span className="font-bold" style={{ color: "var(--fire)" }}>
              Feu
            </span>
            <span className="text-black">
              {" "}
              — Éloignez-vous dans la direction opposée au vent pour éviter les fumées.
              Appelez le 18 ou le 112. Fermez portes et volets si vous restez chez vous.
            </span>
          </p>
          <p>
            <span className="font-bold" style={{ color: "var(--storm)" }}>
              Tempête
            </span>
            <span className="text-black">
              {" "}
              — Restez à l'abri et limitez vos déplacements. Rangez ou arrimez les objets
              pouvant être emportés. Éloignez-vous des arbres et des lignes électriques.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}`}
      >
        <SafetyInstructionsDemo />
      </Example>
    </div>
  );
}
