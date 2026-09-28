import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

const MAX_REGISTRATIONS_PER_WINDOW = 5;
const WINDOW_MS = 60 * 60 * 1000;

const attemptsByIp = new Map<string, { count: number; windowStart: number }>();

const checkRegisterRateLimit: RequestHandler = (req, res, next) => {
	const ip = req.ip ?? "unknown";
	const now = Date.now();
	const attempt = attemptsByIp.get(ip);

	if (attempt == null || now - attempt.windowStart > WINDOW_MS) {
		attemptsByIp.set(ip, { count: 1, windowStart: now });
		next();
		return;
	}

	if (attempt.count >= MAX_REGISTRATIONS_PER_WINDOW) {
		res.status(StatusCodes.TOO_MANY_REQUESTS).json({
			error: "too_many_requests",
			message:
				"Trop de tentatives d'inscription. Veuillez réessayer plus tard.",
		});
		return;
	}

	attempt.count += 1;
	next();
};

export default checkRegisterRateLimit;
