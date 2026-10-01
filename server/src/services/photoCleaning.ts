import sharp from "sharp";

import {
	PHOTO_MAX_PIXELS,
	PHOTO_MAX_SIDE,
	type PhotoMime,
} from "./photoValidation";

// Ré-encode la photo côté serveur pour en retirer toutes les métadonnées (EXIF,
// donc le GPS, mais aussi XMP, IPTC, commentaires). Le navigateur le fait déjà
// avec son canvas, mais rien n'oblige un client à passer par notre formulaire :
// c'est ce qui garantit que les coordonnées du domicile ne sont jamais publiées.
// sharp n'écrit aucune métadonnée en sortie sauf demande explicite.
export async function cleanPhoto(
	buffer: Buffer,
	mime: PhotoMime,
): Promise<Buffer> {
	// rotate() sans argument applique l'orientation EXIF : sans elle, retirer
	// l'EXIF coucherait les photos prises en portrait.
	const pipeline = sharp(buffer, { limitInputPixels: PHOTO_MAX_PIXELS })
		.rotate()
		.resize({
			width: PHOTO_MAX_SIDE,
			height: PHOTO_MAX_SIDE,
			fit: "inside",
			withoutEnlargement: true,
		});

	switch (mime) {
		case "image/jpeg":
			return pipeline.jpeg({ quality: 90 }).toBuffer();
		case "image/webp":
			return pipeline.webp({ quality: 90 }).toBuffer();
		case "image/png":
			return pipeline.png().toBuffer();
	}
}
