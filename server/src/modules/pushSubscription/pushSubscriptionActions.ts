import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

// Only BREAD here (Browse, Read, Edit, Add, Delete)

// Clé publique VAPID : le navigateur en a besoin pour s'abonner (US21).
// Elle n'est pas secrète, la route est donc publique.
const readPublicKey: RequestHandler = (_req, res) => {
	const publicKey = process.env.VAPID_PUBLIC_KEY;

	if (!publicKey) {
		res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
			error: "PUSH_NOT_CONFIGURED",
			message: "Les notifications push ne sont pas configurées.",
		});
		return;
	}

	res.json({ publicKey });
};

export default {
	readPublicKey,
};
