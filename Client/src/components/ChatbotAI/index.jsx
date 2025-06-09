import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button, Input, Card, Avatar, Spin, message } from "antd";
import {
    SendOutlined,
    UserOutlined,
    CloseOutlined,
    DeleteOutlined,
    ReloadOutlined,
    AliwangwangFilled,
} from "@ant-design/icons";
import { apiEndpoint } from "../../constants/apiEndpoint";
import { authSelector } from "../../store/reducers/authReducer";
import handleAPI from "../../api/handleAPI";
import { useTranslation } from "react-i18next";

const { TextArea } = Input;

const chatbotStyles = `
    @keyframes glow {
        0%, 100% { box-shadow: 0 0 10px rgba(198, 40, 40, 0.5); }
        50% { box-shadow: 0 0 40px rgba(198, 40, 40, 0.8), 0 0 60px rgba(198, 40, 40, 0.6); }
    }
`;

// Inject styles
if (typeof document !== "undefined") {
    const styleElement = document.createElement("style");
    styleElement.textContent = chatbotStyles;
    document.head.appendChild(styleElement);
}

function Chatbot() {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [sessionId, setSessionId] = useState("default");
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const messagesEndRef = useRef(null);
    const auth = useSelector(authSelector);

    useEffect(() => {
        if (auth && auth._id) {
            setSessionId(auth._id);
            // Reset messages khi user thay đổi để tránh hiển thị lịch sử của user cũ
            setMessages([]);
        } else {
            // Reset về default khi không có auth
            setSessionId("default");
            setMessages([]);
        }
    }, [auth]);

    useEffect(() => {
        if (isOpen && auth && auth._id && sessionId !== "default") {
            loadInitialData();
        }
    }, [isOpen, auth, sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Đóng chatbot khi user logout
    useEffect(() => {
        if (!auth || !auth.token) {
            setIsOpen(false);
            setMessages([]);
            setSuggestions([]);
        }
    }, [auth]);

    // Thêm useEffect để cập nhật tin nhắn chào mừng khi ngôn ngữ thay đổi
    useEffect(() => {
        if (
            messages.length > 0 &&
            messages[0].role === "bot" &&
            messages[0].id === 1
        ) {
            setMessages((prevMessages) => [
                getWelcomeMessage(),
                ...prevMessages.slice(1),
            ]);
        }
    }, [i18n.language]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadInitialData = async () => {
        if (!auth || !auth._id) return;

        setIsLoadingHistory(true);
        try {
            // Load chat history
            await loadChatHistory();

            // Load suggestions if no messages
            if (messages.length === 0) {
                await loadSuggestions();
            }
        } catch (error) {
            console.error("Error loading initial data:", error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const getWelcomeMessage = () => ({
        id: 1,
        role: "bot",
        content: t("chatbotai.content"),
        timestamp: new Date(),
    });

    const loadChatHistory = async () => {
        try {
            const response = await handleAPI(
                `${apiEndpoint.chatbot.history}?sessionId=${sessionId}&limit=20`
            );
            if (response && response.data) {
                const historyMessages = response.data.messages.map(
                    (msg, index) => ({
                        id: Date.now() + index,
                        role: msg.role,
                        content: msg.content,
                        timestamp: new Date(msg.timestamp),
                    })
                );

                if (historyMessages.length === 0) {
                    // Add welcome message if no history
                    setMessages([getWelcomeMessage()]);
                } else {
                    setMessages(historyMessages);
                }
            }
        } catch (error) {
            console.error("Error loading chat history:", error);
            // Add welcome message on error
            setMessages([getWelcomeMessage()]);
        }
    };

    const loadSuggestions = async () => {
        try {
            const response = await handleAPI(apiEndpoint.chatbot.suggestions);
            if (response && response.data) {
                setSuggestions(response.data);
            }
        } catch (error) {
            console.error("Error loading suggestions:", error);
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            role: "user",
            content: inputMessage.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputMessage("");
        setIsLoading(true);

        try {
            const response = await handleAPI(
                apiEndpoint.chatbot.chat,
                {
                    message: userMessage.content,
                    sessionId: sessionId,
                },
                "POST"
            );
            if (response && response.data) {
                const botMessage = {
                    id: Date.now() + 1,
                    role: "bot",
                    content: response.data.message,
                    timestamp: new Date(response.data.timestamp),
                };
                setMessages((prev) => [...prev, botMessage]);

                // sessionId đã được set từ auth._id, không cần cập nhật từ response
            }
        } catch (error) {
            console.error("Error sending message:", error);
            message.error("Không thể gửi tin nhắn. Vui lòng thử lại!");
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = async () => {
        try {
            await handleAPI(
                apiEndpoint.chatbot.clearHistory,
                { sessionId },
                "DELETE"
            );

            setMessages([getWelcomeMessage()]);
        } catch (error) {
            console.error("Error clearing chat:", error);
            message.error("Không thể xóa lịch sử chat");
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setInputMessage(suggestion);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const refreshChat = () => {
        if (!auth || !auth._id) return;

        setMessages([]);
        setIsLoadingHistory(false);
        loadInitialData();
    };

    // không hiển thị chatbot nếu không có token xác thực
    if (!auth || !auth.token) {
        return null;
    }

    return (
        <>
            {" "}
            {!isOpen && (
                <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    icon={<AliwangwangFilled style={{ fontSize: "25px" }} />}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-[2.4rem] right-[2.4rem] !w-[5rem] !h-[5rem] shadow-lg hover:scale-110 transition-all duration-300 z-50
                              max-md:bottom-6 max-md:right-6 max-md:!w-16 max-md:!h-16
                              animate-pulse hover:animate-bounce"
                    style={{
                        background: "linear-gradient(135deg, #c62828, #8f0202)",
                        border: "none",
                        animation: " glow 1.5s infinite ease-in-out",
                    }}
                />
            )}
            {isOpen && (
                <>
                    <Card
                        className="fixed bottom-[2.4rem] right-[2.4rem] w-[350px] h-[550px] max-h-[80vh] z-50 rounded-xl overflow-hidden shadow-2xl
              md:bottom-[2.4rem] md:right-[2.4rem] md:w-[350px] md:h-[550px]
              max-md:fixed max-md:top-1/2 max-md:left-1/2 max-md:transform max-md:-translate-x-1/2 max-md:-translate-y-[43%]
              max-md:w-[90vw] max-md:h-[80vh] max-md:max-w-[400px]"
                        styles={{
                            header: {
                                background:
                                    "linear-gradient(135deg, #dc2626, #991b1b)",
                                border: "none",
                                padding: "0px 15px",
                            },
                            body: {
                                padding: 0,
                                display: "flex",
                                flexDirection: "column",
                                height: "calc(100% - 58px)",
                            },
                        }}
                        title={
                            <div className="flex items-center justify-between text-white">
                                <div className="flex items-center gap-2">
                                    <Avatar
                                        icon={<AliwangwangFilled />}
                                        className="bg-white text-red-600"
                                    />
                                    <span>TVE Chat AI</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        type="text"
                                        icon={<ReloadOutlined />}
                                        onClick={refreshChat}
                                        className="text-white hover:bg-red-700 hover:!text-white"
                                        size="small"
                                        title="Làm mới"
                                    />
                                    <Button
                                        type="text"
                                        icon={<DeleteOutlined />}
                                        onClick={clearChat}
                                        className="text-white hover:bg-red-700 hover:!text-white"
                                        size="small"
                                        title="Xóa lịch sử"
                                    />
                                    <Button
                                        type="text"
                                        icon={<CloseOutlined />}
                                        onClick={() => setIsOpen(false)}
                                        className="text-white hover:bg-red-700 hover:!text-white"
                                        size="small"
                                    />
                                </div>
                            </div>
                        }
                    >
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4 min-h-0">
                            {isLoadingHistory ? (
                                <div className="flex justify-center items-center h-full">
                                    <Spin size="large" />
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${
                                            msg.role === "user"
                                                ? "justify-end"
                                                : "justify-start"
                                        }`}
                                    >
                                        <div
                                            className={`flex items-start gap-2 max-w-[90%] ${
                                                msg.role === "user"
                                                    ? "flex-row-reverse"
                                                    : "flex-row"
                                            }`}
                                        >
                                            <Avatar
                                                icon={
                                                    msg.role === "user" ? (
                                                        <UserOutlined />
                                                    ) : (
                                                        <AliwangwangFilled />
                                                    )
                                                }
                                                className={
                                                    msg.role === "user"
                                                        ? "bg-red-500"
                                                        : "bg-red-500"
                                                }
                                                size="small"
                                            />
                                            <div
                                                className={`flex flex-col flex-1 ${
                                                    msg.role === "user"
                                                        ? "items-end"
                                                        : "items-start"
                                                }`}
                                            >
                                                <div
                                                    className={`px-3 py-2 rounded-lg ${
                                                        msg.role === "user"
                                                            ? "bg-red-500 text-white"
                                                            : "bg-white text-gray-800 border"
                                                    }`}
                                                >
                                                    <div className="whitespace-pre-wrap text-justify text-[1.4rem] leading-relaxed">
                                                        {msg.content}
                                                    </div>
                                                </div>
                                                <div className="text-[1rem] text-gray-500 mt-1">
                                                    {msg.timestamp.toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="flex items-start gap-2">
                                        <Avatar
                                            icon={<AliwangwangFilled />}
                                            className="bg-red-500"
                                            size="small"
                                        />
                                        <div className="bg-white border rounded-lg px-3 py-2">
                                            <Spin size="small" />{" "}
                                            {t("chatbotai.thinking")}
                                        </div>
                                    </div>
                                </div>
                            )}{" "}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggestions */}
                        {suggestions.length > 0 && messages.length <= 1 && (
                            <div className="flex-shrink-0 p-4 bg-white border-t border-gray-200">
                                <div className="text-[1.3rem] text-gray-600 mb-3">
                                    Gợi ý câu hỏi:
                                </div>
                                <div className="space-y-2">
                                    {suggestions
                                        .slice(0, 4)
                                        .map((suggestion, index) => (
                                            <Button
                                                key={index}
                                                size="small"
                                                onClick={() =>
                                                    handleSuggestionClick(
                                                        suggestion
                                                    )
                                                }
                                                className="w-full text-left h-auto py-2 px-3 bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-red-300"
                                            >
                                                <span className="text-[1.3rem] text-gray-700">
                                                    {suggestion}
                                                </span>
                                            </Button>
                                        ))}
                                </div>
                            </div>
                        )}
                        {/* Input Area */}
                        <div className="flex-shrink-0 flex p-4 bg-white border-t border-gray-200 gap-4">
                            <TextArea
                                value={inputMessage}
                                onChange={(e) =>
                                    setInputMessage(e.target.value)
                                }
                                onKeyPress={handleKeyPress}
                                placeholder="Nhập câu hỏi của bạn..."
                                autoSize={{ minRows: 1, maxRows: 3 }}
                                disabled={isLoading}
                                className="flex-1 resize-none"
                            />
                            <Button
                                type="primary"
                                icon={<SendOutlined className="text-white" />}
                                onClick={sendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                className="self-end"
                                style={{
                                    background: "#c62828",
                                    borderColor: "#c62828",
                                }}
                            />
                        </div>
                    </Card>
                </>
            )}
        </>
    );
}

export default Chatbot;
