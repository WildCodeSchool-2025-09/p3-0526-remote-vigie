import type { RequestHandler } from "express";

/**
 * 🔧 Bouchon US06 — l'authentification (JWT en en-tête Authorization: Bearer,
 * cf. workshop-js-auth) n'existe pas encore. Ce middleware pose directement la
 * forme cible sans jamais lire ni vérifier de token, et ne renvoie jamais 401.
 *
 * TODO US06 : remplacer le corps par un vrai jwt.verify(token, process.env.APP_SECRET)
 * — token lu dans l'en-tête `Authorization: Bearer <token>` — et poser req.auth
 * depuis le payload réel ({ sub, isAdmin }). Le contrat (req.auth.sub en string)
 * ne changera pas : seul l'import dans router.ts sera à modifier.
 */
const verifyToken: RequestHandler = (req, _res, next) => {
	req.auth = { sub: "1", isAdmin: false };
	next();
};

export default verifyToken;
