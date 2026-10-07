import argon2, { type HashOptions } from "argon2";
import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { signAuthToken } from "../../services/jwt";
import addressRepository from "../address/addressRepository";
import badgeService from "../badge/badgeService";
import usersRepository from "../users/usersRepository";

const hashingOptions: HashOptions = {
	type: argon2.argon2id,
	memoryCost: 19 * 2 ** 10 /* 19 Mio en kio (19 * 1024 kio) */,
	timeCost: 2,
	parallelism: 1,
};

const hashPassword: RequestHandler = async (req, res, next) => {
	try {
		const { password } = req.body;
		const hashedPassword = await argon2.hash(password, hashingOptions);

		req.body.password_hash = hashedPassword;
		req.body.password = undefined;

		next();
	} catch (error) {
		next(error);
	}
};

const login: RequestHandler = async (req, res, next) => {
	try {
		const { identifier, password } = req.body as {
			identifier: string;
			password: string;
		};

		const user = await usersRepository.findByIdentifier(identifier);
		const invalidCredentials = () => {
			res.status(StatusCodes.UNAUTHORIZED).json({
				error: "invalid_credentials",
				message: "Identifiant ou mot de passe incorrect.",
			});
		};

		if (user == null || user.password_hash == null) {
			invalidCredentials();
			return;
		}

		const passwordMatches = await argon2.verify(
			user.password_hash,
			password,
		);
		if (!passwordMatches) {
			invalidCredentials();
			return;
		}

		const token = signAuthToken(user.id);

		res.json({
			token,
			user: {
				id: user.id,
				pseudo: user.pseudo,
				email: user.email,
				emailVerified: user.email_verified_at != null,
			},
		});

		// Badge recalculation, outside the response
		badgeService.evaluate(user.id).catch((err) => {
			console.error(
				`Échec du recalcul des badges de l'utilisateur ${user.id}`,
				err,
			);
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
			res.status(StatusCodes.UNAUTHORIZED).json({
				error: "unauthorized",
				message: "Session invalide.",
			});
			return;
		}

		const addresses = await addressRepository.findByUserId(userId);

		res.json({
			id: user.id,
			pseudo: user.pseudo,
			email: user.email,
			emailVerified: user.email_verified_at != null,
			addresses,
		});
	} catch (err) {
		next(err);
	}
};

export default { hashPassword, login, me };
