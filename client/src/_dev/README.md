# `_dev/`

Pages et outils **de développement uniquement**. Rien ici n'est une page de l'app.

| Route | Fichier | But |
| --- | --- | --- |
| `/design` | `DesignIndex.tsx` | Index vers les pages de dev du design system. |
| `/design/colors` | `ColorPalette.tsx` | Visualiser la palette déclarée dans `src/styles/theme.css`. |
| `/design/icons` | `IconGallery.tsx` | Visualiser les icônes déclarées dans `src/assets/icons/index.ts`. |

Ces routes sont branchées dans `src/main.tsx` sous un bloc commenté « DEV ONLY ».
Ne pas lier vers elles depuis la navigation de l'app.
