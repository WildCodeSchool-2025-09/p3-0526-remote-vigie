import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import incidentRepository from "./incidentRepository";

// Only BREAD here (Browse, Read, Edit, Add, Delete)

const read: RequestHandler = async (req, res, next) => {
	try {
		const id = Number(req.params.id);

		if (!Number.isInteger(id) || id <= 0) {
			res.sendStatus(StatusCodes.BAD_REQUEST);
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

const edit: RequestHandler = async (req, res, next) => {
	try {
		const id = Number(req.params.id);

		const body = req.body as {
			title?: unknown;
			description?: unknown;
			photoUrl?: unknown;
		};

		if (
			typeof body.title !== "string" ||
			body.title.trim().length === 0 ||
			body.title.length > 150
		) {
			res.sendStatus(StatusCodes.BAD_REQUEST);
			return;
		}

		if (
			body.description != null &&
			(typeof body.description !== "string" ||
				body.description.length > 1000)
		) {
			res.sendStatus(StatusCodes.BAD_REQUEST);
			return;
		}

		if (body.photoUrl != null && typeof body.photoUrl !== "string") {
			res.sendStatus(StatusCodes.BAD_REQUEST);
			return;
		}

		const description =
			body.description == null || body.description.trim().length === 0
				? null
				: body.description.trim();
		const photoUrl =
			body.photoUrl == null || body.photoUrl.trim().length === 0
				? null
				: body.photoUrl.trim();

		await incidentRepository.update(id, {
			title: body.title.trim(),
			description,
			photoUrl,
		});

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
	edit,
};
