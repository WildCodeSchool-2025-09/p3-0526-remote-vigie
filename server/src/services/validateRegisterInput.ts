import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

const validateRegisterInput: RequestHandler = (req, res, next) => {
	const body = req.body as {
		pseudo: unknown;
		email: unknown;
		password: unknown;
		cguAccepted: unknown;
	};

	const errors: Record<string, string> = {};

	if (
		typeof body.pseudo !== "string" ||
		body.pseudo.trim() === "" ||
		body.pseudo.includes("@")
	) {
		errors.pseudo = "Veuillez renseigner un pseudo valide.";
	}

	if (
		typeof body.email !== "string" ||
		body.email.trim() === "" ||
		!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
	) {
		errors.email = "Veuillez renseigner une adresse e-mail valide.";
	}

	if (
		typeof body.password !== "string" ||
		body.password.trim() === "" ||
		body.password.length < 8
	) {
		errors.password = "Veuillez renseigner un mot de passe valide.";
	}

	if (typeof body.cguAccepted !== "boolean" || body.cguAccepted === false) {
		errors.cgu = "Vous devez accepter les CGU.";
	}

	if (Object.keys(errors).length > 0) {
		res.status(StatusCodes.BAD_REQUEST).json({
			error: "invalid_input",
			errors,
		});
		return;
	}

	next();
};

export default validateRegisterInput;
