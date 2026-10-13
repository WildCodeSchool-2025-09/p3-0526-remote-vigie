import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import incidentRepository from "../modules/incident/incidentRepository";
import usersRepository from "../modules/users/usersRepository";

const MAX_INCIDENTS_PER_HOUR = 5;

// Comptes de test du seed exemptés de la limite (jamais en production).
const EXEMPT_PSEUDOS = ["admin1", "admin2"];

const checkIncidentRateLimit: RequestHandler = async (req, res, next) => {
	try {
		if (req.auth == null) {
			res.sendStatus(StatusCodes.UNAUTHORIZED);
			return;
		}

		const userId = Number(req.auth.sub);

		const recentCount = await incidentRepository.countRecentByUser(userId);
		if (recentCount >= MAX_INCIDENTS_PER_HOUR) {
			if (process.env.NODE_ENV !== "production") {
				const user = await usersRepository.read(userId);
				if (EXEMPT_PSEUDOS.includes(user?.pseudo_normalized)) {
					next();
					return;
				}
			}

			res.status(StatusCodes.TOO_MANY_REQUESTS).json({
				message:
					"Vous avez atteint la limite de signalements pour cette heure. Veuillez réessayer plus tard.",
			});
			return;
		}

		next();
	} catch (err) {
		next(err);
	}
};

export default checkIncidentRateLimit;
