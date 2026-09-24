import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import usefulPlaceRepository from "./usefulPlaceRepository";

// Only BREAD here (Browse, Read, Edit, Add, Delete)

const browse: RequestHandler = async (_req, res, next) => {
	try {
		const usefulPlaces = await usefulPlaceRepository.readAll();
		res.status(StatusCodes.OK).json(usefulPlaces);
	} catch (err) {
		next(err);
	}
};

export default {
	browse,
};
