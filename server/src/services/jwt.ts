import jwt from "jsonwebtoken";
import type { GoogleProfile, GoogleSignupData } from "../types/oauth";

export function signAuthToken(userId: number): string {
	return jwt.sign(
		{ sub: String(userId), isAdmin: false },
		process.env.APP_SECRET as string,
		{
			expiresIn: "1h",
		},
	);
}

export function verifyAuthToken(
	token: string,
): { sub: string; isAdmin: boolean } | null {
	try {
		return jwt.verify(token, process.env.APP_SECRET as string, {
			algorithms: ["HS256"],
		}) as {
			sub: string;
			isAdmin: boolean;
		};
	} catch {
		return null;
	}
}
// Jeton temporaire d'inscription Google (US22) : il transporte l'identité
// Google jusqu'au formulaire d'inscription. Signé avec un secret dérivé, il ne
// peut pas servir de token de connexion, et inversement.
const googleSignupSecret = () => `${process.env.APP_SECRET}:google-signup`;

export function signGoogleSignupToken(profile: GoogleProfile): string {
	return jwt.sign(
		{
			googleId: profile.googleId,
			email: profile.email,
			name: profile.name,
		},
		googleSignupSecret(),
		{ expiresIn: "15m" },
	);
}

export function verifyGoogleSignupToken(
	token: string,
): GoogleSignupData | null {
	try {
		return jwt.verify(token, googleSignupSecret(), {
			algorithms: ["HS256"],
		}) as GoogleSignupData;
	} catch {
		return null;
	}
}
