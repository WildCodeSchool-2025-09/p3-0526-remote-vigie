# `_dev/`

Pages et outils **de développement uniquement**. Rien ici n'est une page de l'app.

| Route | Fichier | But |
| --- | --- | --- |
| `/help` | `HelpIndex.tsx` | Index vers les ressources de dev (Documentation, Design, Technique). |
| `/help/readme` | `ReadmeViewer.tsx` | Rendu du README.md à la racine du repo (markdown + mermaid, via `MarkdownDoc.tsx`). |
| `/help/vigie` | `VigieViewer.tsx` | Rendu du VIGIE.md à la racine du repo (via `MarkdownDoc.tsx`). |
| `/help/colors` | `ColorPalette.tsx` | Visualiser la palette déclarée dans `src/styles/theme.css`. |
| `/help/icons` | `IconGallery.tsx` | Visualiser les icônes déclarées dans `src/assets/icons/index.ts`. |
| `/help/components` | `components/ComponentGallery.tsx` | Bibliothèque de composants UI assemblés (Tailwind + daisyUI). Une famille = un fichier `components/<Famille>.tsx` ; chaque exemple montre le rendu live + sa source TSX copiable (écrite à la main). |

Ces routes sont branchées dans `src/main.tsx` dans un bloc `if (import.meta.env.DEV)`.
Elles n'existent que lorsque l'app tourne via `vite dev` : dans un `vite build` (donc en prod),
la condition est repliée à `false` et tout le bloc — routes, imports lazy, et le code des
pages qu'ils chargent — est éliminé du bundle. `/help` et compagnie renvoient un 404 une fois
déployé.
Ne pas lier vers elles depuis la navigation de l'app.
