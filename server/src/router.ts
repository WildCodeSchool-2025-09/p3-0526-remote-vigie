import express from "express";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

import commentActions from "./modules/comment/commentActions";
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

router.get("/api/incidents/:id/comments", commentActions.browse);
router.post("/api/incidents/:id/comments", verifyToken, commentActions.add);

export default router;
