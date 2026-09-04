// ⚠️ PAGE DE DEV — bibliothèque de composants UI (/help/components), pas une page de l'app.

import BackButton from "@/_dev/BackButton";
import ButtonsExamples from "@/_dev/design-system/ButtonsExamples";
import LayoutExamples from "@/_dev/design-system/LayoutExamples";
import FormInputExamples from "@/_dev/design-system/FormInputExamples";
import SafetyInstructionsExamples from "@/_dev/design-system/SafetyInstructionsExamples";
import TitlesExamples from "@/_dev/design-system/TitlesExamples";
import OtherExamples from "./OtherExamples";
import { type ComponentType, type ReactNode, useState } from "react";

type Family = {
  id: string;
  title: string;
  description: string;
  Component?: ComponentType;
};

const families: Family[] = [
  {
    id: "buttons",
    title: "Buttons",
    description: "Boutons : variantes, tailles, états.",
    Component: ButtonsExamples,
  },
  {
    id: "titles",
    title: "Titles",
    description: "Titres et hiérarchie typographique.",
    Component: TitlesExamples,
  },
  {
    id: "cards",
    title: "Cards",
    description: "Cartes et conteneurs de contenu.",
    Component: SafetyInstructionsExamples,
  },
  {
    id: "layout",
    title: "Layout",
    description: "Gabarits de page, grilles, espacements.",
    Component: LayoutExamples,
  },
  {
    id: "form",
    title: "Form",
    description: "Champs, labels, aides et états de validation.",
    Component: FormInputExamples,
  },
  {
    id: "others",
    title: "Others",
    description: "Le reste : badges, alertes, séparateurs, etc.",
    Component: OtherExamples,
  },
];

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mt-8 mb-3 flex items-center gap-3">
      <h2 className="text-xs font-bold uppercase tracking-widest text-primary/60">
        {children}
      </h2>
      <span className="h-px flex-1 bg-primary/15" />
    </div>
  );
}

export default function ComponentGallery() {
  const [activeId, setActiveId] = useState(families[0].id);
  const active =
    families.find((family) => family.id === activeId) ?? families[0];
  const ActiveComponent = active.Component;

  return (
    <div className="min-h-screen bg-base-200 px-6 py-10 text-primary md:px-12">
      <div className="relative mx-auto max-w-5xl">
        <p className="inline-block rounded bg-error/15 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-error">
          Dev only · /help/components
        </p>
        <BackButton />
        <p className="mt-3 text-sm font-semibold italic text-primary/70">
          Vigie · design system
        </p>
        <h1 className="mt-1 text-4xl font-black">Bibliothèque de composants</h1>
        <p className="mt-3 max-w-2xl text-sm text-primary/60">
          Composants UI assemblés à partir de Tailwind et daisyUI, stylés pour
          Vigie. Chaque exemple montre le rendu live et sa source TSX à copier.
        </p>

        <div role="tablist" className="tabs tabs-box mt-6 flex-wrap">
          {families.map((family) => (
            <button
              key={family.id}
              type="button"
              role="tab"
              aria-selected={family.id === activeId}
              onClick={() => setActiveId(family.id)}
              className={`tab ${family.id === activeId ? "tab-active" : ""} ${
                family.Component ? "" : "text-primary/30"
              }`}
            >
              {family.title}
            </button>
          ))}
        </div>

        <section role="tabpanel">
          <SectionTitle>{active.title}</SectionTitle>
          <p className="mb-4 text-xs text-primary/40">{active.description}</p>
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <p className="rounded-xl border border-dashed border-primary/15 bg-base-200 p-5 text-xs font-bold uppercase tracking-widest text-primary/40">
              Bientôt
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
