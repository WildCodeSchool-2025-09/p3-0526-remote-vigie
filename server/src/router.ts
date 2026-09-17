import express from "express";
import requireAuthentication from "./middlewares/requireAuthentication";
import incidentActions from "./modules/incident/incidentActions";
import notificationsActions from "./modules/notifications/notificationsActions";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

router.get("/api/incidents/:id", incidentActions.read);

router.get(
	"/api/notifications",
	requireAuthentication,
	notificationsActions.browse,
);

router.get(
	"/api/notifications/unread-count",
	requireAuthentication,
	notificationsActions.unreadCount,
);

router.put(
	"/api/notifications/seen",
	requireAuthentication,
	notificationsActions.markSeen,
);

export default router;
