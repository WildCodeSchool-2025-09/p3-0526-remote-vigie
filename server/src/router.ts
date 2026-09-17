import express from "express";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

import incidentActions from "./modules/incident/incidentActions";
import verifyToken from "./services/verifyToken";

router.get("/api/incidents/:id", incidentActions.read);
router.put("/api/incidents/:id", verifyToken, incidentActions.edit);

export default router;
