import { Router } from "express";
import {
    createFalcBoard,
    deleteFalcBoard,
    getAllFalcBoards,
    getFalcBoardById,
    getFalcBoardsByPanelId,
    updateFalcBoard,
} from "../controllers/FalcBoardController";

const router = Router();

router.get("/", getAllFalcBoards);
router.get("/:id", getFalcBoardById);
router.get("/panel/:panelId", getFalcBoardsByPanelId);
router.post("/", createFalcBoard);
router.put("/:id", updateFalcBoard);
router.delete("/:id", deleteFalcBoard);

export default router;
