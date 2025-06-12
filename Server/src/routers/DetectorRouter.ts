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
router.get("/falcboard/:falcBoardId", getDetectorsByFalcBoardId);
router.get("/zone/:zoneId", getDetectorsByZoneId);
router.post("/", createDetector);
router.get("/:id", getDetectorById);
router.put("/:id", updateDetector);
router.patch("/:id/status", updateDetectorStatus);
router.delete("/:id", deleteDetector);

export default router;
