import argon2 from "argon2";
import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import type { RowDataPacket } from "mysql2/promise";
import usersRepository from "../modules/users/usersRepository";
import { normalizeEmail, normalizePseudo } from "./normalize";

async function reclaimIfPossible(
	existing: RowDataPacket,
	password: string,
): Promise<number | null> {
	const { id, email_verified_at, password_hash } = existing as {
		id: number;
		email_verified_at: Date | null;
		password_hash: string;
	};
	const reclaimable =
		email_verified_at == null &&
		(await argon2.verify(password_hash, password));

	return reclaimable ? id : null;
}

const checkUserUniqueness: RequestHandler = async (req, res, next) => {
	try {
		const body = req.body as {
			pseudo: string;
			email: string;
			password: string;
		};
		const emailNormalized = normalizeEmail(body.email);
		const pseudoNormalized = normalizePseudo(body.pseudo);
		const reclaimUserIds: number[] = [];

		const existingByEmail =
			await usersRepository.findByEmailNormalized(emailNormalized);

		if (existingByEmail) {
			const reclaimedId = await reclaimIfPossible(
				existingByEmail,
				body.password,
			);

			if (reclaimedId == null) {
				res.status(StatusCodes.CONFLICT).json({
					error: "email_already_used",
					message:
						"Cette adresse e-mail est déjà utilisée. Si c'est vous et que votre précédente inscription n'a pas abouti, ressaisissez le même mot de passe pour continuer. 🙁",
				});
				return;
			}

			reclaimUserIds.push(reclaimedId);
		}

		const existingByPseudo =
			await usersRepository.findByPseudoNormalized(pseudoNormalized);

		if (existingByPseudo) {
			const reclaimedId = await reclaimIfPossible(
				existingByPseudo,
				body.password,
			);

			if (reclaimedId == null) {
				res.status(StatusCodes.CONFLICT).json({
					error: "pseudo_already_used",
					message:
						"Ce pseudo est déjà pris. Si c'est vous et que votre précédente inscription n'a pas abouti, ressaisissez le même mot de passe pour continuer. 🙁",
				});
				return;
			}

			if (!reclaimUserIds.includes(reclaimedId)) {
				reclaimUserIds.push(reclaimedId);
			}
		}

		req.body.emailNormalized = emailNormalized;
		req.body.pseudoNormalized = pseudoNormalized;
		req.body.reclaimUserIds = reclaimUserIds;

		next();
	} catch (err) {
		next(err);
	}
};

export default checkUserUniqueness;
