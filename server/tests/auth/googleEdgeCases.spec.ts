import supertest from "supertest";

import app from "../../src/app";
import oauthAccountRepository from "../../src/modules/oauthAccount/oauthAccountRepository";
import usersRepository from "../../src/modules/users/usersRepository";
import geocodingService from "../../src/services/geocodingService";
import * as googleOAuth from "../../src/services/googleOAuth";
import { signGoogleSignupToken } from "../../src/services/jwt";

// Cas limites de la connexion Google (US22), en complément de google.spec.ts.
// Les tests importent app sans charger .env : on fournit ce que lisent les routes.
if (process.env.APP_SECRET == null) {
	process.env.APP_SECRET = "test-secret";
}
const CLIENT_URL = "http://localhost:3000";
process.env.CLIENT_URL = CLIENT_URL;

const profile = {
	googleId: "google-123",
	email: "marion@example.com",
	emailVerified: true,
	name: "Marion",
};

afterEach(() => {
	jest.restoreAllMocks();
});

describe("GET /api/auth/google/callback (edge cases)", () => {
	const callback = () =>
		supertest(app)
			.get("/api/auth/google/callback?code=x&state=abc")
			.set("Cookie", "vigie_oauth_state=abc");

	it("should refuse a Google e-mail that Google has not verified", async () => {
		jest.spyOn(googleOAuth, "getGoogleProfile").mockResolvedValue({
			...profile,
			emailVerified: false,
		});
		jest.spyOn(
			oauthAccountRepository,
			"findUserByProvider",
		).mockResolvedValue(null as never);

		const response = await callback();

		expect(response.headers.location).toBe(
			`${CLIENT_URL}/login?oauth=email_unverified`,
		);
	});

	it("should link Google to an existing verified account with the same e-mail", async () => {
		jest.spyOn(googleOAuth, "getGoogleProfile").mockResolvedValue(profile);
		jest.spyOn(
			oauthAccountRepository,
			"findUserByProvider",
		).mockResolvedValue(null as never);
		jest.spyOn(usersRepository, "findByEmailNormalized").mockResolvedValue({
			id: 5,
			email_verified_at: new Date(),
		} as never);
		const link = jest
			.spyOn(oauthAccountRepository, "link")
			.mockResolvedValue(undefined);

		const response = await callback();

		expect(link).toHaveBeenCalledWith(5, "google", "google-123");
		expect(response.headers.location).toMatch(
			`${CLIENT_URL}/auth/google/callback#token=`,
		);
	});

	it("should not link an existing account whose e-mail was never verified", async () => {
		jest.spyOn(googleOAuth, "getGoogleProfile").mockResolvedValue(profile);
		jest.spyOn(
			oauthAccountRepository,
			"findUserByProvider",
		).mockResolvedValue(null as never);
		jest.spyOn(usersRepository, "findByEmailNormalized").mockResolvedValue({
			id: 7,
			email_verified_at: null,
		} as never);
		const link = jest.spyOn(oauthAccountRepository, "link");

		const response = await callback();

		expect(link).not.toHaveBeenCalled();
		expect(response.headers.location).toMatch(
			`${CLIENT_URL}/register/google#pending=`,
		);
	});

	it("should send back to login when Google returns no profile", async () => {
		jest.spyOn(googleOAuth, "getGoogleProfile").mockResolvedValue(null);

		const response = await callback();

		expect(response.headers.location).toBe(
			`${CLIENT_URL}/login?oauth=error`,
		);
	});
});

