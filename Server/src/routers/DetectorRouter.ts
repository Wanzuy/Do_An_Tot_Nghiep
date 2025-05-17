import { Router } from "express";
import {
    createDetector,
    deleteDetector,
    getAllDetectors,
    getDetectorById,
    getDetectorsByFalcBoardId,
    getDetectorsByZoneId,
    updateDetector,
    updateDetectorStatus,
} from "../controllers/DetectorController";

const router = Router();
router.get("/", getAllDetectors);
router.get("/:id", getDetectorById);
router.get("/falcboards/:falcBoardId/detectors", getDetectorsByFalcBoardId);
router.get("/zones/:zoneId/detectors", getDetectorsByZoneId);
router.post("/", createDetector);
router.put("/:id", updateDetector);
router.patch("/detectors/:id/status", updateDetectorStatus);
router.delete("/:id", deleteDetector);

export default router;
