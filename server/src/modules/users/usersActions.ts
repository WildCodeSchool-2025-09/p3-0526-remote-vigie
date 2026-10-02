import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import geocodingService from "../../services/geocodingService";
import { normalizeEmail } from "../../services/normalize";
import verificationEmailService from "../../services/verificationEmailService";
import { hashToken } from "../../services/verificationToken";
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
			address: {
				city: string;
				postalCode: string;
				inseeCode?: string;
				latitude?: number;
				longitude?: number;
				streetLine?: string;
				isApproximate?: boolean;
			};
		};
		let { latitude, longitude, inseeCode, streetLine } = body.address;
		let isApproximate = body.address.isApproximate ?? true;

		if (latitude == null || longitude == null || inseeCode == null) {
			let centroid: Awaited<
				ReturnType<typeof geocodingService.geocodeCentroid>
			>;

			try {
				centroid = await geocodingService.geocodeCentroid(
					body.address.city,
					body.address.postalCode,
				);
			} catch {
				res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
					error: "address_service_unavailable",
					message:
						"Le service d'adresse est momentanément indisponible. Veuillez réessayer.",
				});
				return;
			}

			if (!centroid) {
				res.status(StatusCodes.BAD_REQUEST).json({
					error: "invalid_address",
					message: "Adresse introuvable.",
				});
				return;
			}
			latitude = centroid.latitude;
			longitude = centroid.longitude;
			inseeCode = centroid.inseeCode;
			isApproximate = true;
		}
		const userId = await usersRepository.create({
			pseudo: body.pseudo,
			email: body.email,
			pseudoNormalized: body.pseudoNormalized,
			emailNormalized: body.emailNormalized,
			passwordHash: body.password_hash,
			cguVersion: "1",
			cguAcceptedAt: new Date(),
			city: body.address.city,
			postalCode: body.address.postalCode,
			inseeCode,
			streetLine: streetLine ?? null,
			latitude,
			longitude,
			isApproximate,
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

export default {
	add,
	verifyEmail,
	resendVerification,
};
