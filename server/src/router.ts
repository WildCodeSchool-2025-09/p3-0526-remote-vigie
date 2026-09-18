import express from "express";
import incidentActions from "./modules/incident/incidentActions";
import requireIncidentAuthor from "./middlewares/requireIncidentAuthor";
import verifyToken from "./services/verifyToken";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

router.get("/api/incidents", incidentActions.browse);
router.get("/api/incidents/:id", incidentActions.read);
router.put(
	"/api/incidents/:id",
	verifyToken,
	requireIncidentAuthor,
	incidentActions.edit,
);

export default router;
