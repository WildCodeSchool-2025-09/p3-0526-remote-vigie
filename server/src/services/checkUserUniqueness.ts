import type { RequestHandler } from "express";
import { normalizeEmail, normalizePseudo } from "./normalize";
import usersRepository from "../modules/users/usersRepository";
import { StatusCodes } from "http-status-codes";

const checkUserUniqueness: RequestHandler = async (req, res, next) => {
	try {
		const body = req.body as { pseudo: string; email: string };
		const emailNormalized = normalizeEmail(body.email);
		const pseudoNormalized = normalizePseudo(body.pseudo);
		const existingByEmail =
			await usersRepository.findByEmailNormalized(emailNormalized);
		const existingByPseudo =
			await usersRepository.findByPseudoNormalized(pseudoNormalized);

		if (existingByEmail) {
			res.status(StatusCodes.CONFLICT).json({
				error: "email_already_used",
				message: "Cette adresse e-mail est déjà utilisée. 🙁",
			});
			return;
		}
		if (existingByPseudo) {
			res.status(StatusCodes.CONFLICT).json({
				error: "pseudo_already_used",
				message: "Ce pseudo est déjà pris. 🙁",
			});
			return;
		}

		req.body.emailNormalized = emailNormalized;
		req.body.pseudoNormalized = pseudoNormalized;

		next();
	} catch (err) {
		next(err);
	}
};

export default checkUserUniqueness;
