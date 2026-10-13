import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export default function createIpRateLimit({
	max,
	windowMs,
	message,
}: {
	max: number;
	windowMs: number;
	message: string;
}): RequestHandler {
	const attemptsByIp = new Map<
		string,
		{ count: number; windowStart: number }
	>();

	return (req, res, next) => {
		const ip = req.ip ?? "unknown";
		const now = Date.now();
		const attempt = attemptsByIp.get(ip);

		if (attempt == null || now - attempt.windowStart > windowMs) {
			attemptsByIp.set(ip, { count: 1, windowStart: now });
			next();
			return;
		}

		if (attempt.count >= max) {
			res.status(StatusCodes.TOO_MANY_REQUESTS).json({
				error: "too_many_requests",
				message,
			});
			return;
		}

		attempt.count += 1;
		next();
	};
}
