import argon2 from "argon2";
import supertest from "supertest";

import app from "../../src/app";

// On mocke les dépôts : ce fichier teste la couche HTTP
// (route → action → statut/JSON), pas le SQL.
import usersRepository from "../../src/modules/users/usersRepository";
import { authHeader } from "../helpers/authHeader";

afterEach(() => {
	jest.restoreAllMocks();
});

let passwordHash: string;

beforeAll(async () => {
	// Paramètres minimaux : on teste la route, pas la robustesse du hash
	passwordHash = await argon2.hash("correct-password", {
		type: argon2.argon2id,
		memoryCost: 1024,
		timeCost: 1,
		parallelism: 1,
	});
});

const accountWithPassword = () => ({
	id: 1,
	pseudo: "Alice",
	pseudo_normalized: "alice",
	password_hash: passwordHash,
});

const googleAccount = {
	id: 1,
	pseudo: "Alice",
	pseudo_normalized: "alice",
	password_hash: null,
};

describe("DELETE /api/users/me", () => {
	it("should respond 401 without an authentication token", async () => {
		const response = await supertest(app)
			.delete("/api/users/me")
			.send({ password: "correct-password" });

		expect(response.status).toBe(401);
	});

	it("should respond 401 when the account has already been deleted", async () => {
		const headers = authHeader();
		jest.spyOn(usersRepository, "isActive").mockResolvedValue(false);
		const destroy = jest.spyOn(usersRepository, "destroy");

		const response = await supertest(app)
			.delete("/api/users/me")
			.set(headers)
			.send({ password: "correct-password" });

		expect(response.status).toBe(401);
		expect(destroy).not.toHaveBeenCalled();
	});

	it.each([
		{ label: "no password", body: {} },
		{ label: "an empty password", body: { password: "" } },
		{ label: "a non-string password", body: { password: 1234 } },
		// Un compte avec mot de passe ne doit jamais se confirmer par le pseudo
		{ label: "a pseudo only", body: { pseudo: "Alice" } },
	])(
		"should respond 400 for an account with a password and $label",
		async ({ body }) => {
			jest.spyOn(usersRepository, "read").mockResolvedValue(
				accountWithPassword() as never,
			);
			const destroy = jest.spyOn(usersRepository, "destroy");

			const response = await supertest(app)
				.delete("/api/users/me")
				.set(authHeader())
				.send(body);

			expect(response.status).toBe(400);
			expect(response.body.error).toBe("invalid_confirmation");
			expect(destroy).not.toHaveBeenCalled();
		},
	);

	it("should respond 403 with a wrong password and delete nothing", async () => {
		jest.spyOn(usersRepository, "read").mockResolvedValue(
			accountWithPassword() as never,
		);
		const destroy = jest.spyOn(usersRepository, "destroy");

		const response = await supertest(app)
			.delete("/api/users/me")
			.set(authHeader())
			.send({ password: "wrong-password" });

		expect(response.status).toBe(403);
		expect(response.body.error).toBe("invalid_confirmation");
		expect(destroy).not.toHaveBeenCalled();
	});

	it("should respond 204 and delete the account with the right password", async () => {
		jest.spyOn(usersRepository, "read").mockResolvedValue(
			accountWithPassword() as never,
		);
		const destroy = jest
			.spyOn(usersRepository, "destroy")
			.mockResolvedValue(undefined);

		const response = await supertest(app)
			.delete("/api/users/me")
			.set(authHeader(1))
			.send({ password: "correct-password" });

		expect(response.status).toBe(204);
		expect(destroy).toHaveBeenCalledWith(1);
	});

	it.each([
		{ label: "no pseudo", body: {} },
		{ label: "a blank pseudo", body: { pseudo: "   " } },
	])(
		"should respond 400 for an account without a password and $label",
		async ({ body }) => {
			jest.spyOn(usersRepository, "read").mockResolvedValue(
				googleAccount as never,
			);
			const destroy = jest.spyOn(usersRepository, "destroy");

			const response = await supertest(app)
				.delete("/api/users/me")
				.set(authHeader())
				.send(body);

			expect(response.status).toBe(400);
			expect(destroy).not.toHaveBeenCalled();
		},
	);

	it("should respond 403 for an account without a password when the pseudo does not match exactly", async () => {
		jest.spyOn(usersRepository, "read").mockResolvedValue(
			googleAccount as never,
		);
		const destroy = jest.spyOn(usersRepository, "destroy");

		// La casse compte : la comparaison est exacte
		const response = await supertest(app)
			.delete("/api/users/me")
			.set(authHeader())
			.send({ pseudo: "alice" });

		expect(response.status).toBe(403);
		expect(destroy).not.toHaveBeenCalled();
	});

	it("should respond 204 for an account without a password with the exact pseudo", async () => {
		jest.spyOn(usersRepository, "read").mockResolvedValue(
			googleAccount as never,
		);
		const destroy = jest
			.spyOn(usersRepository, "destroy")
			.mockResolvedValue(undefined);

		const response = await supertest(app)
			.delete("/api/users/me")
			.set(authHeader(1))
			.send({ pseudo: " Alice " });

		expect(response.status).toBe(204);
		expect(destroy).toHaveBeenCalledWith(1);
	});

	it("should respond 500 and not report success when the deletion fails", async () => {
		jest.spyOn(usersRepository, "read").mockResolvedValue(
			accountWithPassword() as never,
		);
		jest.spyOn(usersRepository, "destroy").mockRejectedValue(
			new Error("transaction rolled back"),
		);

		const response = await supertest(app)
			.delete("/api/users/me")
			.set(authHeader())
			.send({ password: "correct-password" });

		expect(response.status).toBe(500);
	});
});
