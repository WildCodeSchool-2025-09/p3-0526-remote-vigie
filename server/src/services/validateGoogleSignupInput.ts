import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { isValidAddress, isValidPseudo } from "./validateRegisterInput";

// Mêmes règles que l'inscription classique (US05), sans e-mail ni mot de
// passe : l'e-mail vient du jeton Google, et il n'y a pas de mot de passe.
const validateGoogleSignupInput: RequestHandler = (req, res, next) => {
	const body = req.body as {
		pendingToken: unknown;
		pseudo: unknown;
		cguAccepted: unknown;
		address: unknown;
	};

	const errors: Record<string, string> = {};

	if (typeof body.pendingToken !== "string" || body.pendingToken === "") {
		errors.pendingToken = "Inscription Google invalide.";
	}

	if (!isValidPseudo(body.pseudo)) {
		errors.pseudo = "Veuillez renseigner un pseudo valide.";
	}

	if (body.cguAccepted !== true) {
		errors.cgu = "Vous devez accepter les CGU.";
	}

	if (!isValidAddress(body.address)) {
		errors.address = "Veuillez renseigner une adresse valide.";
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

export default validateGoogleSignupInput;
