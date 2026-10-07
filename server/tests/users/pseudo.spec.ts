import supertest from "supertest";

import app from "../../src/app";

// On mocke les dépôts : ce fichier teste la couche HTTP
// (route → action → statut/JSON), pas le SQL.
import addressRepository from "../../src/modules/address/addressRepository";
import usersRepository from "../../src/modules/users/usersRepository";
import { authHeader } from "../helpers/authHeader";

afterEach(() => {
	jest.restoreAllMocks();
});

const currentUser = {
	id: 1,
	pseudo: "Alice",
	pseudo_normalized: "alice",
	email: "alice@example.com",
	email_verified_at: new Date(),
	password_hash: "secret-hash",
};

describe("PATCH /api/users/me/pseudo", () => {
	it("should respond 401 without an authentication token", async () => {
		const response = await supertest(app)
			.patch("/api/users/me/pseudo")
			.send({ pseudo: "Bob" });

		expect(response.status).toBe(401);
	});

	it.each([
		{ label: "an empty pseudo", body: { pseudo: "" } },
		{ label: "a blank pseudo", body: { pseudo: "   " } },
		{ label: "a pseudo containing @", body: { pseudo: "bob@home" } },
		{
			label: "a pseudo over 30 characters",
			body: { pseudo: "a".repeat(31) },
		},
		{ label: "a missing pseudo", body: {} },
		{ label: "a non-string pseudo", body: { pseudo: 42 } },
	])("should respond 400 with $label", async ({ body }) => {
		const read = jest.spyOn(usersRepository, "read");
		const update = jest.spyOn(usersRepository, "updatePseudo");

		const response = await supertest(app)
			.patch("/api/users/me/pseudo")
			.set(authHeader())
			.send(body);

		expect(response.status).toBe(400);
		expect(response.body.error).toBe("invalid_pseudo");
		expect(read).not.toHaveBeenCalled();
		expect(update).not.toHaveBeenCalled();
	});

	it("should respond 409 when the pseudo is already used by someone else", async () => {
		jest.spyOn(usersRepository, "read").mockResolvedValue(
			currentUser as never,
		);
		jest.spyOn(usersRepository, "findByPseudoNormalized").mockResolvedValue(
			{
				id: 2,
			} as never,
		);
		const update = jest.spyOn(usersRepository, "updatePseudo");

		const response = await supertest(app)
			.patch("/api/users/me/pseudo")
			.set(authHeader())
			.send({ pseudo: "Bob" });

		expect(response.status).toBe(409);
		expect(response.body.error).toBe("pseudo_already_used");
		expect(update).not.toHaveBeenCalled();
	});

	it("should respond 409 when the UNIQUE constraint rejects a concurrent write", async () => {
		jest.spyOn(usersRepository, "read").mockResolvedValue(
			currentUser as never,
		);
		jest.spyOn(usersRepository, "findByPseudoNormalized").mockResolvedValue(
			undefined as never,
		);
		jest.spyOn(usersRepository, "updatePseudo").mockRejectedValue(
			Object.assign(new Error("Duplicate entry"), {
				code: "ER_DUP_ENTRY",
			}),
		);

		const response = await supertest(app)
			.patch("/api/users/me/pseudo")
			.set(authHeader())
			.send({ pseudo: "Bob" });

		expect(response.status).toBe(409);
		expect(response.body.error).toBe("pseudo_already_used");
	});

	it("should save the trimmed pseudo and return the updated profile", async () => {
		jest.spyOn(usersRepository, "read")
			.mockResolvedValueOnce(currentUser as never)
			.mockResolvedValueOnce({
				...currentUser,
				pseudo: "Bob",
				pseudo_normalized: "bob",
			} as never);
		jest.spyOn(usersRepository, "findByPseudoNormalized").mockResolvedValue(
			undefined as never,
		);
		const update = jest
			.spyOn(usersRepository, "updatePseudo")
			.mockResolvedValue(undefined as never);
		jest.spyOn(addressRepository, "findByUserId").mockResolvedValue([]);

		const response = await supertest(app)
			.patch("/api/users/me/pseudo")
			.set(authHeader(1))
			.send({ pseudo: "  Bob  " });

		expect(response.status).toBe(200);
		expect(update).toHaveBeenCalledWith(1, "Bob", "bob");
		expect(response.body).toEqual({
			id: 1,
			pseudo: "Bob",
			email: "alice@example.com",
			emailVerified: true,
			hasPassword: true,
			addresses: [],
		});
		// Aucun champ sensible ne doit sortir
		expect(response.body).not.toHaveProperty("password_hash");
	});

	it("should not write anything when the pseudo is unchanged", async () => {
		jest.spyOn(usersRepository, "read").mockResolvedValue(
			currentUser as never,
		);
		const findByPseudo = jest.spyOn(
			usersRepository,
			"findByPseudoNormalized",
		);
		const update = jest.spyOn(usersRepository, "updatePseudo");
		jest.spyOn(addressRepository, "findByUserId").mockResolvedValue([]);

		const response = await supertest(app)
			.patch("/api/users/me/pseudo")
			.set(authHeader())
			.send({ pseudo: " ALICE " });

		expect(response.status).toBe(200);
		expect(response.body.pseudo).toBe("Alice");
		expect(findByPseudo).not.toHaveBeenCalled();
		expect(update).not.toHaveBeenCalled();
	});
});
