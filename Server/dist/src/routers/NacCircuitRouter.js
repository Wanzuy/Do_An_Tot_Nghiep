"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const NacCircuitController_1 = require("../controllers/NacCircuitController");
const router = (0, express_1.Router)();
router.get("/", NacCircuitController_1.getAllNacCircuits);
router.get("/:id", NacCircuitController_1.getNacCircuitById);
router.get("/nacboards/:nacBoardId/circuits", NacCircuitController_1.getCircuitsByNacBoardId);
router.post("/", NacCircuitController_1.createNacCircuit);
router.put("/:id", NacCircuitController_1.updateNacCircuit);
router.delete("/:id", NacCircuitController_1.deleteNacCircuit);
router.patch("/:id/activate", NacCircuitController_1.activateCircuit);
router.patch("/:id/deactivate", NacCircuitController_1.deactivateCircuit);
exports.default = router;
//# sourceMappingURL=NacCircuitRouter.js.map