import type { RequestHandler } from "express";

/**
 * 🔧 Bouchon US06 — l'authentification (connexion + JWT) n'existe pas encore.
 *
 * Ce middleware protège les routes réservées aux membres connectés. Pour
 * l'instant il fait *comme si* l'utilisateur n°1 était toujours connecté :
 * il pose `req.user` et laisse passer, sans jamais renvoyer 401.
 *
 * TODO US06 : remplacer par le vrai verifyToken —
 *   1. lire le JWT dans le cookie httpOnly,
 *   2. le vérifier (signature + expiration),
 *   3. si absent ou invalide → `res.sendStatus(401)`,
 *   4. sinon → `req.user = { id: <sub du token> }` puis `next()`.
 * La signature (RequestHandler) et le contrat (`req.user.id`) ne changeront pas :
 * seul l'import dans router.ts sera à modifier.
 */
const verifyToken: RequestHandler = (req, _res, next) => {
	req.user = { id: 1 };
	next();
};

export default verifyToken;
