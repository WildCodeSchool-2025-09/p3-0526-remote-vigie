import express from "express";
import { StatusCodes } from "http-status-codes";
import requireIncidentAuthor from "./middlewares/requireIncidentAuthor";
import incidentActions from "./modules/incident/incidentActions";
import incidentTypeActions from "./modules/incidentType/incidentTypeActions";
import notificationsActions from "./modules/notifications/notificationsActions";
import requireVerifiedEmail from "./services/requireVerifiedEmail";
import verifyToken from "./services/verifyToken";

const router = express.Router();

// verifyToken pose req.auth ; le handler de création arrive avec l'US07.
router.post("/api/incidents", verifyToken, requireVerifiedEmail, (req, res) => {
	res.status(StatusCodes.NOT_IMPLEMENTED).json({
		message: "Not implemented",
		userId: req.auth?.sub,
	});
});

router.get("/api/incident-types", incidentTypeActions.browse);

router.get("/api/incidents/nearby", incidentActions.browseNearby);
router.get("/api/incidents/:id", incidentActions.read);
router.put(
	"/api/incidents/:id",
	verifyToken,
	requireIncidentAuthor,
	incidentActions.edit,
);

router.get("/api/notifications", verifyToken, notificationsActions.browse);

router.get(
	"/api/notifications/unread-count",
	verifyToken,
	notificationsActions.unreadCount,
);

router.put(
	"/api/notifications/seen",
	verifyToken,
	notificationsActions.markSeen,
);

export default router;
