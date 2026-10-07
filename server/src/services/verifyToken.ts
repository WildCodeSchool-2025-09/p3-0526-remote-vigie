import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import usersRepository from "../modules/users/usersRepository";
import { verifyAuthToken } from "./jwt";

const verifyToken: RequestHandler = async (req, res, next) => {
	const header = req.headers.authorization;
	const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

	if (token == null) {
		res.status(StatusCodes.UNAUTHORIZED).json({
			error: "unauthorized",
			message: "Connexion requise.",
		});
		return;
	}

	const payload = verifyAuthToken(token);
	if (payload == null) {
		res.status(StatusCodes.UNAUTHORIZED).json({
			error: "unauthorized",
			message: "Session invalide ou expirée.",
		});
		return;
	}

	try {
		// Le token est signé, mais le compte a pu être supprimé depuis son émission
		if (!(await usersRepository.isActive(Number(payload.sub)))) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				error: "unauthorized",
				message: "Session invalide ou expirée.",
			});
			return;
		}
	} catch (err) {
		next(err);
		return;
	}

	req.auth = payload;
	next();
};

export default verifyToken;
