import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import parseBounds from "../../services/parseBounds";
import usefulPlaceRepository from "./usefulPlaceRepository";

// Au-delà, la zone n'a plus de sens pour la carte (le zoom 14 couvre ~0,1°).
const MAX_BOUNDS_SPAN_DEGREES = 1;

// Only BREAD here (Browse, Read, Edit, Add, Delete)

const browse: RequestHandler = async (req, res, next) => {
	try {
		const parsed = parseBounds(req.query);

		if (
			parsed.status !== "ok" ||
			parsed.bounds.north - parsed.bounds.south >
				MAX_BOUNDS_SPAN_DEGREES ||
			parsed.bounds.east - parsed.bounds.west > MAX_BOUNDS_SPAN_DEGREES
		) {
			res.status(StatusCodes.BAD_REQUEST).json({
				error: "invalid_bounds",
				message:
					"Zone invalide : north, south, east et west sont requis, sur une zone d'au plus 1 degré.",
			});
			return;
		}

		const usefulPlaces = await usefulPlaceRepository.readAll(parsed.bounds);
		res.status(StatusCodes.OK).json(usefulPlaces);
	} catch (err) {
		next(err);
	}
};

export default {
	browse,
};
