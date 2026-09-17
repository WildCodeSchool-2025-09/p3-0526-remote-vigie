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

export default {
	read,
	browseNearby,
};
