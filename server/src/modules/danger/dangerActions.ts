import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import alertService from "../../services/alertService";
import { distanceInMeters } from "../../services/distance";
import geocodingService from "../../services/geocodingService";
import withPreposition from "../../services/title";
import incidentRepository from "../incident/incidentRepository";
import incidentTypeRepository from "../incidentType/incidentTypeRepository";

const add: RequestHandler = async (req, res, next) => {
	try {
		if (req.auth == null) {
			res.sendStatus(StatusCodes.UNAUTHORIZED);
			return;
		}

		const body = req.body as {
			latitude: unknown;
			longitude: unknown;
		};
		const dangerType = await incidentTypeRepository.readByCode("danger");
		if (!dangerType) {
			res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
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
		const geocode = await geocodingService.reverse(lat, lng);

		const title = (
			geocode.city != null
				? `${dangerType.label} ${withPreposition(geocode.city)}`
				: `${dangerType.label} en dehors de l'agglomération`
		).slice(0, 80);

		const recentByUser = await incidentRepository.readRecentByUser(
			Number(req.auth.sub),
		);
		const isDuplicate = recentByUser.some(
			(recent) =>
				recent.typeIds.includes(dangerType.id) &&
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
			dangerLevelId: dangerType.danger_level_id,
			title,
			description: null,
			photoUrl: null,
			latitude: lat,
			longitude: lng,
			lifespanHours: dangerType.lifespan_hours,
			alertRadiusMeters: dangerType.alert_radius_meters,
			city: geocode.city,
			postalCode: geocode.postalCode,
			inseeCode: geocode.inseeCode,
			typeIds: [dangerType.id],
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
					radiusMeters: dangerType.alert_radius_meters,
					authorUserId: Number(req.auth.sub),
					isDanger: true,
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

export default { add };
