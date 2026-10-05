import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import badgeService from "../badge/badgeService";
import incidentRepository from "../incident/incidentRepository";
import commentRepository from "./commentRepository";

import type { RecentBadge } from "../badge/userBadgeRepository";

// Only BREAD here (Browse, Read, Edit, Add, Delete)

// Ajoute à l'auteur ses badges les plus récents (liste vide s'il n'en a pas, ou
// pour un visiteur : les auteurs ne lui sont pas identifiés).
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

		// L'auteur est l'utilisateur connecté : sans ses badges, un commentaire
		// tout juste publié s'afficherait sans eux jusqu'au rechargement.
		const badgesByAuthor =
			comment != null
				? await badgeService.readRecentBadgesByUsers([
						comment.author.id,
					])
				: new Map<number, RecentBadge[]>();

		res.status(StatusCodes.CREATED).json(
			comment && withAuthorBadges(comment, badgesByAuthor),
		);
	} catch (err) {
		next(err);
	}
};

export default {
	browse,
	add,
};
