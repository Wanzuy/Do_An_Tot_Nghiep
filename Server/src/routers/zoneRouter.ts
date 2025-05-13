import { Router } from "express";
import {
    createZone,
    deleteZone,
    getAllZones,
    getZoneById,
    getZoneChildren,
    updateZone,
} from "../controllers/ZoneController";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

// GET /zones - Lấy tất cả các zone
router.get("/", verifyToken, getAllZones);
// POST /zones - Tạo mới một zone
router.post("/", verifyToken, createZone);
// GET /zones/:id - Lấy thông tin của một zone theo ID
router.get("/:id", verifyToken, getZoneById);
// PUT /zones/:id - Cập nhật thông tin của một zone
router.put("/:id", verifyToken, updateZone);
// DELETE /zones/:id - Xóa một zone
router.delete("/:id", verifyToken, deleteZone);
// GET /zones/:id/children - Lấy tất cả zone con của một zone
router.get("/:id/children", verifyToken, getZoneChildren);

export default router;
