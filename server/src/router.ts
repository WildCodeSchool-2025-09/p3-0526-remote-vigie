import express from "express";
import requireIncidentAuthor from "./middlewares/requireIncidentAuthor";
import addressActions from "./modules/address/addressActions";
import commentActions from "./modules/comment/commentActions";
import contributionActions from "./modules/contribution/contributionActions";
import incidentActions from "./modules/incident/incidentActions";
import incidentTypeActions from "./modules/incidentType/incidentTypeActions";
import notificationsActions from "./modules/notifications/notificationsActions";
import usefulPlaceActions from "./modules/usefulPlace/usefulPlaceActions";
import attachUserIfPresent from "./services/attachUserIfPresent";
import checkIncidentRateLimit from "./services/checkIncidentRateLimit";
import requireVerifiedEmail from "./services/requireVerifiedEmail";
import verifyToken from "./services/verifyToken";

const router = express.Router();

router.post(
	"/api/incidents",
	verifyToken,
	requireVerifiedEmail,
	checkIncidentRateLimit,
	incidentActions.add,
);

router.get("/api/incident-types", incidentTypeActions.browse);

router.get("/api/incidents/nearby", incidentActions.browseNearby);
router.get("/api/incidents", incidentActions.browse);
router.get("/api/incidents/:id", attachUserIfPresent, incidentActions.read);
router.put(
	"/api/incidents/:id",
	verifyToken,
	requireIncidentAuthor,
	incidentActions.edit,
);
router.post(
	"/api/incidents/:id/contributions",
	verifyToken,
	contributionActions.add,
);

router.get("/api/incidents/:id/comments", commentActions.browse);
router.post("/api/incidents/:id/comments", verifyToken, commentActions.add);

router.get("/api/useful-places", usefulPlaceActions.browse);

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

router.get("/api/addresses/reverse", verifyToken, addressActions.reverse);

export default router;
