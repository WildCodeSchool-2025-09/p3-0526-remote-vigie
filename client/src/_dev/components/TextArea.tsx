/**
 * ⚠️ DEV ONLY — famille "Form" de la galerie de composants (/help/components), rendu par
 * FormInput.tsx aux côtés des champs simples. Chaque exemple : un rendu live (Tailwind +
 * daisyUI) + sa source TSX (string, à garder synchro).
 * Mêmes tokens que FormInput : bordure légère toujours visible, fond base-100, texte noir.
 */

import Example from "@/_dev/components/Example";

export default function TextArea() {
  return (
    <Example
      className="sm:col-span-2 lg:col-span-3"
      title="TextArea"
      description="Zone de texte multiligne."
      code={`<textarea
  rows={2}
  placeholder="Écrire un commentaire..."
  className="w-full resize-none rounded-3xl border-2 border-primary/15 bg-base-100 px-5 py-4 text-black placeholder:text-black/40 focus:outline-none"
/>`}
    >
      <textarea
        rows={2}
        placeholder="Écrire un commentaire..."
        className="w-full resize-none rounded-3xl border-2 border-primary/15 bg-base-100 px-5 py-4 text-black placeholder:text-black/40 focus:outline-none"
      />
    </Example>
  );
}
