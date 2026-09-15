import express from "express";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

import incidentActions from "./modules/incident/incidentActions";

router.get("/api/incidents/:id", incidentActions.read);

export default router;
