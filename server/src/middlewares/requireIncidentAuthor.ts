import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import incidentRepository from "../modules/incident/incidentRepository";

const requireIncidentAuthor: RequestHandler = async (req, res, next) => {
	try {
		const id = Number(req.params.id);

		if (!Number.isInteger(id) || id <= 0) {
			res.sendStatus(StatusCodes.BAD_REQUEST);
			return;
		}

		const targetIncident = await incidentRepository.findOwnerAndStatus(id);

		if (targetIncident == null) {
			res.sendStatus(StatusCodes.NOT_FOUND);
			return;
		}

		if (req.auth == null || Number(req.auth.sub) !== targetIncident.userId) {
			res.status(StatusCodes.FORBIDDEN).json({
				message: "Vous n'êtes pas l'auteur de ce signalement.",
			});
			return;
		}

		if (targetIncident.status === "resolved") {
			res.status(StatusCodes.CONFLICT).json({
				message: "Cet incident est résolu, il n'est plus modifiable.",
			});
			return;
		}

		next();
	} catch (err) {
		next(err);
	}
};

export default requireIncidentAuthor;
