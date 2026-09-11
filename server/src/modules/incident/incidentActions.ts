import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import incidentRepository from "./incidentRepository";

// Only BREAD here (Browse, Read, Edit, Add, Delete)

const DEFAULT_LIST_LIMIT = 15;
const MAX_LIST_LIMIT = 100;

const browse: RequestHandler = async (req, res, next) => {
	try {
		const requested =
			Number.parseInt(req.query.limit as string, 10) ||
			DEFAULT_LIST_LIMIT;
		const limit = Math.min(requested, MAX_LIST_LIMIT);

		const incidents = await incidentRepository.readAllActive(limit);
		res.status(StatusCodes.OK).json(incidents);
	} catch (err) {
		next(err);
	}
};

export default { browse };
