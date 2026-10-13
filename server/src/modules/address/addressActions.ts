import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import geocodingService from "../../services/geocodingService";

const reverse: RequestHandler = async (req, res, next) => {
	try {
		const lat = Number(req.query.lat);
		const lng = Number(req.query.lng);
		if (
			!Number.isFinite(lat) ||
			!Number.isFinite(lng) ||
			lat < -90 ||
			lat > 90 ||
			lng < -180 ||
			lng > 180
		) {
			res.sendStatus(StatusCodes.BAD_REQUEST);
			return;
		}

		const address = await geocodingService.reverse(lat, lng);

		res.json(address);
	} catch (err) {
		next(err);
	}
};

const search: RequestHandler = async (req, res) => {
	try {
		const query = req.query.q;
		if (typeof query !== "string" || query.trim().length === 0) {
			res.sendStatus(StatusCodes.BAD_REQUEST);
			return;
		}

		const results = await geocodingService.search(query);

		res.json(results);
	} catch (err) {
		res.sendStatus(StatusCodes.SERVICE_UNAVAILABLE);
	}
};

export default {
	reverse,
	search,
};
