import argon2 from "argon2";
import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { CURRENT_CGU_VERSION } from "../../services/cgu";
import { normalizeEmail, normalizePseudo } from "../../services/normalize";
import { resolveAddress } from "../../services/resolveAddress";
import { toUserProfile } from "../../services/toUserProfile";
import { isValidPseudo } from "../../services/validateRegisterInput";
import verificationEmailService from "../../services/verificationEmailService";
import { hashToken } from "../../services/verificationToken";
import type { AddressInput, ResolvedAddress } from "../../types/address";
import addressRepository from "../address/addressRepository";
import usersRepository from "./usersRepository";

const add: RequestHandler = async (req, res, next) => {
	try {
		const body = req.body as {
			pseudo: string;
			email: string;
			password_hash: string;
			emailNormalized: string;
			pseudoNormalized: string;
			reclaimUserIds: number[];
			address: AddressInput;
		};
		let address: ResolvedAddress | null;
		try {
			address = await resolveAddress(body.address);
		} catch {
			res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
				error: "address_service_unavailable",
				message:
					"Le service d'adresse est momentanément indisponible. Veuillez réessayer.",
			});
			return;
		}

		if (address == null) {
			res.status(StatusCodes.BAD_REQUEST).json({
				error: "invalid_address",
				message: "Adresse introuvable.",
			});
			return;
		}
		const userId = await usersRepository.create({
			pseudo: body.pseudo,
			email: body.email,
			pseudoNormalized: body.pseudoNormalized,
			emailNormalized: body.emailNormalized,
			passwordHash: body.password_hash,
			cguVersion: CURRENT_CGU_VERSION,
			cguAcceptedAt: new Date(),
			...address,
			reclaimUserIds: body.reclaimUserIds,
		});

		await verificationEmailService.sendVerificationEmail(
			userId,
			body.pseudo,
			body.email,
		);

		res.status(StatusCodes.CREATED).json({ id: userId });
	} catch (err) {
		if (
			err &&
			typeof err === "object" &&
			"code" in err &&
			err.code === "ER_DUP_ENTRY"
		) {
			res.status(StatusCodes.CONFLICT).json({
				error: "already_used",
				message:
					"Ce pseudo ou cette adresse e-mail vient d'être pris. Veuillez réessayer.",
			});
			return;
		}

		next(err);
	}
};

const verifyEmail: RequestHandler = async (req, res, next) => {
	try {
		const { token } = req.body as { token: unknown };

		if (typeof token !== "string" || token.trim() === "") {
			res.status(StatusCodes.BAD_REQUEST).json({
				error: "invalid_input",
				message: "Jeton de vérification manquant.",
			});
			return;
		}
		const tokenHash = hashToken(token);
		const verified = await usersRepository.verifyEmail(tokenHash);

		if (verified) {
			res.status(StatusCodes.OK).json({
				message: "Votre adresse e-mail a bien été vérifiée.",
			});
			return;
		}
		const existing =
			await usersRepository.findByVerificationTokenHash(tokenHash);

		if (existing) {
			res.status(StatusCodes.GONE).json({
				error: "token_expired",
				message:
					"Ce lien de vérification a expiré. Merci de demander un nouvel e-mail.",
			});
			return;
		}

		res.status(StatusCodes.BAD_REQUEST).json({
			error: "invalid_token",
			message:
				"Ce lien de vérification est invalide ou a déjà été utilisé.",
		});
	} catch (err) {
		next(err);
	}
};

const resendVerification: RequestHandler = async (req, res, next) => {
	try {
		const { email } = req.body as { email: unknown };

		if (typeof email !== "string" || email.trim() === "") {
			res.status(StatusCodes.BAD_REQUEST).json({
				error: "invalid_input",
				message: "Adresse e-mail manquante.",
			});
			return;
		}

		const user = await usersRepository.findByEmailNormalized(
			normalizeEmail(email),
		);

		if (user && user.email_verified_at == null) {
			await verificationEmailService.sendVerificationEmail(
				user.id,
				user.pseudo,
				user.email,
			);
		}

		res.status(StatusCodes.OK).json({
			message:
				"Si un compte existe avec cette adresse et n'est pas encore vérifié, un nouvel e-mail vient d'être envoyé.",
		});
	} catch (err) {
		next(err);
	}
};

