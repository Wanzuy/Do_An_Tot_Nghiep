"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearChatHistory = exports.getChatHistory = exports.getChatSuggestions = exports.chatWithBot = void 0;
const GeminiService_1 = require("../services/GeminiService");
const ChatHistoryModel_1 = __importDefault(require("../models/ChatHistoryModel"));
const chatWithBot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { message, sessionId } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Tin nhắn không được để trống",
            });
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Không xác định được người dùng",
            });
        }
        // Tìm hoặc tạo session chat mới
        let chatHistory = yield ChatHistoryModel_1.default.findOne({
            userId,
            sessionId: sessionId || "default",
        });
        if (!chatHistory) {
            chatHistory = new ChatHistoryModel_1.default({
                userId,
                sessionId: sessionId || "default",
                messages: [],
            });
        }
        // Thêm tin nhắn của user
        const userMessage = {
            role: "user",
            content: message,
            timestamp: new Date(),
        };
        chatHistory.messages.push(userMessage);
        // Lấy lịch sử hội thoại để làm context
        const conversationHistory = chatHistory.messages
            .slice(-10) // Lấy 10 tin nhắn gần nhất
            .map((msg) => ({
            role: msg.role,
            content: msg.content,
        })); // Tạo phản hồi từ AI
        const aiResponse = yield (0, GeminiService_1.generateFireSafetyResponse)(message, conversationHistory.slice(0, -1) // Bỏ tin nhắn hiện tại
        );
        // Thêm phản hồi của bot
        const botMessage = {
            role: "bot",
            content: aiResponse,
            timestamp: new Date(),
        };
        chatHistory.messages.push(botMessage);
        // Lưu lịch sử chat
        yield chatHistory.save();
        res.status(200).json({
            success: true,
            data: {
                message: aiResponse,
                timestamp: botMessage.timestamp,
                sessionId: chatHistory.sessionId,
            },
        });
    }
    catch (error) {
        console.error("Chatbot error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Đã xảy ra lỗi khi xử lý tin nhắn",
        });
    }
});
exports.chatWithBot = chatWithBot;
const getChatSuggestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const suggestions = yield (0, GeminiService_1.generateQuickSuggestions)();
        res.status(200).json({
            success: true,
            data: suggestions,
        });
    }
    catch (error) {
        console.error("Get suggestions error:", error);
        res.status(500).json({
            success: false,
            message: "Không thể tải gợi ý",
        });
    }
});
exports.getChatSuggestions = getChatSuggestions;
const getChatHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { sessionId, limit = 50 } = req.query;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Không xác định được người dùng",
            });
        }
        const query = { userId };
        if (sessionId) {
            query.sessionId = sessionId;
        }
        const chatHistory = yield ChatHistoryModel_1.default.findOne(query)
            .select("messages sessionId")
            .sort({ updatedAt: -1 });
        if (!chatHistory) {
            return res.status(200).json({
                success: true,
                data: {
                    messages: [],
                    sessionId: "default",
                },
            });
        }
        // Lấy số lượng tin nhắn theo limit
        const messages = chatHistory.messages
            .slice(-parseInt(limit))
            .map((msg) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
        }));
        res.status(200).json({
            success: true,
            data: {
                messages,
                sessionId: chatHistory.sessionId,
            },
        });
    }
    catch (error) {
        console.error("Get chat history error:", error);
        res.status(500).json({
            success: false,
            message: "Không thể tải lịch sử chat",
        });
    }
});
exports.getChatHistory = getChatHistory;
const clearChatHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { sessionId } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Không xác định được người dùng",
            });
        }
        const query = { userId };
        if (sessionId) {
            query.sessionId = sessionId;
        }
        yield ChatHistoryModel_1.default.deleteMany(query);
        res.status(200).json({
            success: true,
            message: "Đã xóa lịch sử chat thành công",
        });
    }
    catch (error) {
        console.error("Clear chat history error:", error);
        res.status(500).json({
            success: false,
            message: "Không thể xóa lịch sử chat",
        });
    }
});
exports.clearChatHistory = clearChatHistory;
//# sourceMappingURL=ChatbotController.js.map