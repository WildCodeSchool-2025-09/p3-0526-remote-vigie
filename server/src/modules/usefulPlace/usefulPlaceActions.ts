import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import parseBounds from "../../services/parseBounds";
import usefulPlaceRepository from "./usefulPlaceRepository";

// Only BREAD here (Browse, Read, Edit, Add, Delete)

const browse: RequestHandler = async (req, res, next) => {
	try {
		const bounds = parseBounds(req.query);
		const usefulPlaces = await usefulPlaceRepository.readAll(bounds);
		res.status(StatusCodes.OK).json(usefulPlaces);
	} catch (err) {
		next(err);
	}
};

export default {
	browse,
};
