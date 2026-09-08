import type { RequestHandler } from "express";

import databaseClient from "../../database/client";
import type { Rows } from "../../database/client";

/**
 * Refuse l'accès (403) si l'e-mail de l'utilisateur connecté n'est pas vérifié.
 * À monter APRÈS verifyToken, qui pose req.user.
 *
 * 🔧 Contexte US06 : verifyToken est encore un bouchon (utilisateur n°1 forcé).
 * Ce middleware-ci fait une vraie requête sur user.email_verified_at à partir de
 * req.user.id — il n'a donc rien de bouché et ne changera pas en US06.
 * TODO US06 : juste revérifier l'enchaînement quand le vrai verifyToken arrive.
 */
const requireVerifiedEmail: RequestHandler = async (req, res, next) => {
	if (req.user == null) {
		// Filet si le middleware est monté sans verifyToken devant.
		res.sendStatus(401);
		return;
	}

	try {
		const [rows] = await databaseClient.query<Rows>(
			"SELECT email_verified_at FROM user WHERE id = ?",
			[req.user.id],
		);

		if (rows.length === 0) {
			// Le token désigne un compte qui n'existe plus.
			res.sendStatus(401);
			return;
		}

		if (rows[0].email_verified_at == null) {
			res.status(403).json({
				error: "email_not_verified",
				message:
					"Vérifiez votre adresse e-mail pour pouvoir publier un signalement.",
			});
			return;
		}

		next();
	} catch (error) {
		next(error);
	}
};

export default requireVerifiedEmail;
