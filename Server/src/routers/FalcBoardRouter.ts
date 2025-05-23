import { Router } from "express";
import {
    createFalcBoard,
    deleteFalcBoard,
    getAllFalcBoards,
    getFalcBoardById,
    getFalcBoardsByPanelId,
    updateFalcBoard,
    updateFalcBoardStatus,
} from "../controllers/FalcBoardController";

const router = Router();

router.get("/", getAllFalcBoards);
router.get("/:id", getFalcBoardById);
router.get("/panel/:panelId", getFalcBoardsByPanelId);
router.post("/", createFalcBoard);
router.put("/:id", updateFalcBoard);
router.patch("/:id/status", updateFalcBoardStatus);
router.delete("/:id", deleteFalcBoard);

export default router;
