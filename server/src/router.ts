import express from "express";
import requireAuthentication from "./middlewares/requireAuthentication";
import incidentActions from "./modules/incident/incidentActions";
import notificationsActions from "./modules/notifications/notificationsActions";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

import requireIncidentAuthor from "./middlewares/requireIncidentAuthor";
import incidentActions from "./modules/incident/incidentActions";
import verifyToken from "./services/verifyToken";

router.get("/api/incidents/:id", incidentActions.read);
router.put(
	"/api/incidents/:id",
	verifyToken,
	requireIncidentAuthor,
	incidentActions.edit,
);

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
