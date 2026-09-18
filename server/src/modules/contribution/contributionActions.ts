import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import incidentRepository from "../incident/incidentRepository";
import contributionRepository from "./contributionRepository";

// Only BREAD here (Browse, Read, Edit, Add, Delete)

const add: RequestHandler = async (req, res, next) => {
	try {
		const incidentId = Number(req.params.id);

		if (!Number.isInteger(incidentId) || incidentId <= 0) {
			res.sendStatus(StatusCodes.BAD_REQUEST);
			return;
		}

		const body = req.body as { type?: unknown };

		if (body.type !== "confirm" && body.type !== "deny") {
			res.sendStatus(StatusCodes.BAD_REQUEST);
			return;
		}

		const type = body.type;
		const userId = Number(req.auth?.sub);

		const targetIncident =
			await incidentRepository.findOwnerAndStatus(incidentId);

		if (targetIncident == null) {
			res.sendStatus(StatusCodes.NOT_FOUND);
			return;
		}

		if (targetIncident.userId === userId) {
			res.status(StatusCodes.FORBIDDEN).json({
				message: "Vous ne pouvez pas contribuer à votre propre signalement.",
			});
			return;
		}

		if (targetIncident.status === "resolved") {
			res.status(StatusCodes.CONFLICT).json({
				message: "Cet incident est résolu, il n'accepte plus de contributions.",
			});
			return;
		}

		await contributionRepository.create(incidentId, userId, type);

		const counts = await contributionRepository.countByIncident(incidentId);

		res.status(StatusCodes.CREATED).json(counts);
	} catch (err) {
		next(err);
	}
};

export default {
	add,
};
