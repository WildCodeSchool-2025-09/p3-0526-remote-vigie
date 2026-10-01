import sharp from "sharp";

export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_FORMATS = {
	jpeg: "image/jpeg",
	png: "image/png",
	webp: "image/webp",
} as const;

export type PhotoMime = (typeof ALLOWED_FORMATS)[keyof typeof ALLOWED_FORMATS];

export type PhotoValidation =
	| { ok: true; mime: PhotoMime }
	| {
			ok: false;
			error: "photo_too_large" | "photo_invalid_type";
			message: string;
	  };

// Le format est lu dans le contenu du fichier par sharp, jamais dans le nom
// ni le Content-Type envoyés par le client, qui sont falsifiables.
export async function validatePhoto(buffer: Buffer): Promise<PhotoValidation> {
	if (buffer.length > PHOTO_MAX_BYTES) {
		return {
			ok: false,
			error: "photo_too_large",
			message: "La photo dépasse la taille maximale de 5 Mo.",
		};
	}

	const invalidType: PhotoValidation = {
		ok: false,
		error: "photo_invalid_type",
		message: "La photo doit être au format JPEG, PNG ou WebP.",
	};

	try {
		const { format } = await sharp(buffer).metadata();

		if (format != null && format in ALLOWED_FORMATS) {
			return {
				ok: true,
				mime: ALLOWED_FORMATS[format as keyof typeof ALLOWED_FORMATS],
			};
		}

		return invalidType;
	} catch {
		// Fichier illisible ou qui n'est pas une image : sharp lève une erreur.
		return invalidType;
	}
}
