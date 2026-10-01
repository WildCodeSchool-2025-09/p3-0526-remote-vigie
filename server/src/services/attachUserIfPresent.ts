import type { RequestHandler } from "express";

/**
 * 🔧 Bouchon US06 — comme verifyToken, mais avec un contrat différent : cette
 * route doit rester accessible sans compte (US02, « visiteur non connecté voit
 * la fiche »). Une fois l'authentification réelle en place, ce middleware ne
 * devra JAMAIS renvoyer 401 : il pose req.auth seulement si un token valide est
 * présent, et laisse passer sans rien poser sinon.
 *
 * TODO US06 : lire l'en-tête `Authorization: Bearer <token>` ; absent ou
 * invalide → ne rien poser sur req.auth, appeler next() quand même ; valide →
 * poser req.auth depuis le payload réel, comme verifyToken.
 *
 * Pour l'instant, comme aucun vrai token n'existe encore à lire, ce stub pose
 * la même identité que verifyToken — la différence entre les deux n'est pas
 * observable aujourd'hui, seulement dans le contrat que chacun devra respecter
 * une fois l'US06 en place.
 */
const attachUserIfPresent: RequestHandler = (req, _res, next) => {
	req.auth = { sub: "1", isAdmin: false };
	next();
};

export default attachUserIfPresent;
