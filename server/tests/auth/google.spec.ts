import supertest from "supertest";

import app from "../../src/app";
import oauthAccountRepository from "../../src/modules/oauthAccount/oauthAccountRepository";
import usersRepository from "../../src/modules/users/usersRepository";
import * as googleOAuth from "../../src/services/googleOAuth";
import { signGoogleSignupToken } from "../../src/services/jwt";

// Les tests importent app sans charger .env : on fournit ce que lisent les
// routes Google (secret des jetons, adresse du front pour les redirections).
if (process.env.APP_SECRET == null) {
	process.env.APP_SECRET = "test-secret";
}
const CLIENT_URL = "http://localhost:3000";
process.env.CLIENT_URL = CLIENT_URL;

// Profil que Google est censé renvoyer : on ne contacte jamais Google en test.
const profile = {
	googleId: "google-123",
	email: "marion@example.com",
	emailVerified: true,
	name: "Marion",
};

afterEach(() => {
	jest.restoreAllMocks();
});

describe("GET /api/auth/google", () => {
	it("should redirect to Google with a state cookie", async () => {
		const response = await supertest(app).get("/api/auth/google");

		expect(response.status).toBe(302);
		expect(response.headers.location).toMatch(
			/^https:\/\/accounts\.google\.com\//,
		);
		expect(response.headers.location).toContain(
			"scope=openid%20email%20profile",
		);
		expect(response.headers["set-cookie"][0]).toMatch(
			/^vigie_oauth_state=/,
		);
	});
});

describe("GET /api/auth/google/callback", () => {
	// Simule le retour de Google dans le navigateur qui a lancé la connexion.
	const callback = (query: string) =>
		supertest(app)
			.get(`/api/auth/google/callback?${query}`)
			.set("Cookie", "vigie_oauth_state=abc");

	it("should send back to login when the user cancels", async () => {
		const response = await callback("error=access_denied");

		expect(response.headers.location).toBe(
			`${CLIENT_URL}/login?oauth=cancelled`,
		);
	});

	it("should reject a state that does not match the cookie", async () => {
		const response = await callback("code=x&state=autre");

		expect(response.headers.location).toBe(
			`${CLIENT_URL}/login?oauth=error`,
		);
	});

	it("should log in an account already linked to Google", async () => {
		jest.spyOn(googleOAuth, "getGoogleProfile").mockResolvedValue(profile);
		jest.spyOn(
			oauthAccountRepository,
			"findUserByProvider",
		).mockResolvedValue({ id: 12 } as never);

		const response = await callback("code=x&state=abc");

		expect(response.headers.location).toMatch(
			`${CLIENT_URL}/auth/google/callback#token=`,
		);
	});

	it("should send a newcomer to the Google signup form", async () => {
		jest.spyOn(googleOAuth, "getGoogleProfile").mockResolvedValue(profile);
		jest.spyOn(
			oauthAccountRepository,
			"findUserByProvider",
		).mockResolvedValue(null as never);
		jest.spyOn(usersRepository, "findByEmailNormalized").mockResolvedValue(
			undefined as never,
		);

		const response = await callback("code=x&state=abc");

		expect(response.headers.location).toMatch(
			`${CLIENT_URL}/register/google#pending=`,
		);
	});
});

describe("POST /api/auth/google/signup", () => {
	const address = {
		city: "Lyon",
		postalCode: "69001",
		inseeCode: "69381",
		latitude: 45.767,
		longitude: 4.834,
		streetLine: "1 place Bellecour",
		isApproximate: false,
	};

	it("should reject an incomplete form with 400", async () => {
		const response = await supertest(app)
			.post("/api/auth/google/signup")
			.send({});

		expect(response.status).toBe(400);
	});

	it("should reject a forged signup token with 401", async () => {
		const response = await supertest(app)
			.post("/api/auth/google/signup")
			.send({
				pendingToken: "faux",
				pseudo: "Marion",
				cguAccepted: true,
				address,
			});

		expect(response.status).toBe(401);
	});

	it("should create the account and log the user in", async () => {
		jest.spyOn(usersRepository, "findByEmailNormalized").mockResolvedValue(
			undefined as never,
		);
		jest.spyOn(usersRepository, "findByPseudoNormalized").mockResolvedValue(
			undefined as never,
		);
		const createWithGoogle = jest
			.spyOn(usersRepository, "createWithGoogle")
			.mockResolvedValue(42);

		const response = await supertest(app)
			.post("/api/auth/google/signup")
			.send({
				pendingToken: signGoogleSignupToken(profile),
				pseudo: "Marion",
				cguAccepted: true,
				address,
			});

		expect(response.status).toBe(201);
		expect(response.body.token).toEqual(expect.any(String));
		expect(createWithGoogle).toHaveBeenCalledWith(
			expect.objectContaining({
				googleId: "google-123",
				email: "marion@example.com",
			}),
		);
	});
});