describe("POST /api/auth/google/signup (edge cases)", () => {
	const address = {
		city: "Lyon",
		postalCode: "69001",
		inseeCode: "69381",
		latitude: 45.767,
		longitude: 4.834,
		streetLine: "1 place Bellecour",
		isApproximate: false,
	};

	const register = (body: Record<string, unknown> = {}) =>
		supertest(app)
			.post("/api/auth/google/signup")
			.send({
				pendingToken: signGoogleSignupToken(profile),
				pseudo: "Marion",
				cguAccepted: true,
				address,
				...body,
			});

	// Le limiteur d'inscriptions (5 par heure et par IP) compterait tous les
	// envois de ce fichier : on avance l'horloge de 2 heures avant chaque test.
	let fakeNow = Date.now();
	beforeEach(() => {
		fakeNow += 2 * 60 * 60 * 1000;
		jest.spyOn(Date, "now").mockReturnValue(fakeNow);
	});

	it("should answer 409 when a verified account already uses the e-mail", async () => {
		jest.spyOn(usersRepository, "findByEmailNormalized").mockResolvedValue({
			id: 5,
			email_verified_at: new Date(),
		} as never);

		const response = await register();

		expect(response.status).toBe(409);
		expect(response.body.error).toBe("email_already_used");
	});

	it("should answer 409 when the pseudo is taken", async () => {
		jest.spyOn(usersRepository, "findByEmailNormalized").mockResolvedValue(
			undefined as never,
		);
		jest.spyOn(usersRepository, "findByPseudoNormalized").mockResolvedValue(
			{ id: 9 } as never,
		);

		const response = await register();

		expect(response.status).toBe(409);
		expect(response.body.error).toBe("pseudo_already_used");
	});

	it("should reclaim an account whose e-mail was never verified", async () => {
		jest.spyOn(usersRepository, "findByEmailNormalized").mockResolvedValue({
			id: 7,
			email_verified_at: null,
		} as never);
		jest.spyOn(usersRepository, "findByPseudoNormalized").mockResolvedValue(
			undefined as never,
		);
		const createWithGoogle = jest
			.spyOn(usersRepository, "createWithGoogle")
			.mockResolvedValue(42);

		const response = await register();

		expect(response.status).toBe(201);
		expect(createWithGoogle).toHaveBeenCalledWith(
			expect.objectContaining({ reclaimUserIds: [7] }),
		);
	});

	it("should answer 409 when two registers collide in the database", async () => {
		jest.spyOn(usersRepository, "findByEmailNormalized").mockResolvedValue(
			undefined as never,
		);
		jest.spyOn(usersRepository, "findByPseudoNormalized").mockResolvedValue(
			undefined as never,
		);
		jest.spyOn(usersRepository, "createWithGoogle").mockRejectedValue({
			code: "ER_DUP_ENTRY",
		});

		const response = await register();

		expect(response.status).toBe(409);
		expect(response.body.error).toBe("already_used");
	});

	it("should answer 503 when the address service is down", async () => {
		jest.spyOn(usersRepository, "findByEmailNormalized").mockResolvedValue(
			undefined as never,
		);
		jest.spyOn(usersRepository, "findByPseudoNormalized").mockResolvedValue(
			undefined as never,
		);
		jest.spyOn(geocodingService, "geocodeCentroid").mockRejectedValue(
			new Error("timeout"),
		);

		// Adresse saisie à la main : pas de coordonnées, le serveur doit
		// interroger le service d'adresse.
		const response = await register({
			address: { city: "Lyon", postalCode: "69001" },
		});

		expect(response.status).toBe(503);
	});

	it("should answer 400 when the town cannot be found", async () => {
		jest.spyOn(usersRepository, "findByEmailNormalized").mockResolvedValue(
			undefined as never,
		);
		jest.spyOn(usersRepository, "findByPseudoNormalized").mockResolvedValue(
			undefined as never,
		);
		jest.spyOn(geocodingService, "geocodeCentroid").mockResolvedValue(null);

		const response = await register({
			address: { city: "Nullepart", postalCode: "99999" },
		});

		expect(response.status).toBe(400);
		expect(response.body.error).toBe("invalid_address");
	});
});

describe("POST /api/auth/login (Google-only account)", () => {
	it("should refuse a password login for an account created with Google", async () => {
		jest.spyOn(usersRepository, "findByIdentifier").mockResolvedValue({
			id: 12,
			pseudo: "Marion",
			email: "marion@example.com",
			email_verified_at: new Date(),
			password_hash: null,
		} as never);

		const response = await supertest(app)
			.post("/api/auth/login")
			.send({ identifier: "Marion", password: "nimportequoi" });

		expect(response.status).toBe(401);
		expect(response.body.error).toBe("invalid_credentials");
	});
});
