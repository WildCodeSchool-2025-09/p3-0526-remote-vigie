import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import databaseClient from "../../../database/client";
import incidentRepository from "../incident/incidentRepository";
import contributionRepository from "./contributionRepository";
import contributionService from "./contributionService";

// Only BREAD here (Browse, Read, Edit, Add, Delete)

const add: RequestHandler = async (req, res, next) => {
	try {
		const incidentId = Number(req.params.id);

		if (!Number.isInteger(incidentId) || incidentId <= 0) {
			res.sendStatus(StatusCodes.BAD_REQUEST);
			return;
		}

		const body = req.body as { type?: unknown };

		if (body.type !== "confirm" && body.type !== "deny") {
			res.sendStatus(StatusCodes.BAD_REQUEST);
			return;
		}

		const type = body.type;
		const userId = Number(req.auth?.sub);

		const targetIncident =
			await incidentRepository.findOwnerAndStatus(incidentId);

		if (targetIncident == null) {
			res.sendStatus(StatusCodes.NOT_FOUND);
			return;
		}

		if (targetIncident.userId === userId) {
			res.status(StatusCodes.FORBIDDEN).json({
				message:
					"Vous ne pouvez pas contribuer à votre propre signalement.",
			});
			return;
		}

		if (targetIncident.status === "resolved") {
			res.status(StatusCodes.CONFLICT).json({
				message:
					"Cet incident est résolu, il n'accepte plus de contributions.",
			});
			return;
		}

		const connection = await databaseClient.getConnection();

		try {
			await connection.beginTransaction();

			const { baseLifespanHours, createdAt } =
				await incidentRepository.lockBaseLifespan(
					incidentId,
					connection,
				);

			await contributionRepository.create(
				incidentId,
				userId,
				type,
				connection,
			);

			const counts = await contributionRepository.countByIncident(
				incidentId,
				connection,
			);

			const expiresAt = contributionService.recalculateExpiry(
				baseLifespanHours,
				createdAt,
				counts,
			);

			await incidentRepository.updateExpiry(
				incidentId,
				expiresAt,
				connection,
			);

			await connection.commit();

			res.status(StatusCodes.CREATED).json({ counts, expiresAt });
		} catch (err) {
			await connection.rollback();
			throw err;
		} finally {
			connection.release();
		}
	} catch (err) {
		next(err);
	}
};

export default {
	add,
};
