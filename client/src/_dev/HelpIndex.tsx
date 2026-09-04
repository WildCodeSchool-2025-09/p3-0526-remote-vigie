/**
 * ⚠️ PAGE DE DEV — pas une page de l'app.
 * Route : /help. Point d'entrée vers les ressources de dev (documentation, design system,
 * technique...).
 */

import type { ReactNode } from "react";
import { Link } from "react-router";

type Entry = {
  title: string;
  description: string;
  path?: string; // absent = pas encore disponible
};

type ExternalLink = {
  title: string;
  description: string;
  href: string;
};

const documentation: Entry[] = [
  {
    title: "README",
    description: "Contenu du README.md à la racine du repo, rendu dans l'app.",
    path: "/help/readme",
  },
  {
    title: "VIGIE.md",
    description: "Contenu du VIGIE.md à la racine du repo, rendu dans l'app.",
    path: "/help/vigie",
  },
];

const design: Entry[] = [
  {
    title: "Couleurs",
    description: "Palette déclarée dans src/styles/theme.css.",
    path: "/help/colors",
  },
  {
    title: "Icônes",
    description: "Icônes déclarées dans src/assets/icons/index.ts.",
    path: "/help/icons",
  },
  {
    title: "Composants",
    description: "Bibliothèque de composants UI assemblés (Tailwind + daisyUI), stylés pour Vigie.",
    path: "/help/components",
  },
];

const responsiveLinks: ExternalLink[] = [
  {
    title: "Responsive design",
    description: "Breakpoints et utilitaires responsive de Tailwind.",
    href: "https://tailwindcss.com/docs/responsive-design",
  },
  {
    title: "Orientation",
    description: "Cibler l'orientation portrait/paysage (states Tailwind).",
    href: "https://tailwindcss.com/docs/hover-focus-and-other-states#orientation",
  },
];

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mt-10 mb-3 flex items-center gap-3">
      <h2 className="text-lg font-bold uppercase tracking-widest text-primary/60">{children}</h2>
      <span className="h-px flex-1 bg-primary/15" />
    </div>
  );
}

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

function ExternalLinkCard({ title, description, href }: ExternalLink) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="block rounded-xl border border-primary/10 bg-base-200 p-5 transition hover:border-primary/30 hover:bg-base-100"
    >
      <p className="text-lg font-bold text-primary">{title}</p>
      <p className="mt-1 text-sm text-primary/60">{description}</p>
      <p className="mt-3 font-mono text-xs text-primary/40">{href}</p>
    </a>
  );
}

export default function HelpIndex() {
  return (
    <div className="min-h-screen bg-base-200 px-6 py-10 text-primary md:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="inline-block rounded bg-error/15 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-error">
          Dev only · /help
        </p>
        <p className="mt-3 text-sm font-semibold italic text-primary/70">Vigie · ressources dev</p>
        <h1 className="mt-1 text-2xl font-black">Aide</h1>
        <p className="mt-3 max-w-2xl text-sm text-primary/60">
          Point d'entrée vers les ressources de dev du projet.
        </p>

        <SectionTitle>Documentation</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          {documentation.map((entry) => (
            <EntryCard key={entry.title} {...entry} />
          ))}
        </div>

        <SectionTitle>Design</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {design.map((entry) => (
            <EntryCard key={entry.title} {...entry} />
          ))}
        </div>
        <p className="mt-6 mb-2 text-[11px] font-bold uppercase tracking-widest text-primary/40">
          Responsive
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {responsiveLinks.map((link) => (
            <ExternalLinkCard key={link.title} {...link} />
          ))}
        </div>

        <SectionTitle>Technique</SectionTitle>
        <p className="text-sm italic text-primary/40">Rien pour l'instant.</p>
      </div>
    </div>
  );
}
