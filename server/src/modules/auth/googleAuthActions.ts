import crypto from "node:crypto";
import type { RequestHandler, Response } from "express";
import { getGoogleAuthUrl, getGoogleProfile } from "../../services/googleOAuth";
import { signAuthToken } from "../../services/jwt";
import { normalizeEmail } from "../../services/normalize";
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

		// 3. Nouveau venu : écran CGU (étape 9).
		if (user == null) {
			redirectToClient(res, "/login?oauth=signup");
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

export default { redirectToGoogle, handleGoogleCallback };
