import { Router } from "express";
import {
    createTime,
    deleteTime,
    getAllTimes,
    getTimeById,
    toggleTime,
    updateTime,
} from "../controllers/TimeController";

const router = Router();

router.get("/", getAllTimes);
router.get("/:id", getTimeById);
router.post("/", createTime);
router.put("/:id", updateTime);
router.patch("/:id", toggleTime);
router.delete("/:id", deleteTime);
export default router;
