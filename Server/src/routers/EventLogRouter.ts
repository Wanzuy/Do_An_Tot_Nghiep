import { Router } from "express";
import {
    acknowledgeEvent,
    getAllEvents,
    getEventById,
} from "../controllers/EventLogController";

const router = Router();
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.put("/:id/acknowledge", acknowledgeEvent);
export default router;
