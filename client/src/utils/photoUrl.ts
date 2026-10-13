// L'API enregistre les photos sous /uploads/<uuid>.<ext> et le jeu de démo vit
// sous /demo/ : des chemins relatifs à l'API. En dev la page (3000) et l'API
// (3310) n'ont pas la même origine, et un <img src="/uploads/..."> serait
// cherché sur la page, pas sur l'API.
// Tout le reste est rendu tel quel : URLs absolues, aperçus locaux (data:,
// blob:) d'une photo qui vient d'être choisie.
const API_PHOTO_PATH = /^\/(uploads|demo)\//;

export function resolvePhotoUrl(url: string): string {
	if (!API_PHOTO_PATH.test(url)) return url;

	return `${import.meta.env.VITE_API_URL ?? ""}${url}`;
}
