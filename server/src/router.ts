import express from "express";
import requireIncidentAuthor from "./middlewares/requireIncidentAuthor";
import contributionActions from "./modules/contribution/contributionActions";
import incidentActions from "./modules/incident/incidentActions";
import notificationsActions from "./modules/notifications/notificationsActions";
import attachUserIfPresent from "./services/attachUserIfPresent";
import verifyToken from "./services/verifyToken";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

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
