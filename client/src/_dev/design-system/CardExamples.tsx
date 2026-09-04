// ⚠️ DEV ONLY — famille "Cards" de la galerie de composants (/help/components).

import Example from "@/_dev/design-system/Example";
import SectionLabel from "@/_dev/design-system/SectionLabel";
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

export default function CardExamples() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <SectionLabel>Consignes de sécurité</SectionLabel>

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

      <SectionLabel>Incident</SectionLabel>

      <Example
        className="sm:col-span-2 lg:col-span-3"
        title="Card · type"
        description="Carte d'un incident dans une liste : bordure fine tout autour pour se détacher d'un fond de même couleur, liseré épais du type à gauche (border-l-8, borderLeftColor uniquement), pictogramme + label du type, chips gravité + statut, titre (font-title) et méta (lieu · ancienneté)."
        code={`<div
  className="flex items-center gap-3 rounded-2xl border border-l-8 border-primary/10 bg-base-300 p-3"
  style={{ borderLeftColor: "var(--fire)" }}
>
  <div className="flex shrink-0 flex-col items-center gap-1">
    <div
      className="flex h-14 w-14 items-center justify-center rounded-xl"
      style={{ backgroundColor: "var(--bg-fire)" }}
    >
      <Icon name="fire" className="h-7 w-7" aria-hidden="true" />
    </div>
    <span className="text-xs font-bold" style={{ color: "var(--fire)" }}>
      Feu
    </span>
  </div>

  <div className="min-w-0 flex-1">
    <div className="flex flex-wrap items-center gap-1.5">
      <div
        className="badge badge-sm border font-bold"
        style={{ borderColor: "var(--level-5)", backgroundColor: "var(--bg-level-5)", color: "var(--level-5)" }}
      >
        Incident grave
      </div>
      <div className="badge badge-soft badge-success badge-sm gap-1.5 font-bold">
        <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
        En cours
      </div>
    </div>
    <h2 className="mt-1.5 font-title text-base font-bold text-primary">
      Feu de broussailles au bord de la D904
    </h2>
    <p className="mt-1 text-xs text-primary/50">Alès · il y a 12 min</p>
  </div>

  <Icon name="angleSmallRight" className="h-4 w-4 shrink-0 fill-primary/30" aria-hidden="true" />
</div>`}
      >
        <div
          className="flex items-center gap-3 rounded-2xl border border-l-8 border-primary/10 bg-base-300 p-3"
          style={{ borderLeftColor: "var(--fire)" }}
        >
          <div className="flex shrink-0 flex-col items-center gap-1">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl"
              style={{ backgroundColor: "var(--bg-fire)" }}
            >
              <Icon name="fire" className="h-7 w-7" aria-hidden="true" />
            </div>
            <span className="text-xs font-bold" style={{ color: "var(--fire)" }}>
              Feu
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <div
                className="badge badge-sm border font-bold"
                style={{ borderColor: "var(--level-5)", backgroundColor: "var(--bg-level-5)", color: "var(--level-5)" }}
              >
                Incident grave
              </div>
              <div className="badge badge-soft badge-success badge-sm gap-1.5 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                En cours
              </div>
            </div>
            <h2 className="mt-1.5 font-title text-base font-bold text-primary">
              Feu de broussailles au bord de la D904
            </h2>
            <p className="mt-1 text-xs text-primary/50">Alès · il y a 12 min</p>
          </div>

          <Icon name="angleSmallRight" className="h-4 w-4 shrink-0 fill-primary/30" aria-hidden="true" />
        </div>
      </Example>

      <Example
        className="sm:col-span-2 lg:col-span-3"
        title="Card · type · liste"
        description="Plusieurs cartes empilées (space-y-3), un type différent par carte. Pas d'encart supplémentaire derrière : dans l'app les cartes reposent directement sur le fond de page, la bordure suffit à les détacher."
        code={`<div className="space-y-3">
  <div
    className="flex items-center gap-3 rounded-2xl border border-l-8 border-primary/10 bg-base-300 p-3"
    style={{ borderLeftColor: "var(--flood)" }}
  >
    <div className="flex shrink-0 flex-col items-center gap-1">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-xl"
        style={{ backgroundColor: "var(--bg-flood)" }}
      >
        <Icon name="flood" className="h-7 w-7" aria-hidden="true" />
      </div>
      <span className="text-xs font-bold" style={{ color: "var(--flood)" }}>
        Inondation
      </span>
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-1.5">
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
      <h2 className="mt-1.5 font-title text-base font-bold text-primary">
        Route submergée sous le pont
      </h2>
      <p className="mt-1 text-xs text-primary/50">Saint-Christol · il y a 1 h</p>
    </div>
    <Icon name="angleSmallRight" className="h-4 w-4 shrink-0 fill-primary/30" aria-hidden="true" />
  </div>

  <div
    className="flex items-center gap-3 rounded-2xl border border-l-8 border-primary/10 bg-base-300 p-3"
    style={{ borderLeftColor: "var(--wild)" }}
  >
    <div className="flex shrink-0 flex-col items-center gap-1">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-xl"
        style={{ backgroundColor: "var(--bg-wild)" }}
      >
        <Icon name="wild" className="h-7 w-7" aria-hidden="true" />
      </div>
      <span className="text-xs font-bold" style={{ color: "var(--wild)" }}>
        Animal
      </span>
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <div
          className="badge badge-sm border font-bold"
          style={{ borderColor: "var(--level-2)", backgroundColor: "var(--bg-level-2)", color: "var(--level-2)" }}
        >
          Incident modéré
        </div>
        <div className="badge badge-soft badge-success badge-sm gap-1.5 font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
          En cours
        </div>
      </div>
      <h2 className="mt-1.5 font-title text-base font-bold text-primary">
        Sanglier sur la départementale
      </h2>
      <p className="mt-1 text-xs text-primary/50">Alès · il y a 3 h</p>
    </div>
    <Icon name="angleSmallRight" className="h-4 w-4 shrink-0 fill-primary/30" aria-hidden="true" />
  </div>

  <div
    className="flex items-center gap-3 rounded-2xl border border-l-8 border-primary/10 bg-base-300 p-3"
    style={{ borderLeftColor: "var(--insect)" }}
  >
    <div className="flex shrink-0 flex-col items-center gap-1">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-xl"
        style={{ backgroundColor: "var(--bg-insect)" }}
      >
        <Icon name="insect" className="h-7 w-7" aria-hidden="true" />
      </div>
      <span className="text-xs font-bold" style={{ color: "var(--insect)" }}>
        Insectes
      </span>
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <div
          className="badge badge-sm border font-bold"
          style={{ borderColor: "var(--level-1)", backgroundColor: "var(--bg-level-1)", color: "var(--level-1)" }}
        >
          Incident faible
        </div>
        <div className="badge badge-soft badge-success badge-sm gap-1.5 font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
          En cours
        </div>
      </div>
      <h2 className="mt-1.5 font-title text-base font-bold text-primary">
        Nid d'insectes près de l'école
      </h2>
      <p className="mt-1 text-xs text-primary/50">Saint-Privat · il y a 6 h</p>
    </div>
    <Icon name="angleSmallRight" className="h-4 w-4 shrink-0 fill-primary/30" aria-hidden="true" />
  </div>
</div>`}
      >
        <div className="space-y-3">
          <div
            className="flex items-center gap-3 rounded-2xl border border-l-8 border-primary/10 bg-base-300 p-3"
            style={{ borderLeftColor: "var(--flood)" }}
          >
            <div className="flex shrink-0 flex-col items-center gap-1">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-xl"
                style={{ backgroundColor: "var(--bg-flood)" }}
              >
                <Icon name="flood" className="h-7 w-7" aria-hidden="true" />
              </div>
              <span className="text-xs font-bold" style={{ color: "var(--flood)" }}>
                Inondation
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
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
              <h2 className="mt-1.5 font-title text-base font-bold text-primary">
                Route submergée sous le pont
              </h2>
              <p className="mt-1 text-xs text-primary/50">Saint-Christol · il y a 1 h</p>
            </div>
            <Icon name="angleSmallRight" className="h-4 w-4 shrink-0 fill-primary/30" aria-hidden="true" />
          </div>

          <div
            className="flex items-center gap-3 rounded-2xl border border-l-8 border-primary/10 bg-base-300 p-3"
            style={{ borderLeftColor: "var(--wild)" }}
          >
            <div className="flex shrink-0 flex-col items-center gap-1">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-xl"
                style={{ backgroundColor: "var(--bg-wild)" }}
              >
                <Icon name="wild" className="h-7 w-7" aria-hidden="true" />
              </div>
              <span className="text-xs font-bold" style={{ color: "var(--wild)" }}>
                Animal
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <div
                  className="badge badge-sm border font-bold"
                  style={{ borderColor: "var(--level-2)", backgroundColor: "var(--bg-level-2)", color: "var(--level-2)" }}
                >
                  Incident modéré
                </div>
                <div className="badge badge-soft badge-success badge-sm gap-1.5 font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                  En cours
                </div>
              </div>
              <h2 className="mt-1.5 font-title text-base font-bold text-primary">
                Sanglier sur la départementale
              </h2>
              <p className="mt-1 text-xs text-primary/50">Alès · il y a 3 h</p>
            </div>
            <Icon name="angleSmallRight" className="h-4 w-4 shrink-0 fill-primary/30" aria-hidden="true" />
          </div>

          <div
            className="flex items-center gap-3 rounded-2xl border border-l-8 border-primary/10 bg-base-300 p-3"
            style={{ borderLeftColor: "var(--insect)" }}
          >
            <div className="flex shrink-0 flex-col items-center gap-1">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-xl"
                style={{ backgroundColor: "var(--bg-insect)" }}
              >
                <Icon name="insect" className="h-7 w-7" aria-hidden="true" />
              </div>
              <span className="text-xs font-bold" style={{ color: "var(--insect)" }}>
                Insectes
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <div
                  className="badge badge-sm border font-bold"
                  style={{ borderColor: "var(--level-1)", backgroundColor: "var(--bg-level-1)", color: "var(--level-1)" }}
                >
                  Incident faible
                </div>
                <div className="badge badge-soft badge-success badge-sm gap-1.5 font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                  En cours
                </div>
              </div>
              <h2 className="mt-1.5 font-title text-base font-bold text-primary">
                Nid d'insectes près de l'école
              </h2>
              <p className="mt-1 text-xs text-primary/50">Saint-Privat · il y a 6 h</p>
            </div>
            <Icon name="angleSmallRight" className="h-4 w-4 shrink-0 fill-primary/30" aria-hidden="true" />
          </div>
        </div>
      </Example>
    </div>
  );
}
