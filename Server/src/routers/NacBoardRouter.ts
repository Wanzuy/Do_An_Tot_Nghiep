import { Router } from "express";
import {
    createNacBoard,
    deleteNacBoard,
    getAllNacBoards,
    getNacBoardById,
    getNacBoardsByPanelId,
    updateNacBoard,
} from "../controllers/NacBoardController";

const router = Router();
router.get("/", getAllNacBoards);
router.get("/:id", getNacBoardById);
router.get("/panel/:panelId", getNacBoardsByPanelId);
router.post("/", createNacBoard);
router.put("/:id", updateNacBoard);
router.delete("/:id", deleteNacBoard);

export default router;
