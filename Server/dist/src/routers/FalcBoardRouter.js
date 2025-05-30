"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FalcBoardController_1 = require("../controllers/FalcBoardController");
const router = (0, express_1.Router)();
router.get("/", FalcBoardController_1.getAllFalcBoards);
router.get("/:id", FalcBoardController_1.getFalcBoardById);
router.get("/panel/:panelId", FalcBoardController_1.getFalcBoardsByPanelId);
router.post("/", FalcBoardController_1.createFalcBoard);
router.put("/:id", FalcBoardController_1.updateFalcBoard);
router.patch("/:id/status", FalcBoardController_1.updateFalcBoardStatus);
router.delete("/:id", FalcBoardController_1.deleteFalcBoard);
exports.default = router;
//# sourceMappingURL=FalcBoardRouter.js.map