"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ZoneController_1 = require("../controllers/ZoneController");
const verifyToken_1 = require("../middlewares/verifyToken");
const router = (0, express_1.Router)();
// GET /zones - Lấy tất cả các zone
router.get("/", verifyToken_1.verifyToken, ZoneController_1.getAllZones);
// POST /zones - Tạo mới một zone
router.post("/", verifyToken_1.verifyToken, ZoneController_1.createZone);
// GET /zones/:id - Lấy thông tin của một zone theo ID
router.get("/:id", verifyToken_1.verifyToken, ZoneController_1.getZoneById);
// PUT /zones/:id - Cập nhật thông tin của một zone
router.put("/:id", verifyToken_1.verifyToken, ZoneController_1.updateZone);
// DELETE /zones/:id - Xóa một zone
router.delete("/:id", verifyToken_1.verifyToken, ZoneController_1.deleteZone);
// GET /zones/:id/children - Lấy tất cả zone con của một zone
router.get("/:id/children", verifyToken_1.verifyToken, ZoneController_1.getZoneChildren);
exports.default = router;
//# sourceMappingURL=zoneRouter.js.map