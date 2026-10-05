import type { RequestHandler } from "express";
import badgeService from "./badgeService";

// Only BREAD here (Browse, Read, Edit, Add, Delete)

// Collection de badges de l'utilisateur connecté (route protégée par verifyToken).
// Aucun identifiant en paramètre : on ne consulte jamais que ses propres badges.
const browse: RequestHandler = async (req, res, next) => {
	try {
		const userId = Number(req.auth?.sub);
		const collection = await badgeService.readCollection(userId);

		res.json(collection);
	} catch (err) {
		next(err);
	}
};

export default {
	browse,
};
