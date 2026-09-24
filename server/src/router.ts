import express from "express";
import checkLoginRateLimit from "./middlewares/checkLoginRateLimit";
import requireIncidentAuthor from "./middlewares/requireIncidentAuthor";
import authActions from "./modules/auth/authActions";
import incidentActions from "./modules/incident/incidentActions";
import notificationsActions from "./modules/notifications/notificationsActions";
import verifyToken from "./services/verifyToken";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */
router.post("/api/auth/login", checkLoginRateLimit, authActions.login);

router.get("/api/auth/me", verifyToken, authActions.me);

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
