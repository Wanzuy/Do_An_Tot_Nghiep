"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TimeController_1 = require("../controllers/TimeController");
const router = (0, express_1.Router)();
router.get("/", TimeController_1.getAllTimes);
router.get("/:id", TimeController_1.getTimeById);
router.post("/", TimeController_1.createTime);
router.put("/:id", TimeController_1.updateTime);
router.patch("/:id", TimeController_1.toggleTime);
router.delete("/:id", TimeController_1.deleteTime);
exports.default = router;
//# sourceMappingURL=TimeRouter.js.map