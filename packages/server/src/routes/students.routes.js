import { Router } from "express";
import { requireAuth, requireKioskKey } from "../middleware/auth.js";
import * as ctrl from "../controllers/students.controller.js";

const router = Router();

// Kiosk-facing (RFID tap / manual entry lookup)
router.get("/lookup/:studentId", requireKioskKey, ctrl.lookupForKiosk);

// Staff-facing (EMR search, master data)
router.get("/", requireAuth, ctrl.listStudents);
router.get("/:id/emr", requireAuth, ctrl.getFullEmr);
router.post("/bulk-upload", requireAuth, ctrl.bulkUpsertStudents);

export default router;
