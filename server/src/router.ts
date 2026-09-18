import express from "express";
<<<<<<< HEAD
import { StatusCodes } from "http-status-codes";
import incidentTypeActions from "./modules/incidentType/incidentTypeActions";
import requireVerifiedEmail from "./services/requireVerifiedEmail";
=======
import requireIncidentAuthor from "./middlewares/requireIncidentAuthor";
import incidentActions from "./modules/incident/incidentActions";
import notificationsActions from "./modules/notifications/notificationsActions";
>>>>>>> origin/dev
import verifyToken from "./services/verifyToken";

const router = express.Router();

// verifyToken pose req.user ; le handler de création arrive avec l'US07.
router.post("/api/incidents", verifyToken, requireVerifiedEmail, (req, res) => {
	res.status(StatusCodes.NOT_IMPLEMENTED).json({
		message: "Not implemented",
		userId: req.user?.id,
	});
});

router.get("/api/incident-types", incidentTypeActions.browse);

<<<<<<< HEAD
import incidentActions from "./modules/incident/incidentActions";

router.get("/api/incidents/nearby", incidentActions.browseNearby);
=======
>>>>>>> origin/dev
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
