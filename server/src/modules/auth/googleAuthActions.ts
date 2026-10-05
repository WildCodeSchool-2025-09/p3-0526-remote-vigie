import crypto from "node:crypto";
import type { RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { getGoogleAuthUrl, getGoogleProfile } from "../../services/googleOAuth";
import {
	signAuthToken,
	signGoogleSignupToken,
	verifyGoogleSignupToken,
} from "../../services/jwt";
import { normalizeEmail, normalizePseudo } from "../../services/normalize";
import { resolveAddress } from "../../services/resolveAddress";
import type { AddressInput, ResolvedAddress } from "../../types/address";
import oauthAccountRepository from "../oauthAccount/oauthAccountRepository";
import usersRepository from "../users/usersRepository";

// Cookie temporaire qui garde le `state` dans le navigateur, pour vérifier au
// retour de Google que c'est bien lui qui a lancé la connexion (anti-CSRF).
export const OAUTH_STATE_COOKIE = "vigie_oauth_state";

const redirectToGoogle: RequestHandler = (_req, res) => {
	const state = crypto.randomBytes(16).toString("hex");

	res.cookie(OAUTH_STATE_COOKIE, state, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		maxAge: 10 * 60 * 1000,
		path: "/api/auth/google",
	});

	res.redirect(getGoogleAuthUrl(state));
};
const GOOGLE = "google";

// Renvoie le navigateur vers une page du front.
function redirectToClient(res: Response, path: string) {
	res.redirect(`${process.env.CLIENT_URL}${path}`);
}

const handleGoogleCallback: RequestHandler = async (req, res) => {
	try {
		const { code, state, error } = req.query;
		const expectedState = req.cookies?.[OAUTH_STATE_COOKIE];
		res.clearCookie(OAUTH_STATE_COOKIE, { path: "/api/auth/google" });

		// L'utilisateur a cliqué sur « Annuler » chez Google.
		if (error === "access_denied") {
			redirectToClient(res, "/login?oauth=cancelled");
			return;
		}

		// state absent ou différent du cookie : connexion pas lancée par ce navigateur.
		if (
			typeof code !== "string" ||
			typeof state !== "string" ||
			state !== expectedState
		) {
			redirectToClient(res, "/login?oauth=error");
			return;
		}

		const profile = await getGoogleProfile(code);

		if (profile == null) {
			redirectToClient(res, "/login?oauth=error");
			return;
		}

		// 1. Compte Google déjà lié à un compte Vigie.
		let user = await oauthAccountRepository.findUserByProvider(
			GOOGLE,
			profile.googleId,
		);

		// 2. Compte Vigie existant avec le même e-mail : on relie Google, à
		// condition que l'e-mail soit vérifié des deux côtés.
		if (user == null && profile.emailVerified) {
			const existing = await usersRepository.findByEmailNormalized(
				normalizeEmail(profile.email),
			);
			if (existing != null && existing.email_verified_at != null) {
				await oauthAccountRepository.link(
					existing.id,
					GOOGLE,
					profile.googleId,
				);
				user = existing;
			}
		}

		// 3. Nouveau venu : il complète son inscription (pseudo, adresse, CGU).
		// On n'accepte qu'un e-mail confirmé par Google.
		if (user == null) {
			if (!profile.emailVerified) {
				redirectToClient(res, "/login?oauth=email_unverified");
				return;
			}
			const params = new URLSearchParams({
				pending: signGoogleSignupToken(profile),
				email: profile.email,
				name: profile.name ?? "",
			});
			redirectToClient(res, `/register/google#${params}`);
			return;
		}

		const token = signAuthToken(user.id);
		redirectToClient(res, `/auth/google/callback#token=${token}`);
	} catch (err) {
		// Google injoignable, code expiré… : on revient sur le front avec un
		// message, plutôt qu'une page d'erreur JSON.
		console.error(err);
		redirectToClient(res, "/login?oauth=error");
	}
};

const completeGoogleSignup: RequestHandler = async (req, res, next) => {
	try {
		const body = req.body as {
			pendingToken: string;
			pseudo: string;
			address: AddressInput;
		};

		// Le jeton signé prouve que Google a vérifié cette personne.
		const signup = verifyGoogleSignupToken(body.pendingToken);
		if (signup == null) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				error: "signup_expired",
				message:
					"Votre inscription avec Google a expiré. Recommencez avec « Continuer avec Google ».",
			});
			return;
		}

		const pseudo = body.pseudo.trim();
		const emailNormalized = normalizeEmail(signup.email);
		const pseudoNormalized = normalizePseudo(pseudo);
		const reclaimUserIds: number[] = [];

		// Un compte vérifié avec cet e-mail existe déjà : refus. Un compte jamais
		// vérifié est récupérable, puisque Google prouve la possession de l'e-mail.
		const existingByEmail =
			await usersRepository.findByEmailNormalized(emailNormalized);
		if (existingByEmail != null) {
			if (existingByEmail.email_verified_at != null) {
				res.status(StatusCodes.CONFLICT).json({
					error: "email_already_used",
					message:
						"Un compte existe déjà avec cet e-mail. Connectez-vous depuis la page de connexion.",
				});
				return;
			}
			reclaimUserIds.push(existingByEmail.id);
		}

		const existingByPseudo =
			await usersRepository.findByPseudoNormalized(pseudoNormalized);
		if (
			existingByPseudo != null &&
			!reclaimUserIds.includes(existingByPseudo.id)
		) {
			res.status(StatusCodes.CONFLICT).json({
				error: "pseudo_already_used",
				message: "Ce pseudo est déjà pris.",
			});
			return;
		}

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

		const userId = await usersRepository.createWithGoogle({
			googleId: signup.googleId,
			pseudo,
			email: signup.email,
			pseudoNormalized,
			emailNormalized,
			cguVersion: "1",
			cguAcceptedAt: new Date(),
			address,
			reclaimUserIds,
		});
		res.status(StatusCodes.CREATED).json({ token: signAuthToken(userId) });
	} catch (err) {
		next(err);
	}
};

export default { redirectToGoogle, handleGoogleCallback, completeGoogleSignup };
