"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const VolumeController_1 = require("../controllers/VolumeController");
const router = (0, express_1.Router)();
// Get volume settings by panel ID
router.get("/panel/:panelId", VolumeController_1.getVolumeSettingByPanel);
// Create new volume setting
router.post("/", VolumeController_1.createVolumeSetting);
// Update volume setting by ID
router.put("/:id", VolumeController_1.updateVolumeSetting);
// Test volume by ID
router.post("/:id/test", VolumeController_1.testVolume);
exports.default = router;
//# sourceMappingURL=VolumeRouter.js.map