import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import multer from "multer";

import { PHOTO_MAX_BYTES, validatePhoto } from "../services/photoValidation";

// Mémoire, pas de disque : l'écriture n'a lieu qu'une fois le fichier validé.
const receivePhoto = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: PHOTO_MAX_BYTES, files: 1 },
}).single("photo");

const uploadPhoto: RequestHandler = (req, res, next) => {
	receivePhoto(req, res, async (err) => {
		try {
			if (err instanceof multer.MulterError) {
				const tooLarge = err.code === "LIMIT_FILE_SIZE";

				res.status(StatusCodes.BAD_REQUEST).json(
					tooLarge
						? {
								error: "photo_too_large",
								message:
									"La photo dépasse la taille maximale de 5 Mo.",
							}
						: {
								error: "invalid_photo",
								message: "La photo envoyée est invalide.",
							},
				);
				return;
			}

			if (err) {
				next(err);
				return;
			}

			// La photo est optionnelle.
			if (req.file == null) {
				next();
				return;
			}

			const result = await validatePhoto(req.file.buffer);

			if (!result.ok) {
				res.status(StatusCodes.BAD_REQUEST).json({
					error: result.error,
					message: result.message,
				});
				return;
			}

			next();
		} catch (error) {
			next(error);
		}
	});
};

export default uploadPhoto;
