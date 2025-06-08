"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TimeController_1 = require("../controllers/TimeController");
const verifyToken_1 = require("../middlewares/verifyToken");
const router = (0, express_1.Router)();
router.get("/", verifyToken_1.verifyToken, TimeController_1.getAllTimes);
router.get("/:id", verifyToken_1.verifyToken, TimeController_1.getTimeById);
router.post("/", verifyToken_1.verifyToken, TimeController_1.createTime);
router.put("/:id", verifyToken_1.verifyToken, TimeController_1.updateTime);
router.patch("/:id", verifyToken_1.verifyToken, TimeController_1.toggleTime);
router.delete("/:id", verifyToken_1.verifyToken, TimeController_1.deleteTime);
exports.default = router;
//# sourceMappingURL=TimeRouter.js.map