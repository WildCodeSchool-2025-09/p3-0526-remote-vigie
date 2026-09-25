import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import incidentRepository from "../modules/incident/incidentRepository";

const MAX_INCIDENTS_PER_HOUR = 5;

const checkIncidentRateLimit: RequestHandler = async (req, res, next) => {
	try {
		if (req.auth == null) {
			res.sendStatus(StatusCodes.UNAUTHORIZED);
			return;
		}

		const userId = Number(req.auth.sub);
		const recentCount = await incidentRepository.countRecentByUser(userId);
		if (recentCount >= MAX_INCIDENTS_PER_HOUR) {
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