const updatePseudo: RequestHandler = async (req, res, next) => {
	try {
		const userId = Number(req.auth?.sub);
		const { pseudo } = req.body as { pseudo: unknown };

		if (!isValidPseudo(pseudo)) {
			res.status(StatusCodes.BAD_REQUEST).json({
				error: "invalid_pseudo",
				message: "Vous devez entrer un pseudo valide.",
			});
			return;
		}

		const trimmed = pseudo.trim();
		const pseudoNormalized = normalizePseudo(trimmed);

		const user = await usersRepository.read(userId);

		if (user == null) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				error: "unauthorized",
				message: "Session invalide.",
			});
			return;
		}

		if (user.pseudo_normalized !== pseudoNormalized) {
			const existing =
				await usersRepository.findByPseudoNormalized(pseudoNormalized);

			if (existing != null) {
				res.status(StatusCodes.CONFLICT).json({
					error: "pseudo_already_used",
					message: "Ce pseudo est déjà pris.",
				});
				return;
			}

			await usersRepository.updatePseudo(
				userId,
				trimmed,
				pseudoNormalized,
			);
		}

		const updated = await usersRepository.read(userId);
		const addresses = await addressRepository.findByUserId(userId);

		res.json(toUserProfile(updated, addresses));
	} catch (err) {
		if (
			err &&
			typeof err === "object" &&
			"code" in err &&
			err.code === "ER_DUP_ENTRY"
		) {
			res.status(StatusCodes.CONFLICT).json({
				error: "pseudo_already_used",
				message: "Ce pseudo est déjà pris.",
			});
			return;
		}

		next(err);
	}
};

const destroy: RequestHandler = async (req, res, next) => {
	try {
		const userId = Number(req.auth?.sub);
		const user = await usersRepository.read(userId);
		if (!user) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				error: "unauthorized",
				message: "Session invalide.",
			});
			return;
		}
		const { password, pseudo } = req.body as {
			password?: unknown;
			pseudo?: unknown;
		};

		// La confirmation exigée dépend du compte, jamais de ce qu'envoie le
		// client : sinon un token volé suffirait à contourner le mot de passe.
		if (user.password_hash != null) {
			if (typeof password !== "string" || password === "") {
				res.status(StatusCodes.BAD_REQUEST).json({
					error: "invalid_confirmation",
					message: "Veuillez saisir votre mot de passe.",
				});
				return;
			}

			const isPasswordValid = await argon2.verify(
				user.password_hash,
				password,
			);

			// 403 et pas 401 : la session est valide, c'est la confirmation qui
			// est refusée (un 401 déconnecterait l'utilisateur côté front).
			if (!isPasswordValid) {
				res.status(StatusCodes.FORBIDDEN).json({
					error: "invalid_confirmation",
					message: "Mot de passe incorrect.",
				});
				return;
			}
		} else {
			if (typeof pseudo !== "string" || pseudo.trim() === "") {
				res.status(StatusCodes.BAD_REQUEST).json({
					error: "invalid_confirmation",
					message: "Veuillez saisir votre pseudo.",
				});
				return;
			}

			// Comparaison exacte : l'utilisateur doit retaper son pseudo tel
			// qu'il est affiché.
			if (pseudo.trim() !== user.pseudo) {
				res.status(StatusCodes.FORBIDDEN).json({
					error: "invalid_confirmation",
					message: "Le pseudo saisi ne correspond pas.",
				});
				return;
			}
		}
	} catch (err) {
		next(err);
	}
};

export default {
	add,
	verifyEmail,
	resendVerification,
	updatePseudo,
	destroy,
};
