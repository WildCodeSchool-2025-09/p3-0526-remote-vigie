import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import incidentRepository from "../incident/incidentRepository";
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
		const incidentId = Number(req.params.id);

		if (!Number.isInteger(incidentId) || incidentId <= 0) {
			res.sendStatus(StatusCodes.BAD_REQUEST);
			return;
		}

		const body = req.body as { content?: unknown };

		if (
			typeof body.content !== "string" ||
			body.content.trim().length === 0 ||
			body.content.length > 500
		) {
			res.sendStatus(StatusCodes.BAD_REQUEST);
			return;
		}

		const incident = await incidentRepository.findOwnerAndStatus(incidentId);

		if (incident == null) {
			res.sendStatus(StatusCodes.NOT_FOUND);
			return;
		}

		if (incident.status === "resolved") {
			res.status(StatusCodes.CONFLICT).json({
				message:
					"Cet incident est résolu, il n'est plus possible de le commenter.",
			});
			return;
		}

		if (req.auth == null) {
			res.sendStatus(StatusCodes.UNAUTHORIZED);
			return;
		}

		const id = await commentRepository.create({
			userId: Number(req.auth.sub),
			incidentId,
			content: body.content.trim(),
		});

		res.status(StatusCodes.CREATED).json({ id });
	} catch (err) {
		next(err);
	}
};

export default {
	browse,
	add,
};
