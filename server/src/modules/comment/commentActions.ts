import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import commentRepository from "./commentRepository";

// Only BREAD here (Browse, Read, Edit, Add, Delete)

const browse: RequestHandler = async (req, res, next) => {
	try {
		const incidentId = Number(req.params.id);

		if (!Number.isInteger(incidentId) || incidentId <= 0) {
			res.sendStatus(StatusCodes.BAD_REQUEST);
			return;
		}

		const comments = await commentRepository.browseByIncident(incidentId);

		res.json(comments);
	} catch (err) {
		next(err);
	}
};

const add: RequestHandler = async (req, res, next) => {
	try {
		res.sendStatus(StatusCodes.NOT_IMPLEMENTED);
	} catch (err) {
		next(err);
	}
};

export default {
	browse,
	add,
};
