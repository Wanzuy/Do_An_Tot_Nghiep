"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const EventLogController_1 = require("../controllers/EventLogController");
const router = (0, express_1.Router)();
router.get("/", EventLogController_1.getAllEvents);
router.get("/:id", EventLogController_1.getEventById);
router.put("/:id/acknowledge", EventLogController_1.acknowledgeEvent);
exports.default = router;
//# sourceMappingURL=EventLogRouter.js.map