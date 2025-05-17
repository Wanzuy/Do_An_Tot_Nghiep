import { Router } from "express";
import {
    createPanel,
    getAllPanels,
    getPanelById,
    updatePanel,
} from "../controllers/PanelController";

const router = Router();

router.get("/", getAllPanels);
router.get("/:id", getPanelById);
router.post("/", createPanel);
router.put("/:id", updatePanel);

export default router;
