import { Router } from "express";
import {
    createVolumeSetting,
    getVolumeSettingByPanel,
    updateVolumeSetting,
    testVolume,
} from "../controllers/VolumeController";

const router = Router();

// Get volume settings by panel ID
router.get("/panel/:panelId", getVolumeSettingByPanel);

// Create new volume setting
router.post("/", createVolumeSetting);

// Update volume setting by ID
router.put("/:id", updateVolumeSetting);

// Test volume by ID
router.post("/:id/test", testVolume);

export default router;
