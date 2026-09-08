import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import incidentRepository from "./incidentRepository";

const browse: RequestHandler = async (req, res, next) => {
	try {
		const incidents = await incidentRepository.readAll();
		res.status(StatusCodes.OK).json(incidents);
	} catch (err) {
		next(err);
	}
};

export default { browse };
