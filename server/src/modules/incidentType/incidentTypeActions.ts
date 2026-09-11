import type { RequestHandler } from "express";
import incidentTypeRepository from "./incidentTypeRepository";

const browse: RequestHandler = async (_req, res, next) => {
	try {
		const IncidentTypes = await incidentTypeRepository.readAll();
		res.json(IncidentTypes);
	} catch (err) {
		next(err);
	}
};

export default {
	browse,
};
