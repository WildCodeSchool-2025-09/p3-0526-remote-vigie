import { signAuthToken } from "../../src/services/jwt";

// Les tests importent app sans passer par main.ts, donc sans charger .env :
// on fournit un secret de test pour pouvoir signer et vérifier les tokens.
if (process.env.APP_SECRET == null) {
	process.env.APP_SECRET = "test-secret";
}

// En-tête d'un utilisateur connecté, à passer à supertest avec .set().
export function authHeader(userId = 1) {
	return { Authorization: `Bearer ${signAuthToken(userId)}` };
}
