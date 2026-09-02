/**
 * ⚠️ PAGE DE DEV — pas une page de l'app.
 * Route : /help/components. Bibliothèque de composants UI assemblés (Tailwind + daisyUI),
 * stylés pour Vigie.
 *
 * Chaque famille vit dans src/_dev/components/<Famille>.tsx et expose des exemples :
 * rendu live + source TSX copiable (écrite à la main). On "pioche" ici en copiant la
 * source quand on construit les vrais composants de l'app. Rien n'est importé par l'app.
 */

import type { ComponentType, ReactNode } from "react";
import BackButton from "@/_dev/BackButton";
import Buttons from "@/_dev/components/Buttons";

type Family = {
  id: string;
  title: string;
  description: string;
  Component: ComponentType;
};

// Ordre d'affichage = ordre du tableau. Ajouter une famille = 1 fichier + 1 entrée ici.
const families: Family[] = [
  {
    id: "buttons",
    title: "Buttons",
    description: "Boutons : variantes, tailles, états.",
    Component: Buttons,
  },
];

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mt-10 mb-3 flex items-center gap-3">
      <h2 className="text-xs font-bold uppercase tracking-widest text-primary/60">{children}</h2>
      <span className="h-px flex-1 bg-primary/15" />
    </div>
  );
}

export default function ComponentGallery() {
  return (
    <div className="min-h-screen bg-base-200 px-6 py-10 text-primary md:px-12">
      <div className="relative mx-auto max-w-5xl">
        <p className="inline-block rounded bg-error/15 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-error">
          Dev only · /help/components
        </p>
        <BackButton />
        <p className="mt-3 text-sm font-semibold italic text-primary/70">Vigie · design system</p>
        <h1 className="mt-1 text-4xl font-black">Bibliothèque de composants</h1>
        <p className="mt-3 max-w-2xl text-sm text-primary/60">
          Composants UI assemblés à partir de Tailwind et daisyUI, stylés pour Vigie. Chaque exemple
          montre le rendu live et sa source TSX à copier.
        </p>

        {/* Sommaire — inutile tant qu'il n'y a qu'une famille */}
        {families.length > 1 && (
          <nav className="mt-6 flex flex-wrap gap-2">
            {families.map((family) => (
              <a
                key={family.id}
                href={`#${family.id}`}
                className="rounded-full border border-primary/10 bg-base-200 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary/50 transition hover:border-primary/30 hover:text-primary"
              >
                {family.title}
              </a>
            ))}
          </nav>
        )}

        {families.map(({ id, title, description, Component }) => (
          <section key={id} id={id} className="scroll-mt-6">
            <SectionTitle>{title}</SectionTitle>
            <p className="mb-4 text-xs text-primary/40">{description}</p>
            <Component />
          </section>
        ))}
      </div>
    </div>
  );
}
