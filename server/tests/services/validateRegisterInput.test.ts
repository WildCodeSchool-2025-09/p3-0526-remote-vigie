import validateRegisterInput from "../../src/services/validateRegisterInput";

import type { NextFunction, Request, Response } from "express";

const validBody = {
	pseudo: "marion_c",
	email: "test@test.com",
	password: "Password1!",
	cguAccepted: true,
};

// Fabrique de faux req/res/next et appelle le middleware avec un body donné —
function runValidation(body: Record<string, unknown>) {
	const req = { body } as unknown as Request;
	const res = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn(),
	} as unknown as Response;
	const next = jest.fn() as NextFunction;

	validateRegisterInput(req, res, next);

	return { res, next };
}

describe("validateRegisterInput", () => {
	test("tous les champs valides : appelle next sans répondre", () => {
		const { res, next } = runValidation(validBody);

		expect(next).toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
	});

	test.each([
		{ label: "pseudo vide", overrides: { pseudo: "" } },
		{ label: "pseudo avec @", overrides: { pseudo: "marion@c" } },
		{ label: "email vide", overrides: { email: "" } },
		{
			label: "email au mauvais format",
			overrides: { email: "pas-un-email" },
		},
		{ label: "mot de passe vide", overrides: { password: "" } },
		{ label: "mot de passe trop court", overrides: { password: "abc123" } },
		{
			label: "mot de passe sans majuscule/chiffre/caractère spécial",
			overrides: { password: "abcdefgh" },
		},
		{ label: "CGU non acceptées", overrides: { cguAccepted: false } },
	])("$label : répond 400 et n'appelle pas next", ({ overrides }) => {
		const { res, next } = runValidation({ ...validBody, ...overrides });

		expect(res.status).toHaveBeenCalledWith(400);
		expect(next).not.toHaveBeenCalled();
	});
});
