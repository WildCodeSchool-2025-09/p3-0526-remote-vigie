import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import { distanceInMeters } from "../../services/distance";
import incidentTypeRepository from "../incidentType/incidentTypeRepository";
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

const browseNearby: RequestHandler = async (req, res, next) => {
	try {
		const lat = Number(req.query.lat);
		const lng = Number(req.query.lng);
		if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
			res.sendStatus(StatusCodes.BAD_REQUEST);
			return;
		}
		const rawTypes = req.query.types;
		const typesArray = Array.isArray(rawTypes) ? rawTypes : [rawTypes];
		const typeIds = typesArray.map(Number);
		if (typeIds.length === 0 || typeIds.some(Number.isNaN)) {
			res.sendStatus(StatusCodes.BAD_REQUEST);
			return;
		}
		const types = await incidentTypeRepository.readAll();
		const filteredTypes = types.filter((type) => typeIds.includes(type.id));
		if (filteredTypes.length === 0) {
			res.sendStatus(StatusCodes.BAD_REQUEST);
			return;
		}
		const newRadius = Math.max(
			...filteredTypes.map((type) => type.alert_radius_meters),
		);

		const nearbyIncidents =
			await incidentRepository.readNearbyOngoingByTypes(typeIds);

		const touching = nearbyIncidents.filter(
			(incident) =>
				distanceInMeters(
					lat,
					lng,
					Number(incident.latitude),
					Number(incident.longitude),
				) <=
				incident.baseAlertRadiusMeters + newRadius,
		);

		res.json(touching[0] ?? null);
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
			body.title.length > 80
		) {
			res.sendStatus(StatusCodes.BAD_REQUEST);
			return;
		}

		if (
			body.description != null &&
			(typeof body.description !== "string" ||
				body.description.length > 500)
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

const add: RequestHandler = async (req, res, next) => {
	try {
		const body = req.body as {
			typeIds: unknown;
			latitude: unknown;
			longitude: unknown;
			dangerLevelId: unknown;
			title: unknown;
			description: unknown;
			photoUrl: unknown;
		};
		if (!Array.isArray(body.typeIds) || body.typeIds.length === 0) {
			res.sendStatus(StatusCodes.BAD_REQUEST);
			return;
		}

		const typeIds = body.typeIds;
		if (!typeIds.every((id) => Number.isInteger(id))) {
			res.sendStatus(StatusCodes.BAD_REQUEST);
			return;
		}

		const lat = Number(body.latitude);
		const lng = Number(body.longitude);
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

		const dangerLevelId = Number(body.dangerLevelId);
		if (!Number.isInteger(dangerLevelId) || dangerLevelId <= 0) {
			res.sendStatus(StatusCodes.BAD_REQUEST);
			return;
		}
		if (
			body.title != null &&
			(typeof body.title !== "string" || body.title.length > 150)
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
	} catch (err) {
		next(err);
	}
};

export default {
	read,
	browseNearby,
	edit,
	add,
};
