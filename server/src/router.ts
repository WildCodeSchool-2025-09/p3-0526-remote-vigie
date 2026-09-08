import express from "express";
import incidentActions from "./modules/incident/incidentActions";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

router.get("/api/incidents", incidentActions.browse);

export default router;
