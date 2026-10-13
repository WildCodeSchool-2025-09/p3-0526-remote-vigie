import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import type { PhotoMime } from "./photoValidation";

// Hors de server/public : les uploads ne sont jamais servis par express.static,
// uniquement par la route dédiée GET /uploads/:filename.
export const UPLOADS_DIR = path.join(__dirname, "../../uploads");

// L'extension suit le format réellement détecté, jamais le nom du client.
export const EXTENSION_BY_MIME: Record<PhotoMime, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
};

export const MIME_BY_EXTENSION: Record<string, PhotoMime> = {
	jpg: "image/jpeg",
	png: "image/png",
	webp: "image/webp",
};

// Seuls les noms générés par le serveur (uuid + extension connue) sont servis.
export const PHOTO_FILENAME_PATTERN =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

// Supprime un fichier écrit par savePhoto. Ne touche que des chemins
// /uploads/<uuid>.<ext> valides : une URL externe (démo) est ignorée.
export async function deletePhotoFile(photoUrl: string): Promise<void> {
	const filename = path.basename(photoUrl);

	if (
		photoUrl !== `/uploads/${filename}` ||
		!PHOTO_FILENAME_PATTERN.test(filename)
	) {
		return;
	}

	await fs.rm(path.join(UPLOADS_DIR, filename), { force: true });
}

// Écrit la photo sous un nom généré par le serveur et renvoie le chemin
// relatif à enregistrer dans incident.photo_url.
export async function savePhoto(
	buffer: Buffer,
	mime: PhotoMime,
): Promise<string> {
	const filename = `${randomUUID()}.${EXTENSION_BY_MIME[mime]}`;

	await fs.mkdir(UPLOADS_DIR, { recursive: true });
	await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer);

	return `/uploads/${filename}`;
}
