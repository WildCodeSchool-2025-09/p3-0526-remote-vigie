import type { RequestHandler } from "express";
import badgeService from "./badgeService";

// Only BREAD here (Browse, Read, Edit, Add, Delete)

// Collection of the logged-in user
const browse: RequestHandler = async (req, res, next) => {
	try {
		const userId = Number(req.auth?.sub);
		const collection = await badgeService.readCollection(userId);

		res.json(collection);
	} catch (err) {
		next(err);
	}
};

export default {
	browse,
};
