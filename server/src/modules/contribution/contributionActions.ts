import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import contributionRepository from "./contributionRepository";

// Only BREAD here (Browse, Read, Edit, Add, Delete)

const add: RequestHandler = async (req, res, next) => {
	try {
		const incidentId = Number(req.params.id);

		if (!Number.isInteger(incidentId) || incidentId <= 0) {
			res.sendStatus(StatusCodes.BAD_REQUEST);
			return;
		}

		const type = req.body.type as "confirm" | "deny";
		const userId = Number(req.auth?.sub);

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
