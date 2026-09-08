import express from "express";
import { StatusCodes } from "http-status-codes";
import incidentTypeActions from "./modules/incidentType/incidentTypeActions";
import requireVerifiedEmail from "./services/requireVerifiedEmail";
import verifyToken from "./services/verifyToken";

const router = express.Router();

// POST /api/incidents — créer un signalement (réservé aux membres connectés).
// verifyToken pose req.user ; le handler de création arrive avec l'US07.
router.post("/api/incidents", verifyToken, requireVerifiedEmail, (req, res) => {
	res.status(StatusCodes.NOT_IMPLEMENTED).json({
		message: "Not implemented",
		userId: req.user?.id,
	});
});

router.get("/api/incident-types", incidentTypeActions.browse);

export default router;
