import { Router } from "express";
import {
  activateCircuit,
  createNacCircuit,
  deactivateCircuit,
  deleteNacCircuit,
  getAllNacCircuits,
  getCircuitsByNacBoardId,
  getCircuitsByZoneId,
  getNacCircuitById,
  updateNacCircuit,
} from "../controllers/NacCircuitController";

const router = Router();
router.get("/", getAllNacCircuits);
router.get("/:id", getNacCircuitById);
router.get("/nacboards/:nacBoardId/circuits", getCircuitsByNacBoardId);
router.get("/zone/:zoneId", getCircuitsByZoneId);
router.post("/", createNacCircuit);
router.put("/:id", updateNacCircuit);
router.delete("/:id", deleteNacCircuit);
router.patch("/:id/activate", activateCircuit);
router.patch("/:id/deactivate", deactivateCircuit);

export default router;
