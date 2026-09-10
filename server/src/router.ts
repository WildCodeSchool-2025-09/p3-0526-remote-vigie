import express from "express";
import notificationsActions from "./modules/notifications/notificationsActions";
import requireAuthentication from "./middlewares/requireAuthentication";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

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
