import { Router } from "express";
import {
  chatWithBot,
  getChatSuggestions,
  getChatHistory,
  clearChatHistory,
  getAIHealthStatus,
} from "../controllers/ChatbotController";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

// Chat với bot (cần xác thực)
router.post("/chat", verifyToken, chatWithBot);

// Lấy gợi ý câu hỏi (cần xác thực)
router.get("/suggestions", verifyToken, getChatSuggestions);

// Lấy lịch sử chat (cần xác thực)
router.get("/history", verifyToken, getChatHistory);

// Xóa lịch sử chat (cần xác thực)
router.delete("/history", verifyToken, clearChatHistory);

// Lấy trạng thái sức khỏe AI service (cần xác thực)
router.get("/health", verifyToken, getAIHealthStatus);

export default router;
