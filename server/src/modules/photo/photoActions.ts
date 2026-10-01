import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import {
	PHOTO_FILENAME_PATTERN,
	UPLOADS_DIR,
} from "../../services/photoStorage";

const read: RequestHandler = (req, res) => {
	const { filename } = req.params;

	if (!PHOTO_FILENAME_PATTERN.test(filename)) {
		res.sendStatus(StatusCodes.NOT_FOUND);
		return;
	}

	res.sendFile(
		filename,
		{
			root: UPLOADS_DIR,
			dotfiles: "deny",
			headers: {
				"Content-Type": "image/jpeg",
				"X-Content-Type-Options": "nosniff",
				"Cache-Control": "public, max-age=31536000, immutable",
			},
		},
		(err) => {
			if (err != null && !res.headersSent) {
				res.sendStatus(StatusCodes.NOT_FOUND);
			}
		},
	);
};

export default { read };
