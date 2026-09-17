import type { Request, RequestHandler } from "express";
import usersRepository from "../users/usersRepository";
import notificationsRepository from "./notificationsRepository";

function getAuthenticatedUserId(req: Request) {
	const userId = req.payload?.sub;
	if (userId == null) throw new Error("Missing authenticated user");
	return userId;
}

const browse: RequestHandler = async (req, res, next) => {
	try {
		const userId = getAuthenticatedUserId(req);

		const page = Number(req.query.page) || 1;
		const limit = Number(req.query.limit) || 20;
		const offset = (page - 1) * limit;

		const user = await usersRepository.read(userId);
		const notifications = await notificationsRepository.browseSinceLastSeen(
			userId,
			user.last_seen_at,
			limit,
			offset,
		);

		res.json(notifications);
	} catch (err) {
		next(err);
	}
};
const markSeen: RequestHandler = async (req, res, next) => {
	try {
		const userId = getAuthenticatedUserId(req);
		await usersRepository.updateLastSeenAt(userId);
		res.sendStatus(204);
	} catch (err) {
		next(err);
	}
};

const unreadCount: RequestHandler = async (req, res, next) => {
	try {
		const userId = getAuthenticatedUserId(req);
		const user = await usersRepository.read(userId);
		const count = await notificationsRepository.countSinceLastSeen(
			userId,
			user.last_seen_at,
		);
		res.json({ count });
	} catch (err) {
		next(err);
	}
};

export default { browse, unreadCount, markSeen };
