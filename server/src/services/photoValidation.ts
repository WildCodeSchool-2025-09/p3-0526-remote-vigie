import sharp from "sharp";

export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;

// Plus grand côté conservé, comme côté navigateur.
export const PHOTO_MAX_SIDE = 1600;

// Garde-fou : ré-encoder oblige à décoder l'image, et quelques Mo de PNG peuvent
// annoncer des dizaines de milliers de pixels de côté (bombe de décompression).
// Refusé d'après l'en-tête, avant tout décodage.
export const PHOTO_MAX_PIXELS = 50_000_000;

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
		const {
			format,
			width = 0,
			height = 0,
		} = await sharp(buffer).metadata();

		if (format != null && format in ALLOWED_FORMATS) {
			if (width * height > PHOTO_MAX_PIXELS) {
				return {
					ok: false,
					error: "photo_too_large",
					message: "Les dimensions de la photo sont trop grandes.",
				};
			}

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
