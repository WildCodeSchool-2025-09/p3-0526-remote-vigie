import express from "express";
import verifyToken from "./services/verifyToken";

const router = express.Router();

// POST /api/incidents — créer un signalement (réservé aux membres connectés).
// verifyToken pose req.user ; le handler de création arrive avec l'US07.
router.post("/api/incidents", verifyToken, (req, res) => {
	res.status(501).json({ message: "Not implemented", userId: req.user?.id });
});

export default router;
