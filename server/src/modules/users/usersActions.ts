import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import geocodingService from "../../services/geocodingService";
import mailService from "../../services/mailService";
import { normalizeEmail } from "../../services/normalize";
import {
	generateVerificationToken,
	hashToken,
} from "../../services/verificationToken";
import usersRepository from "./usersRepository";

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function verificationEmailTemplate({
	pseudo,
	link,
}: {
	pseudo: string;
	link: string;
}) {
	const subject = "Confirmez votre adresse e-mail pour votre compte Vigie";

	const html = `
<div style="font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; max-width: 480px; margin: 0 auto; background: #f6f5e9;">
	<div style="background-color:#0b4619; padding: 24px; text-align: center;">
		<img src="${process.env.CLIENT_URL}/vigie-favicon-accent.svg" width="40" height="25" alt="Vigie" style="display:block; margin: 0 auto 8px;">
		<h1 style="font-family: 'Playfair Display', ui-serif, Georgia, serif; color: #ffcc1d; margin: 0; font-size: 20px;">Bienvenue sur Vigie</h1>
	</div>
	<div style="padding: 24px; color: #0b4619;">
		<p>Bonjour ${escapeHtml(pseudo)},</p>
		<p>Merci de confirmer votre adresse e-mail pour activer votre compte Vigie.</p>
		<p style="text-align: center; margin-top: 24px;">
			<a href="${link}" style="background: #ffcc1d; color: #0b4619; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: bold; display: inline-block;">
				Confirmer mon e-mail
			</a>
		</p>
		<p style="font-size: 13px; color: #0b4619aa;">Ce lien expire dans 24 heures.</p>
	</div>
</div>
`;

	return { subject, html };
}

async function sendVerificationEmail(
	userId: number,
	pseudo: string,
	email: string,
): Promise<void> {
	const verificationToken = generateVerificationToken();
	const verificationTokenHash = hashToken(verificationToken);
	const verificationExpiresAt = new Date(
		Date.now() + VERIFICATION_TOKEN_TTL_MS,
	);

	await usersRepository.setVerificationToken(
		userId,
		verificationTokenHash,
		verificationExpiresAt,
	);

	const link = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
	const { subject, html } = verificationEmailTemplate({ pseudo, link });

	try {
		const previewUrl = await mailService.send({ to: email, subject, html });
		console.log(
			`E-mail de vérification envoyé à ${email}${previewUrl ? ` — aperçu : ${previewUrl}` : ""}`,
		);
	} catch (err) {
		console.error(
			`Échec d'envoi de l'e-mail de vérification à ${email}`,
			err,
		);
	}
}

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

		await sendVerificationEmail(userId, body.pseudo, body.email);

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
			await sendVerificationEmail(user.id, user.pseudo, user.email);
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
