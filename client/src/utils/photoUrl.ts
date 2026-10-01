// Le serveur enregistre les photos sous /uploads/<uuid>.<ext>, un chemin relatif
// à l'API : en dev la page (3000) et l'API (3310) n'ont pas la même origine,
// et un <img src="/uploads/..."> serait cherché sur la page, pas sur l'API.
// Tout le reste est rendu tel quel : URLs absolues du jeu de démo, aperçus
// locaux (data:, blob:) d'une photo qui vient d'être choisie.
export function resolvePhotoUrl(url: string): string {
	if (!url.startsWith("/uploads/")) return url;

	return `${import.meta.env.VITE_API_URL ?? ""}${url}`;
}
