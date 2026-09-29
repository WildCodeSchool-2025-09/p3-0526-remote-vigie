import argon2 from "argon2";
import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import usersRepository from "../modules/users/usersRepository";
import { normalizeEmail, normalizePseudo } from "./normalize";

const checkUserUniqueness: RequestHandler = async (req, res, next) => {
	try {
		const body = req.body as {
			pseudo: string;
			email: string;
			password: string;
		};
		const emailNormalized = normalizeEmail(body.email);
		const pseudoNormalized = normalizePseudo(body.pseudo);

		const existingByEmail =
			await usersRepository.findByEmailNormalized(emailNormalized);

		if (existingByEmail) {
			const reclaimable =
				existingByEmail.email_verified_at == null &&
				(await argon2.verify(
					existingByEmail.password_hash,
					body.password,
				));

			if (reclaimable) {
				await usersRepository.remove(existingByEmail.id);
			} else {
				res.status(StatusCodes.CONFLICT).json({
					error: "email_already_used",
					message:
						"Cette adresse e-mail est déjà utilisée. Si c'est vous et que votre précédente inscription n'a pas abouti, ressaisissez le même mot de passe pour continuer. 🙁",
				});
				return;
			}
		}

		const existingByPseudo =
			await usersRepository.findByPseudoNormalized(pseudoNormalized);

		if (existingByPseudo) {
			const reclaimable =
				existingByPseudo.email_verified_at == null &&
				(await argon2.verify(
					existingByPseudo.password_hash,
					body.password,
				));

			if (reclaimable) {
				await usersRepository.remove(existingByPseudo.id);
			} else {
				res.status(StatusCodes.CONFLICT).json({
					error: "pseudo_already_used",
					message:
						"Ce pseudo est déjà pris. Si c'est vous et que votre précédente inscription n'a pas abouti, ressaisissez le même mot de passe pour continuer. 🙁",
				});
				return;
			}
		}

		req.body.emailNormalized = emailNormalized;
		req.body.pseudoNormalized = pseudoNormalized;

		next();
	} catch (err) {
		next(err);
	}
};

export default checkUserUniqueness;
