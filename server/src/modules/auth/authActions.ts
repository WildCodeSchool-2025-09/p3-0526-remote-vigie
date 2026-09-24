import argon2 from "argon2";
import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import {
	registerFailedAttempt,
	resetAttempts,
} from "../../middlewares/checkLoginRateLimit";
import { signAuthToken } from "../../services/jwt";
import usersRepository from "../users/usersRepository";

const login: RequestHandler = async (req, res, next) => {
	try {
		const { identifier, password } = req.body as {
			identifier?: string;
			password?: string;
		};

		if (!identifier || !password) {
			res.status(StatusCodes.BAD_REQUEST).json({
				error: "invalid_input",
				message: "Identifiant et mot de passe requis.",
			});
			return;
		}

		const key = `${req.ip}:${identifier.toLowerCase()}`;

		const user = await usersRepository.findByIdentifier(identifier);
		const invalidCredentials = () => {
			res.status(StatusCodes.UNAUTHORIZED).json({
				error: "invalid_credentials",
				message: "Identifiant ou mot de passe incorrect.",
			});
		};

		if (user == null) {
			registerFailedAttempt(key);
			invalidCredentials();
			return;
		}

		const passwordMatches = await argon2.verify(
			user.password_hash,
			password,
		);
		if (!passwordMatches) {
			registerFailedAttempt(key);
			invalidCredentials();
			return;
		}

		const token = signAuthToken(user.id);
		resetAttempts(key);

		res.json({
			token,
			user: {
				id: user.id,
				pseudo: user.pseudo,
				email: user.email,
				emailVerified: user.email_verified_at != null,
			},
		});
	} catch (err) {
		next(err);
	}
};
const me: RequestHandler = async (req, res, next) => {
	try {
		const userId = Number(req.auth?.sub);
		const user = await usersRepository.read(userId);

		if (user == null) {
			res.sendStatus(StatusCodes.UNAUTHORIZED);
			return;
		}

		res.json({
			id: user.id,
			pseudo: user.pseudo,
			email: user.email,
			emailVerified: user.email_verified_at != null,
		});
	} catch (err) {
		next(err);
	}
};

export default { login, me };
