import { Request, Response } from "express";
import {
    generateFireSafetyResponse,
    generateQuickSuggestions,
} from "../services/GeminiService";
import ChatHistoryModel, { IMessage } from "../models/ChatHistoryModel";

interface AuthenticatedRequest extends Request {
    user?: any;
}

export const chatWithBot = async (req: AuthenticatedRequest, res: any) => {
    try {
        const { message, sessionId } = req.body;
        const userId = req.user?._id;

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
        let chatHistory = await ChatHistoryModel.findOne({
            userId,
            sessionId: sessionId || "default",
        });

        if (!chatHistory) {
            chatHistory = new ChatHistoryModel({
                userId,
                sessionId: sessionId || "default",
                messages: [],
            });
        }

        // Thêm tin nhắn của user
        const userMessage: IMessage = {
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
        const aiResponse = await generateFireSafetyResponse(
            message,
            conversationHistory.slice(0, -1) // Bỏ tin nhắn hiện tại
        );

        // Thêm phản hồi của bot
        const botMessage: IMessage = {
            role: "bot",
            content: aiResponse,
            timestamp: new Date(),
        };

        chatHistory.messages.push(botMessage);

        // Lưu lịch sử chat
        await chatHistory.save();

        res.status(200).json({
            success: true,
            data: {
                message: aiResponse,
                timestamp: botMessage.timestamp,
                sessionId: chatHistory.sessionId,
            },
        });
    } catch (error: any) {
        console.error("Chatbot error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Đã xảy ra lỗi khi xử lý tin nhắn",
        });
    }
};

export const getChatSuggestions = async (req: Request, res: Response) => {
    try {
        const suggestions = await generateQuickSuggestions();

        res.status(200).json({
            success: true,
            data: suggestions,
        });
    } catch (error: any) {
        console.error("Get suggestions error:", error);
        res.status(500).json({
            success: false,
            message: "Không thể tải gợi ý",
        });
    }
};

export const getChatHistory = async (req: AuthenticatedRequest, res: any) => {
    try {
        const userId = req.user?._id;
        const { sessionId, limit = 50 } = req.query;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Không xác định được người dùng",
            });
        }

        const query: any = { userId };
        if (sessionId) {
            query.sessionId = sessionId;
        }

        const chatHistory = await ChatHistoryModel.findOne(query)
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
            .slice(-parseInt(limit as string))
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
    } catch (error: any) {
        console.error("Get chat history error:", error);
        res.status(500).json({
            success: false,
            message: "Không thể tải lịch sử chat",
        });
    }
};

export const clearChatHistory = async (req: AuthenticatedRequest, res: any) => {
    try {
        const userId = req.user?._id;
        const { sessionId } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Không xác định được người dùng",
            });
        }

        const query: any = { userId };
        if (sessionId) {
            query.sessionId = sessionId;
        }

        await ChatHistoryModel.deleteMany(query);

        res.status(200).json({
            success: true,
            message: "Đã xóa lịch sử chat thành công",
        });
    } catch (error: any) {
        console.error("Clear chat history error:", error);
        res.status(500).json({
            success: false,
            message: "Không thể xóa lịch sử chat",
        });
    }
};
