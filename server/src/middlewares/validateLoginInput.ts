import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

const validateLoginInput: RequestHandler = (req, res, next) => {
	const { identifier, password } = req.body ?? {};

	if (
		typeof identifier !== "string" ||
		identifier.trim() === "" ||
		typeof password !== "string" ||
		password === ""
	) {
		res.status(StatusCodes.BAD_REQUEST).json({
			error: "invalid_input",
			message: "Identifiant et mot de passe requis.",
		});
		return;
	}

	next();
};

export default validateLoginInput;
