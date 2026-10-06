// Service worker de Vigie (US21), servi à la racine pour contrôler tout le site.
// Pour l'instant il ne fait que s'installer et prendre la main sur les pages
// ouvertes. L'affichage des notifications push et le clic viendront ensuite,
// avec les événements `push` et `notificationclick`.

self.addEventListener("install", () => {
	// Pas d'attente : une nouvelle version remplace l'ancienne tout de suite.
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	// Prend le contrôle des onglets déjà ouverts sans exiger un rechargement.
	event.waitUntil(self.clients.claim());
});
