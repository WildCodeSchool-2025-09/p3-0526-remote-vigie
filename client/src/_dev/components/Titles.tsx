/**
 * ⚠️ DEV ONLY — famille "Titles" de la galerie de composants (/help/components).
 * Chaque exemple : un rendu live (Tailwind + daisyUI) + sa source TSX (string, à garder synchro).
 * `font-title` = police Playfair Display (var --font-title de theme.css). `text-accent` = jaune or.
 */

import Example from "@/_dev/components/Example";

export default function Titles() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Example
        className="sm:col-span-2 lg:col-span-3"
        title="Title · h1 de page"
        description="Titre principal de page (ex. « Créer mon compte »). Taille fixe (text-3xl, calée mobile-first), couleur accent (jaune or) et font-title pour la police Playfair Display. Rendu ici sur fond primary comme sur la page."
        code={`<h1 className="font-title text-2xl font-bold text-accent">
  Créer mon compte
</h1>`}
      >
        <div className="w-full rounded-xl bg-primary p-6">
          <h1 className="font-title text-2xl font-bold text-accent">
            Créer mon compte
          </h1>
        </div>
      </Example>

      <Example
        className="sm:col-span-2 lg:col-span-3"
        title="Title · h2 de section"
        description="Titre de section (ex. « Que voulez-vous signaler ? »). Taille fixe (text-xl, calée mobile-first), couleur primary (vert foncé) et font-title pour la police Playfair Display."
        code={`<h2 className="font-title text-xl font-bold text-primary">
  Que voulez-vous signaler ?
</h2>`}
      >
        <h2 className="font-title text-xl font-bold text-primary">
          Que voulez-vous signaler ?
        </h2>
      </Example>
    </div>
  );
}
