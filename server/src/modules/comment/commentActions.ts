import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import commentPushService from "../../services/commentPushService";
import badgeService from "../badge/badgeService";
import incidentRepository from "../incident/incidentRepository";
import commentRepository from "./commentRepository";

import type { RecentBadge } from "../badge/userBadgeRepository";

// Only BREAD here (Browse, Read, Edit, Add, Delete)

// Adds the author's badges
function withAuthorBadges<T extends { author: { id: number } }>(
	comment: T,
	badgesByAuthor: Map<number, RecentBadge[]>,
) {
	return {
		...comment,
		author: {
			...comment.author,
			badges: badgesByAuthor.get(comment.author.id) ?? [],
		},
	};
}

const browse: RequestHandler = async (req, res, next) => {
	try {
		const incidentId = Number(req.params.id);

		if (!Number.isInteger(incidentId) || incidentId <= 0) {
			res.sendStatus(StatusCodes.BAD_REQUEST);
			return;
		}

		const comments = await commentRepository.readByIncident(incidentId);

		const badgesByAuthor =
			req.auth != null
				? await badgeService.readRecentBadgesByUsers(
						comments.map((comment) => comment.author.id),
					)
				: new Map<number, RecentBadge[]>();

		res.json(
			comments.map((comment) =>
				withAuthorBadges(comment, badgesByAuthor),
			),
		);
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

		const body = req.body as {
			content?: unknown;
			quotedCommentId?: unknown;
		};

		if (
			typeof body.content !== "string" ||
			body.content.trim().length === 0 ||
			body.content.length > 500
		) {
			res.sendStatus(StatusCodes.BAD_REQUEST);
			return;
		}

		let quotedCommentId: number | null = null;
		let quotedAuthorId: number | null = null;

		if (body.quotedCommentId != null) {
			quotedCommentId = Number(body.quotedCommentId);

			if (!Number.isInteger(quotedCommentId) || quotedCommentId <= 0) {
				res.sendStatus(StatusCodes.BAD_REQUEST);
				return;
			}

			const quotedIncidentId =
				await commentRepository.findIncidentId(quotedCommentId);

			if (quotedIncidentId == null || quotedIncidentId !== incidentId) {
				res.sendStatus(StatusCodes.BAD_REQUEST);
				return;
			}

			quotedAuthorId =
				await commentRepository.findAuthorId(quotedCommentId);
		}

		const incident =
			await incidentRepository.findOwnerAndStatus(incidentId);

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
			quotedCommentId,
		});

		const comment = await commentRepository.read(id);

		const badgesByAuthor =
			comment != null
				? await badgeService.readRecentBadgesByUsers([
						comment.author.id,
					])
				: new Map<number, RecentBadge[]>();

		res.status(StatusCodes.CREATED).json(
			comment && withAuthorBadges(comment, badgesByAuthor),
		);

		commentPushService
			.notify({
				incidentId,
				city: incident.city,
				ownerId: incident.userId,
				authorId: Number(req.auth.sub),
				quotedAuthorId,
			})
			.catch((err) => {
				console.error("Échec de l'envoi des push de commentaire", err);
			});
	} catch (err) {
		next(err);
	}
};

export default {
	browse,
	add,
};
