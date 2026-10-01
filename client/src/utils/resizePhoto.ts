export const PHOTO_MAX_SIDE = 1600;
const PHOTO_QUALITY = 0.8;

export class PhotoResizeError extends Error {
	cause?: unknown;

	constructor(message: string, options?: { cause?: unknown }) {
		super(message);
		this.name = "PhotoResizeError";
		this.cause = options?.cause;
	}
}

// Redimensionne et ré-encode la photo en JPEG dans un canvas, et renvoie une
// data URL prête à être envoyée dans le champ `photo`. Le canvas ne recopie
// que les pixels : l'EXIF, GPS compris, disparaît.
export async function resizePhoto(file: File): Promise<string> {
	let bitmap: ImageBitmap;

	try {
		// "from-image" : le navigateur applique la rotation EXIF au décodage,
		// sinon les photos prises en portrait ressortent couchées.
		bitmap = await createImageBitmap(file, {
			imageOrientation: "from-image",
		});
	} catch (error) {
		throw new PhotoResizeError("La photo n'a pas pu être lue.", {
			cause: error,
		});
	}

	try {
		// Jamais d'agrandissement d'une photo plus petite que la limite.
		const scale = Math.min(
			1,
			PHOTO_MAX_SIDE / Math.max(bitmap.width, bitmap.height),
		);
		const width = Math.max(1, Math.round(bitmap.width * scale));
		const height = Math.max(1, Math.round(bitmap.height * scale));

		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;

		const context = canvas.getContext("2d");
		if (context == null) {
			throw new PhotoResizeError("La photo n'a pas pu être traitée.");
		}

		// Fond blanc : sans lui, la transparence d'un PNG devient noire en JPEG.
		context.fillStyle = "#fff";
		context.fillRect(0, 0, width, height);
		context.drawImage(bitmap, 0, 0, width, height);

		const dataUrl = canvas.toDataURL("image/jpeg", PHOTO_QUALITY);

		// Un canvas trop grand pour le navigateur renvoie "data:," au lieu d'échouer.
		if (!dataUrl.startsWith("data:image/jpeg")) {
			throw new PhotoResizeError("La photo n'a pas pu être traitée.");
		}

		return dataUrl;
	} catch (error) {
		if (error instanceof PhotoResizeError) throw error;
		throw new PhotoResizeError("La photo n'a pas pu être traitée.", {
			cause: error,
		});
	} finally {
		bitmap.close();
	}
}
