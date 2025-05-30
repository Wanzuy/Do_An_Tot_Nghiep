"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PanelController_1 = require("../controllers/PanelController");
const router = (0, express_1.Router)();
router.get("/", PanelController_1.getAllPanels);
router.get("/:id", PanelController_1.getPanelById);
router.post("/", PanelController_1.createPanel);
router.put("/:id", PanelController_1.updatePanel);
exports.default = router;
//# sourceMappingURL=PanelRouter.js.map