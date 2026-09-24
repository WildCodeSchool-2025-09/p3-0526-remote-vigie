import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

type Attempts = { count: number; firstAttemptAt: number };
const attemptsByKey = new Map<string, Attempts>();

function isBlocked(key: string): boolean {
	const entry = attemptsByKey.get(key);
	if (entry == null) return false;
	if (Date.now() - entry.firstAttemptAt > WINDOW_MS) {
		attemptsByKey.delete(key);
		return false;
	}
	return entry.count >= MAX_ATTEMPTS;
}

export function registerFailedAttempt(key: string) {
	const entry = attemptsByKey.get(key);
	if (entry == null || Date.now() - entry.firstAttemptAt > WINDOW_MS) {
		attemptsByKey.set(key, { count: 1, firstAttemptAt: Date.now() });
		return;
	}
	entry.count += 1;
}

export function resetAttempts(key: string) {
	attemptsByKey.delete(key);
}

const checkLoginRateLimit: RequestHandler = (req, res, next) => {
	const identifier =
		(req.body?.identifier as string | undefined)?.toLowerCase() ?? "";
	const key = `${req.ip}:${identifier}`;

	if (isBlocked(key)) {
		res.status(StatusCodes.TOO_MANY_REQUESTS).json({
			error: "too_many_attempts",
			message: "Trop de tentatives. Réessaie dans quelques minutes.",
		});
		return;
	}

	next();
};

export default checkLoginRateLimit;
