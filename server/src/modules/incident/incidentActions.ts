import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import incidentRepository from "./incidentRepository";

// Only BREAD here (Browse, Read, Edit, Add, Delete)

const read: RequestHandler = async (req, res, next) => {
	try {
		const id = Number(req.params.id);

		if (!Number.isInteger(id) || id <= 0) {
			res.sendStatus(StatusCodes.NOT_FOUND);
			return;
		}

		const incident = await incidentRepository.read(id);
		if (incident == null) {
			res.sendStatus(StatusCodes.NOT_FOUND);
			return;
		}

		res.json(incident);
	} catch (err) {
		next(err);
	}
};

export default {
	read,
};
