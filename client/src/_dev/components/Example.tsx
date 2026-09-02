/**
 * ⚠️ DEV ONLY — brique de la galerie de composants (/help/components).
 * Affiche un exemple : le rendu live au-dessus, la source TSX en dessous avec un bouton copier.
 * La source est une string écrite à la main : à garder synchro avec le rendu manuellement.
 */

import { type ReactNode, useState } from "react";

type ExampleProps = {
  title: string;
  description?: string;
  /** Source TSX affichée et copiée. À maintenir alignée sur `children` à la main. */
  code: string;
  /** Classes ajoutées à la carte (ex. col-span pour un exemple sur toute la ligne). */
  className?: string;
  children: ReactNode;
};

export default function Example({ title, description, code, className, children }: ExampleProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div
      className={`overflow-hidden rounded-xl border border-primary/10 bg-base-200${
        className ? ` ${className}` : ""
      }`}
    >
      <div className="border-b border-primary/10 px-4 py-2.5">
        <p className="text-sm font-bold text-primary">{title}</p>
        {description && <p className="mt-0.5 text-xs text-primary/50">{description}</p>}
      </div>

      {/* Rendu live */}
      <div className="flex flex-wrap items-center gap-3 bg-base-100 p-6">{children}</div>

      {/* Source TSX (écrite à la main) */}
      <div className="relative border-t border-primary/10">
        <button
          type="button"
          onClick={copy}
          className="absolute top-2 right-2 z-10 rounded border border-primary/10 bg-base-200 px-2 py-1 text-[11px] font-bold uppercase tracking-widest text-primary/50 transition hover:border-primary/30 hover:text-primary"
        >
          {copied ? "Copié" : "Copier"}
        </button>
        <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-primary/80">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
