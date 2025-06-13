"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const NacBoardController_1 = require("../controllers/NacBoardController");
const router = (0, express_1.Router)();
router.get("/", NacBoardController_1.getAllNacBoards);
router.get("/with-circuits", NacBoardController_1.getNacBoardsWithCircuits);
router.get("/:id", NacBoardController_1.getNacBoardById);
router.post("/", NacBoardController_1.createNacBoard);
router.put("/:id", NacBoardController_1.updateNacBoard);
router.patch("/:id/status", NacBoardController_1.updateNacBoardStatus);
router.delete("/:id", NacBoardController_1.deleteNacBoard);
exports.default = router;
//# sourceMappingURL=NacBoardRouter.js.map