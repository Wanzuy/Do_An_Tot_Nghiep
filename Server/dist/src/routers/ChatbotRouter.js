"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ChatbotController_1 = require("../controllers/ChatbotController");
const verifyToken_1 = require("../middlewares/verifyToken");
const router = (0, express_1.Router)();
// Chat với bot (cần xác thực)
router.post("/chat", verifyToken_1.verifyToken, ChatbotController_1.chatWithBot);
// Lấy gợi ý câu hỏi (cần xác thực)
router.get("/suggestions", verifyToken_1.verifyToken, ChatbotController_1.getChatSuggestions);
// Lấy lịch sử chat (cần xác thực)
router.get("/history", verifyToken_1.verifyToken, ChatbotController_1.getChatHistory);
// Xóa lịch sử chat (cần xác thực)
router.delete("/history", verifyToken_1.verifyToken, ChatbotController_1.clearChatHistory);
exports.default = router;
//# sourceMappingURL=ChatbotRouter.js.map