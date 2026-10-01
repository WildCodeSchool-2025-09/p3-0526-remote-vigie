import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import { cleanPhoto } from "../services/photoCleaning";
import {
	PHOTO_MAX_BYTES,
	type PhotoMime,
	validatePhoto,
} from "../services/photoValidation";

export type DecodedPhoto = { buffer: Buffer; mime: PhotoMime };

// 5 Mo en base64 : 4 caractères pour 3 octets, plus la marge du préfixe data:.
const MAX_BASE64_LENGTH = Math.ceil(PHOTO_MAX_BYTES / 3) * 4 + 100;
const DATA_URL_PREFIX = /^data:[^;,]*;base64,/;

// La photo arrive en base64 dans le JSON (champ `photo`, data URL du canvas).
// Une fois validée, elle est rangée dans res.locals.photo ; elle n'est écrite
// sur le disque que plus tard, après la validation des autres champs.
const decodePhoto: RequestHandler = async (req, res, next) => {
	try {
		const photo: unknown = req.body?.photo;

		// La photo est optionnelle.
		if (photo == null || photo === "") {
			next();
			return;
		}

		if (typeof photo !== "string") {
			res.status(StatusCodes.BAD_REQUEST).json({
				error: "invalid_photo",
				message: "La photo envoyée est invalide.",
			});
			return;
		}

		// Refus avant décodage : inutile de décoder un fichier déjà trop gros.
		if (photo.length > MAX_BASE64_LENGTH) {
			res.status(StatusCodes.BAD_REQUEST).json({
				error: "photo_too_large",
				message: "La photo dépasse la taille maximale de 5 Mo.",
			});
			return;
		}

		const buffer = Buffer.from(
			photo.replace(DATA_URL_PREFIX, ""),
			"base64",
		);
		const result = await validatePhoto(buffer);

		if (!result.ok) {
			res.status(StatusCodes.BAD_REQUEST).json({
				error: result.error,
				message: result.message,
			});
			return;
		}

		// En-tête valide mais contenu corrompu : le décodage échoue ici.
		let cleaned: Buffer;
		try {
			cleaned = await cleanPhoto(buffer, result.mime);
		} catch {
			res.status(StatusCodes.BAD_REQUEST).json({
				error: "photo_unreadable",
				message: "La photo est illisible ou corrompue.",
			});
			return;
		}

		res.locals.photo = {
			buffer: cleaned,
			mime: result.mime,
		} satisfies DecodedPhoto;

		next();
	} catch (err) {
		next(err);
	}
};

export default decodePhoto;
