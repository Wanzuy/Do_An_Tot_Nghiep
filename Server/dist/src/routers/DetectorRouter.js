"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DetectorController_1 = require("../controllers/DetectorController");
const router = (0, express_1.Router)();
router.get("/", DetectorController_1.getAllDetectors);
router.get("/:id", DetectorController_1.getDetectorById);
router.get("/falcboards/:falcBoardId/detectors", DetectorController_1.getDetectorsByFalcBoardId);
router.get("/zones/:zoneId/detectors", DetectorController_1.getDetectorsByZoneId);
router.post("/", DetectorController_1.createDetector);
router.put("/:id", DetectorController_1.updateDetector);
router.patch("/:id/status", DetectorController_1.updateDetectorStatus);
router.delete("/:id", DetectorController_1.deleteDetector);
exports.default = router;
//# sourceMappingURL=DetectorRouter.js.map