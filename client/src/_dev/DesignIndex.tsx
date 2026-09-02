/**
 * ⚠️ PAGE DE DEV — pas une page de l'app.
 * Route : /design. Point d'entrée vers les pages de dev du design system (couleurs, icônes, ...).
 */

import { Link } from "react-router";

type Entry = {
  title: string;
  description: string;
  path?: string; // absent = pas encore disponible
};

const entries: Entry[] = [
  {
    title: "Couleurs",
    description: "Palette déclarée dans src/styles/theme.css.",
    path: "/design/colors",
  },
  {
    title: "Icônes",
    description: "Icônes déclarées dans src/assets/icons/index.ts.",
    path: "/design/icons",
  },
  {
    title: "Composants",
    description: "Bibliothèque de composants réutilisables. Bientôt disponible.",
  },
];

function EntryCard({ title, description, path }: Entry) {
  const content = (
    <>
      <p className="text-lg font-bold text-primary">{title}</p>
      <p className="mt-1 text-sm text-primary/60">{description}</p>
    </>
  );

  if (!path) {
    return (
      <div className="rounded-xl border border-dashed border-primary/15 bg-base-200 p-5 opacity-50">
        {content}
        <p className="mt-3 text-xs font-bold uppercase tracking-widest text-primary/40">
          Bientôt
        </p>
      </div>
    );
  }

  return (
    <Link
      to={path}
      className="block rounded-xl border border-primary/10 bg-base-200 p-5 transition hover:border-primary/30 hover:bg-base-100"
    >
      {content}
      <p className="mt-3 font-mono text-xs text-primary/40">{path}</p>
    </Link>
  );
}

export default function DesignIndex() {
  return (
    <div className="min-h-screen bg-base-200 px-6 py-10 text-primary md:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="inline-block rounded bg-error/15 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-error">
          Dev only · /design
        </p>
        <p className="mt-3 text-sm font-semibold italic text-primary/70">Vigie · design system</p>
        <h1 className="mt-1 text-4xl font-black">Design system</h1>
        <p className="mt-3 max-w-2xl text-sm text-primary/60">
          Point d'entrée vers les pages de dev du design system.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {entries.map((entry) => (
            <EntryCard key={entry.title} {...entry} />
          ))}
        </div>
      </div>
    </div>
  );
}
