import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import geocodingService from "../../services/geocodingService";

import alertService from "../../services/alertService";
import { distanceInMeters } from "../../services/distance";
import isFeminine from "../../services/incidentTypeGender";
import parseBounds from "../../services/parseBounds";
import withPreposition from "../../services/title";
import incidentTypeRepository from "../incidentType/incidentTypeRepository";
import incidentRepository from "./incidentRepository";

// Only BREAD here (Browse, Read, Edit, Add, Delete)

const DEFAULT_LIST_LIMIT = 15;
const MAX_LIST_LIMIT = 100;
// Higher ceiling for the map (US04): a visible zone can legitimately hold
// more markers than the text list ever shows at once.
const MAX_MAP_LIMIT = 300;

const browse: RequestHandler = async (req, res, next) => {
	try {
		const bounds = parseBounds(req.query);
		const requested =
			Number.parseInt(req.query.limit as string, 10) ||
			DEFAULT_LIST_LIMIT;
		const maxLimit = bounds ? MAX_MAP_LIMIT : MAX_LIST_LIMIT;
		const limit = Math.max(1, Math.min(requested, maxLimit));

		const incidents = await incidentRepository.readAllForList(
			limit,
			bounds,
		);
		res.status(StatusCodes.OK).json(incidents);
	} catch (err) {
		next(err);
	}
};

const read: RequestHandler = async (req, res, next) => {
	try {
		const id = Number(req.params.id);

		if (!Number.isInteger(id) || id <= 0) {
			res.sendStatus(StatusCodes.BAD_REQUEST);
			return;
		}

		const userId = req.auth ? Number(req.auth.sub) : null;
		const incident = await incidentRepository.read(id, userId);
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

		const userId = req.auth ? Number(req.auth.sub) : null;
		const incident = await incidentRepository.read(id, userId);
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
		if (req.auth == null) {
			res.sendStatus(StatusCodes.UNAUTHORIZED);
			return;
		}

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
			res.status(StatusCodes.BAD_REQUEST).json({
				error: "invalid_type_ids",
				message:
					"Veuillez sélectionner au moins un type de signalement.",
			});
			return;
		}

		const typeIds = body.typeIds;
		if (!typeIds.every((id) => Number.isInteger(id))) {
			res.status(StatusCodes.BAD_REQUEST).json({
				error: "invalid_type_ids",
				message:
					"Veuillez sélectionner au moins un type de signalement.",
			});
			return;
		}

		const types = await incidentTypeRepository.readAll();
		const filteredTypes = types.filter((type) => typeIds.includes(type.id));
		if (filteredTypes.length === 0) {
			res.status(StatusCodes.BAD_REQUEST).json({
				error: "invalid_type_ids",
				message:
					"Veuillez sélectionner au moins un type de signalement.",
			});
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
			res.status(StatusCodes.BAD_REQUEST).json({
				error: "invalid_position",
				message:
					"La position du signalement est manquante ou invalide.",
			});
			return;
		}

		const dangerLevelId = Number(body.dangerLevelId);
		const validDangerLevelIds = new Set(
			types.map((type) => type.danger_level_id),
		);
		if (
			!Number.isInteger(dangerLevelId) ||
			!validDangerLevelIds.has(dangerLevelId)
		) {
			res.status(StatusCodes.BAD_REQUEST).json({
				error: "invalid_danger_level_id",
				message: "Le niveau de gravité est manquant ou invalide.",
			});
			return;
		}
		if (
			body.title != null &&
			(typeof body.title !== "string" || body.title.length > 80)
		) {
			res.status(StatusCodes.BAD_REQUEST).json({
				error: "invalid_title",
				message:
					"Le titre dépasse la longueur autorisée (80 caractères).",
			});
			return;
		}

		if (
			body.description != null &&
			(typeof body.description !== "string" ||
				body.description.length > 500)
		) {
			res.status(StatusCodes.BAD_REQUEST).json({
				error: "invalid_description",
				message:
					"La description dépasse la longueur autorisée (500 caractères).",
			});
			return;
		}

		if (body.photoUrl != null && typeof body.photoUrl !== "string") {
			res.status(StatusCodes.BAD_REQUEST).json({
				error: "invalid_photo_url",
				message: "La photo envoyée est invalide.",
			});
			return;
		}

		const lifespanHours = Math.max(
			...filteredTypes.map((type) => type.lifespan_hours),
		);
		const alertRadiusMeters = Math.max(
			...filteredTypes.map((type) => type.alert_radius_meters),
		);

		const geocode = await geocodingService.reverse(lat, lng);

		const highestSeverityType = filteredTypes.reduce((highest, type) =>
			type.danger_level_weight > highest.danger_level_weight
				? type
				: highest,
		);

		const trimmedTitle =
			typeof body.title === "string" ? body.title.trim() : "";

		const autoTitle =
			geocode.city != null
				? `${highestSeverityType.label} ${withPreposition(geocode.city)}`
				: `${highestSeverityType.label} signalé${
						isFeminine(highestSeverityType.code) ? "e" : ""
					} en dehors de l'agglomération`;

		const title =
			trimmedTitle.length > 0 ? trimmedTitle : autoTitle.slice(0, 80);

		const description =
			body.description == null || body.description.trim().length === 0
				? null
				: body.description.trim();
		const photoUrl =
			body.photoUrl == null || body.photoUrl.trim().length === 0
				? null
				: body.photoUrl.trim();

		const recentByUser = await incidentRepository.readRecentByUser(
			Number(req.auth.sub),
		);
		const isDuplicate = recentByUser.some(
			(recent) =>
				recent.typeIds.some((id) => typeIds.includes(id)) &&
				distanceInMeters(
					lat,
					lng,
					Number(recent.latitude),
					Number(recent.longitude),
				) <= 50,
		);
		if (isDuplicate) {
			res.status(StatusCodes.CONFLICT).json({
				message: "Un signalement identique vient déjà d'être envoyé.",
			});
			return;
		}

		const incidentId = await incidentRepository.create({
			userId: Number(req.auth.sub),
			dangerLevelId,
			title,
			description,
			photoUrl,
			latitude: lat,
			longitude: lng,
			lifespanHours,
			alertRadiusMeters,
			city: geocode.city,
			postalCode: geocode.postalCode,
			inseeCode: geocode.inseeCode,
			typeIds: filteredTypes.map((type) => type.id),
		});

		const incident = await incidentRepository.read(
			incidentId,
			Number(req.auth.sub),
		);

		res.status(StatusCodes.CREATED).json(incident);

		if (incident) {
			alertService
				.dispatch({
					incidentId,
					types: incident.types.map((type) => type.label),
					city: incident.city,
					postalCode: incident.postalCode,
					latitude: incident.latitude,
					longitude: incident.longitude,
					createdAt: incident.createdAt,
					radiusMeters: alertRadiusMeters,
					authorUserId: Number(req.auth.sub),
				})
				.catch((err) => {
					console.error(
						"Échec de l'envoi des alertes par e-mail",
						err,
					);
				});
		}
	} catch (err) {
		next(err);
	}
};

export default {
	browse,
	read,
	browseNearby,
	edit,
	add,
};
