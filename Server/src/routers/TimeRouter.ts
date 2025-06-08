import { Router } from "express";
import {
    createTime,
    deleteTime,
    getAllTimes,
    getTimeById,
    toggleTime,
    updateTime,
} from "../controllers/TimeController";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

router.get("/", verifyToken, getAllTimes);
router.get("/:id", verifyToken, getTimeById);
router.post("/", verifyToken, createTime);
router.put("/:id", verifyToken, updateTime);
router.patch("/:id", verifyToken, toggleTime);
router.delete("/:id", verifyToken, deleteTime);
export default router;
