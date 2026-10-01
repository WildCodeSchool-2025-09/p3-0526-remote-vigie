import path from "node:path";

// Hors de server/public : les uploads ne sont jamais servis par express.static,
// uniquement par la route dédiée GET /uploads/:filename.
export const UPLOADS_DIR = path.join(__dirname, "../../uploads");

// Seuls les noms générés par le serveur (uuid + .jpg) sont servis.
export const PHOTO_FILENAME_PATTERN =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/;
