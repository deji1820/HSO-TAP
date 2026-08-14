import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getSummary } from "../controllers/analytics.controller.js";

const router = Router();

router.get("/summary", requireAuth, getSummary);

export default router;
