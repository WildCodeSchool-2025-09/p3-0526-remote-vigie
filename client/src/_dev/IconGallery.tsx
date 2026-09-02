/**
 * ⚠️ PAGE DE DEV — pas une page de l'app.
 * Route : /help/icons. Sert uniquement à visualiser les icônes déclarées dans src/assets/icons/index.ts.
 * Chaque carte rend le composant SVG importé : elle reflète le fichier .svg en direct.
 */

import type { ReactNode } from "react";
import { icons, type IconName } from "@/assets/icons";
import BackButton from "@/_dev/BackButton";

// Catégories = sous-dossiers de src/assets/icons/
const categories: { title: string; description: string; names: IconName[] }[] = [
  {
    title: "Nav",
    description: "Icônes de navigation (src/assets/icons/nav/).",
    names: ["alert", "danger", "map", "notification", "profile"],
  },
  {
    title: "Types",
    description: "Icônes de type d'incident (src/assets/icons/types/).",
    names: [
      "animal",
      "fire",
      "flood",
      "glaze",
      "hail",
      "insect",
      "rockfall",
      "snow",
      "storm",
      "tornado",
      "tree",
      "wild",
    ],
  },
  {
    title: "Interface",
    description: "Icônes d'interface génériques (src/assets/icons/interface/).",
    names: [
      "angleSmallDown",
      "angleSmallLeft",
      "angleSmallRight",
      "angleSmallUp",
      "arrowSmallDown",
      "arrowSmallLeft",
      "arrowSmallRight",
      "arrowSmallUp",
      "bullet",
      "camera",
      "check",
      "checkCircle",
      "commentAltMiddle",
      "crossSmall",
      "diamondExclamation",
      "envelope",
      "exclamation",
      "info",
      "landLocation",
      "lock",
      "marker",
      "menuDotsVertical",
      "phoneFlip",
      "plusSmall",
      "quoteRight",
      "rotateRight",
      "share",
      "shield",
    ],
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

function IconCard({ name }: { name: IconName }) {
  const Component = icons[name];
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-primary/10 bg-base-200 p-3">
      <div className="flex h-14 w-full items-center justify-center rounded-md border border-primary/10 bg-base-100">
        <Component className="h-6 w-6 text-primary" aria-hidden="true" />
      </div>
      <p className="font-mono text-xs text-primary/50">{name}</p>
    </div>
  );
}

export default function IconGallery() {
  const total = Object.keys(icons).length;

  return (
    <div className="min-h-screen bg-base-200 px-6 py-10 text-primary md:px-12">
      <div className="relative mx-auto max-w-5xl">
        <p className="inline-block rounded bg-error/15 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-error">
          Dev only · /help/icons
        </p>
        <BackButton />
        <p className="mt-3 text-sm font-semibold italic text-primary/70">Vigie · design system</p>
        <h1 className="mt-1 text-4xl font-black">Icônes de assets/icons</h1>
        <p className="mt-3 max-w-2xl text-sm text-primary/60">
          {total} icônes disponibles via <span className="font-mono">{"<Icon name=\"...\" />"}</span>,
          groupées par sous-dossier de <span className="font-mono">src/assets/icons/</span>.
        </p>

        {categories.map((category) => (
          <div key={category.title}>
            {/* Catégorie : {category.title} */}
            <SectionTitle>{category.title}</SectionTitle>
            <p className="mb-3 text-xs text-primary/40">{category.description}</p>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 md:grid-cols-6">
              {category.names.map((name) => (
                <IconCard key={name} name={name} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
