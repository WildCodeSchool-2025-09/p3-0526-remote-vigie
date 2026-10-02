import type { RequestHandler } from "express";
import { verifyAuthToken } from "./jwt";

const attachUserIfPresent: RequestHandler = (req, _res, next) => {
	const header = req.headers.authorization;
	const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

	if (token != null) {
		const payload = verifyAuthToken(token);
		if (payload != null) {
			req.auth = payload;
		}
	}

	next();
};

export default attachUserIfPresent;
