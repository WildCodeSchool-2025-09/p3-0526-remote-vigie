// Marges d'autoPan des popups de la carte : Leaflet les décale hors des
// contrôles posés dessus (recherche et menu en haut, zoom à droite).
export const POPUP_AUTO_PAN_TOP_LEFT: [number, number] = [16, 64];
export const POPUP_AUTO_PAN_BOTTOM_RIGHT: [number, number] = [60, 16];
// Largeur maximale du texte d'une popup (300 par défaut) : sur mobile (375 px),
// la popup tient entre les marges ci-dessus sans passer sous le zoom.
export const POPUP_MAX_WIDTH = 200;
