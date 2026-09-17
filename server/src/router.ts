import express from "express";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

import commentActions from "./modules/comment/commentActions";
import incidentActions from "./modules/incident/incidentActions";

router.get("/api/incidents/:id", incidentActions.read);

router.get("/api/incidents/:id/comments", commentActions.browse);
router.post("/api/incidents/:id/comments", commentActions.add);

export default router;
