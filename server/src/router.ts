import express from "express";
import decodePhoto from "./middlewares/decodePhoto";
import requireIncidentAuthor from "./middlewares/requireIncidentAuthor";
import validateLoginInput from "./middlewares/validateLoginInput";
import addressActions from "./modules/address/addressActions";
import authActions from "./modules/auth/authActions";
import commentActions from "./modules/comment/commentActions";
import contributionActions from "./modules/contribution/contributionActions";
import incidentActions from "./modules/incident/incidentActions";
import incidentTypeActions from "./modules/incidentType/incidentTypeActions";
import notificationsActions from "./modules/notifications/notificationsActions";
import photoActions from "./modules/photo/photoActions";
import attachUserIfPresent from "./services/attachUserIfPresent";
import checkIncidentRateLimit from "./services/checkIncidentRateLimit";
import requireVerifiedEmail from "./services/requireVerifiedEmail";
import verifyToken from "./services/verifyToken";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */
router.post("/api/auth/login", validateLoginInput, authActions.login);

router.get("/api/auth/me", verifyToken, authActions.me);

router.post(
	"/api/incidents",
	verifyToken,
	requireVerifiedEmail,
	checkIncidentRateLimit,
	decodePhoto,
	incidentActions.add,
);

router.get("/uploads/:filename", photoActions.read);

router.get("/api/incident-types", incidentTypeActions.browse);

router.get("/api/incidents/nearby", incidentActions.browseNearby);
router.get("/api/incidents", incidentActions.browse);
router.get("/api/incidents/:id", attachUserIfPresent, incidentActions.read);
router.put(
	"/api/incidents/:id",
	verifyToken,
	requireIncidentAuthor,
	decodePhoto,
	incidentActions.edit,
);
router.post(
	"/api/incidents/:id/contributions",
	verifyToken,
	contributionActions.add,
);

router.get("/api/incidents/:id/comments", commentActions.browse);
router.post("/api/incidents/:id/comments", verifyToken, commentActions.add);
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
