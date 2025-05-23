import { Router } from "express";
import {
    createNacBoard,
    deleteNacBoard,
    getAllNacBoards,
    getNacBoardById,
    getNacBoardsWithCircuits,
    updateNacBoard,
} from "../controllers/NacBoardController";

const router = Router();
router.get("/", getAllNacBoards);
router.get("/with-circuits", getNacBoardsWithCircuits);
router.get("/:id", getNacBoardById);
router.post("/", createNacBoard);
router.put("/:id", updateNacBoard);
router.delete("/:id", deleteNacBoard);

export default router;
