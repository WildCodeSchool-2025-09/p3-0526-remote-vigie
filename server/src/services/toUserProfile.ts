import type { Rows } from "../../database/client";

// Profil renvoyé au client : champs choisis un par un, jamais `...user`
// (la ligne contient password_hash et les jetons de vérification).
export function toUserProfile(user: Rows[number], addresses: Rows) {
	return {
		id: user.id,
		pseudo: user.pseudo,
		email: user.email,
		emailVerified: user.email_verified_at != null,
		addresses,
	};
}
