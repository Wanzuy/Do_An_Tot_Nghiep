import { Router } from "express";
import {
  createNacBoard,
  deleteNacBoard,
  getAllNacBoards,
  getNacBoardById,
  getNacBoardsWithCircuits,
  updateNacBoard,
  updateNacBoardStatus,
} from "../controllers/NacBoardController";

const router = Router();
router.get("/", getAllNacBoards);
router.get("/with-circuits", getNacBoardsWithCircuits);
router.get("/:id", getNacBoardById);
router.post("/", createNacBoard);
router.put("/:id", updateNacBoard);
router.patch("/:id/status", updateNacBoardStatus);
router.delete("/:id", deleteNacBoard);

export default router;
