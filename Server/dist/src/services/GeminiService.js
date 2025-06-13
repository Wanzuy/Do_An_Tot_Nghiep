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
exports.generateQuickSuggestions = exports.generateFireSafetyResponse = exports.generateResponse = void 0;
const generative_ai_1 = require("@google/generative-ai");
const PanelModel_1 = __importDefault(require("../models/PanelModel"));
const VolumeModel_1 = __importDefault(require("../models/VolumeModel"));
const TimeModel_1 = __importDefault(require("../models/TimeModel"));
const FalcBoardModel_1 = __importDefault(require("../models/FalcBoardModel"));
const DetectorModel_1 = __importDefault(require("../models/DetectorModel"));
const EventLogModel_1 = __importDefault(require("../models/EventLogModel"));
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// Cấu hình retry đơn giản
const RETRY_CONFIG = {
    maxRetries: 2, // Số lần thử lại tối đa
    baseDelay: 1000, // Thời gian chờ giữa các lần thử (ms)
};
// Hàm sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// Kiểm tra lỗi có thể retry
const isRetryableError = (error) => {
    if (!error)
        return false;
    return error.status === 503 || error.status === 502 || error.status === 504;
};
// Hàm tạo nội dung với retry đơn giản
const generateContentWithRetry = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    let lastError;
    for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
        try {
            const result = yield model.generateContent(prompt);
            const response = yield result.response;
            return response.text();
        }
        catch (error) {
            lastError = error;
            console.error(`Gemini API error (attempt ${attempt + 1}):`, error);
            if (attempt === RETRY_CONFIG.maxRetries || !isRetryableError(error)) {
                break;
            }
            yield sleep(RETRY_CONFIG.baseDelay * (attempt + 1));
        }
    }
    return getFallbackResponse();
});
// Phản hồi dự phòng đơn giản
const getFallbackResponse = () => {
    return `Xin lỗi, dịch vụ AI tạm thời không khả dụng do quá tải. Vui lòng thử lại sau vài phút.

**Trong thời gian chờ đợi:**
- Kiểm tra trạng thái hệ thống qua giao diện chính
- Liên hệ bộ phận kỹ thuật nếu khẩn cấp: 0987654321
- Tham khảo tài liệu hướng dẫn sử dụng hệ thống báo cháy

Cảm ơn bạn đã thông cảm!`;
};
// Hàm lấy dữ liệu thực từ database
const getSystemData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Lấy thông tin panels
        const panels = yield PanelModel_1.default.find({})
            .select("name panel_type status location loops_supported ram_usage cpu_usage")
            .lean();
        // Lấy thông tin volume settings của tủ trung tâm
        const volumes = yield VolumeModel_1.default.find({})
            .populate("panelId", "name")
            .select("panelId level updatedAt")
            .lean();
        // Lấy thêm các thông tin về hẹn giờ
        const times = yield TimeModel_1.default.find({})
            .populate("panelId", "name")
            .select("panelId time name repeat isEnabled")
            .lean(); // Lấy thông tin về bo mạch FALC
        const falcBoards = yield FalcBoardModel_1.default.find({})
            .populate("panelId", "name panel_type")
            .select("name panelId number_of_detectors status is_active description")
            .lean();
        // Lấy thông tin về các đầu báo
        const detectors = yield DetectorModel_1.default.find({})
            .populate({
            path: "falcBoardId",
            select: "name",
            populate: {
                path: "panelId",
                select: "name",
            },
        })
            .populate("zoneId", "name")
            .select("name detector_address detector_type status is_active falcBoardId zoneId last_reading last_reported_at")
            .lean();
        // Lấy thông tin về các sự cố/event logs (chỉ lấy 50 bản ghi gần nhất)
        const eventLogs = yield EventLogModel_1.default.find({})
            .select("timestamp event_type description source_type source_id status acknowledged_at acknowledged_by_user_id zoneId panelId")
            .sort({ timestamp: -1 }) // Sắp xếp theo thời gian giảm dần
            .limit(50) // Giới hạn 50 bản ghi gần nhất
            .lean();
        // Tính toán số lượng đầu báo hiện có cho mỗi bo mạch FALC
        const falcBoardsWithDetectorCount = falcBoards.map((board) => {
            const currentDetectorCount = detectors.filter((detector) => { var _a, _b; return ((_b = (_a = detector.falcBoardId) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) === board._id.toString(); }).length;
            return Object.assign(Object.assign({}, board), { current_detector_count: currentDetectorCount });
        });
        return {
            panels: panels || [],
            volumes: volumes || [],
            times: times || [],
            falcBoards: falcBoardsWithDetectorCount || [],
            detectors: detectors || [],
            eventLogs: eventLogs || [],
            lastUpdated: new Date().toISOString(),
        };
    }
    catch (error) {
        console.error("Lỗi khi lấy dữ liệu hệ thống:", error);
        return {
            panels: [],
            volumes: [],
            times: [],
            falcBoards: [],
            detectors: [],
            eventLogs: [],
            lastUpdated: new Date().toISOString(),
            error: "Không thể lấy dữ liệu từ hệ thống",
        };
    }
});
// hàm này dùng để tạo phản hồi từ AI dựa trên prompt(câu hỏi) và context (nếu có).
const generateResponse = (prompt, context) => __awaiter(void 0, void 0, void 0, function* () {
    const fullPrompt = context
        ? `Context: ${context}\n\nQuestion: ${prompt}`
        : prompt;
    return yield generateContentWithRetry(fullPrompt);
});
exports.generateResponse = generateResponse;
// Hàm tạo phản hồi AI chuyên sâu cho hệ thống báo cháy và an toàn PCCC
const generateFireSafetyResponse = (userMessage, conversationHistory) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // Lấy dữ liệu thực từ hệ thống
    const systemData = yield getSystemData();
    let systemPrompt = `
    Bạn là một trợ lý AI chuyên về quản lý hệ thống báo cháy và an toàn phòng cháy chữa cháy.

    **THÔNG TIN HỆ THỐNG HIỆN TẠI (Dữ liệu thực từ database):**
    
    **Danh sách Panels/Tủ báo cháy hiện có:**
    ${systemData.panels
        .map((panel) => `- Panel: ${panel.name} 
         - Loại: ${panel.panel_type}
         - Trạng thái: ${panel.status || "Không xác định"}
         - Số lượng loop hỗ trợ: ${panel.loops_supported || "Không xác định"}
         - Sử dụng RAM: ${panel.ram_usage || "Không xác định"}%     
         - Sử dụng CPU: ${panel.cpu_usage || "Không xác định"}%    
         - Vị trí: ${panel.location || "Chưa xác định"}`)
        .join("\n")}    
    **Danh sách hẹn giờ hiện có:**
    ${((_a = systemData.times) !== null && _a !== void 0 ? _a : []).length > 0
        ? ((_b = systemData.times) !== null && _b !== void 0 ? _b : [])
            .map((time) => `- Tên: ${time.name} 
             - Giờ: ${time.time || "Không xác định"}
             - Lặp lại: ${time.repeat.length > 0 ? time.repeat.join(", ") : "Không"}
             - Trạng thái: ${time.isEnabled ? "Bật" : "Tắt"}`)
            .join("\n")
        : "- Chưa có hẹn giờ nào"}    **Danh sách Bo mạch FALC hiện có:**
    ${systemData.falcBoards.length > 0
        ? systemData.falcBoards
            .map((falc) => {
            var _a;
            return `- Bo mạch FALC: ${falc.name}
             - Thuộc tủ: ${((_a = falc.panelId) === null || _a === void 0 ? void 0 : _a.name) || "Không xác định"}
             - Mô tả: ${falc.description || "Không có"}
             - Số đầu báo tối đa: ${falc.number_of_detectors || "Không xác định"}
             - Số đầu báo hiện có: ${falc.current_detector_count || 0}
             - Trạng thái: ${falc.status || "Không xác định"}
             - Hoạt động: ${falc.is_active ? "Bật" : "Tắt"}`;
        })
            .join("\n")
        : "- Chưa có bo mạch FALC nào"}

    **Danh sách Đầu báo hiện có:**
    ${systemData.detectors.length > 0
        ? systemData.detectors
            .map((detector) => {
            var _a, _b, _c, _d;
            return `- Đầu báo: ${detector.name || "Không có tên"}
             - Địa chỉ: ${detector.detector_address}             
             - Loại: ${detector.detector_type || "Không xác định"}
             - Tình trạng: ${detector.status || "Không xác định"} (Normal: Đầu báo đang hoạt động bình thường, không có lỗi; Alarm: Đầu báo phát hiện sự cố, cảnh báo; Fault: Đầu báo gặp sự cố hoặc lỗi)
             - Trạng thái hoạt động: ${detector.is_active ? "Bật" : "Tắt"}
             - Thuộc bo mạch FALC: ${((_a = detector.falcBoardId) === null || _a === void 0 ? void 0 : _a.name) || "Không xác định"}
             - Thuộc tủ: ${((_c = (_b = detector.falcBoardId) === null || _b === void 0 ? void 0 : _b.panelId) === null || _c === void 0 ? void 0 : _c.name) || "Không xác định"}
             - Khu vực (Zone): ${((_d = detector.zoneId) === null || _d === void 0 ? void 0 : _d.name) || "Chưa gán"}
             - Giá trị đọc cuối: ${detector.last_reading !== undefined &&
                detector.last_reading !== null
                ? detector.last_reading
                : "Không có"}
             - Báo cáo lần cuối: ${detector.last_reported_at || "Không xác định"}`;
        })
            .join("\n")
        : "- Chưa có đầu báo nào"}

    **Cài đặt âm lượng hệ thống:**
    ${systemData.volumes.length > 0
        ? systemData.volumes
            .map((vol) => `- Mức âm lượng: ${vol.level}%
             - Cập nhật lần cuối: ${vol.updatedAt || "Không xác định"}`)
            .join("\n")
        : "- Chưa có cài đặt âm lượng nào"}

    **Nhật ký sự cố/sự kiện gần đây (50 bản ghi mới nhất):**
    ${systemData.eventLogs.length > 0
        ? systemData.eventLogs
            .map((log) => {
            var _a, _b;
            return `- Thời gian: ${new Date(log.timestamp).toLocaleString("vi-VN")}
             - Loại sự kiện: ${log.event_type} (Fire Alarm: Báo động; Fault: Lỗi hệ thống; Restore: Khôi phục; Offline: Mất kết nối; Activation: Kích hoạt; Deactivation: Vô hiệu hóa; StatusChange: Thay đổi trạng thái; ConfigChange: Thay đổi cấu hình)
             - Mô tả: ${log.description}
             - Nguồn sự kiện: ${log.source_type} (Detector: Từ đầu báo; NAC: Từ mạch báo động; Panel: Từ tủ điều khiển)
             - ID nguồn: ${log.source_id || "Không có"}
             - Khu vực: ${((_a = log.zoneId) === null || _a === void 0 ? void 0 : _a.name) || "Không xác định"}
             - Tủ điều khiển: ${((_b = log.panelId) === null || _b === void 0 ? void 0 : _b.name) || "Không xác định"}
             - Trạng thái xử lý: ${log.status} (Active là chưa được sử lý và cần xử lý; Cleared: Đã xử lý)
             - Thời gian xác nhận: ${log.acknowledged_at
                ? new Date(log.acknowledged_at).toLocaleString("vi-VN")
                : "Chưa xác nhận"}
             - Người xác nhận: ${log.acknowledged_by_user_id || "Chưa có"}`;
        })
            .join("\n")
        : "- Chưa có sự cố/sự kiện nào được ghi nhận"}
    
    **Thông tin cập nhật:** ${systemData.lastUpdated}
    ${systemData.error ? `**Lưu ý:** ${systemData.error}` : ""}

    **KIẾN THỨC CHUYÊN MÔN VÀ KHẢ NĂNG HỖ TRỢ:**
    
    **1. Quản lý hệ thống và người dùng:**
    - Quản lý người dùng và phân quyền trong hệ thống báo cháy
    - Cấu hình các cấp độ truy cập và quyền hạn cho từng vai trò
    - Giám sát hoạt động người dùng và bảo mật hệ thống

    **2. Quản lý thiết bị báo cháy:**
    - Các loại đầu báo cháy: khói quang, khói ion, nhiệt gia tăng, nhiệt cố định, lửa, khí ga, đa cảm biến
    - Nguyên lý hoạt động chi tiết của từng loại thiết bị
    - Nút nhấn báo cháy thủ công và các thiết bị khởi động khác
    - Tủ trung tâm (FACP) và các thành phần liên quan

    **3. Quản lý vùng (Zone) báo cháy:**
    - Hệ thống địa chỉ (Addressable) và hệ thống thường (Conventional)
    - Cách gán địa chỉ cho từng thiết bị và phân biệt địa chỉ vật lý/logic  
    - Cấu hình và quản lý các vùng báo cháy
    - Thiết lập mối quan hệ giữa các vùng và thiết bị    **4. Quản lý thời gian và lịch trình:**
    - Lên lịch, thêm, sửa, xóa các tác vụ hẹn giờ cho hệ thống
    - Cấu hình các chế độ hoạt động theo thời gian
    - Quản lý lịch kiểm tra định kỳ và bảo trì

    **5. Quản lý và phân tích sự cố/Event Log:**
    - **Các loại sự kiện:** Fire Alarm (báo động cháy), Fault (lỗi hệ thống), Restore (khôi phục), Offline (mất kết nối), Activation (kích hoạt), Deactivation (vô hiệu hóa), StatusChange (thay đổi trạng thái), ConfigChange (thay đổi cấu hình)
    - **Nguồn sự kiện:** Detector (từ đầu báo), NAC (từ mạch báo động), Panel (từ tủ điều khiển)
    - **Trạng thái xử lý:** Active (cần xử lý ngay), Cleared (đã xử lý xong), Info (thông tin tham khảo)
    - **Phân tích xu hướng:** Thống kê tần suất sự cố theo thời gian, khu vực, loại thiết bị
    - **Quy trình xử lý:** Xác nhận sự cố, phân loại mức độ ưu tiên, giao việc xử lý, theo dõi tiến độ
    - **Báo cáo sự cố:** Tạo báo cáo chi tiết, thống kê hiệu suất hệ thống, đề xuất cải thiện

    **6. Xử lý sự cố và báo động:**
    - Xử lý và ghi nhận sự cố, báo động trong hệ thống
    - Hướng dẫn xử lý ban đầu và liên hệ lực lượng PCCC 114    - Phân biệt và xử lý các kịch bản báo động giả
    - Quy trình ứng phó khẩn cấp và sơ tán

    **7. Cấu hình tủ điều khiển (FACP):**
    - Cài đặt độ nhạy đầu báo theo từng khu vực
    - Lập trình ngõ ra điều khiển (Output Control)
    - Thiết lập thời gian trì hoãn (Delay Time)
    - Kiểm tra tình trạng kết nối dây và cực tính
    - Cấu hình các chế độ hoạt động và báo động

    **8. Giám sát và phân tích:**
    - Xem và phân tích nhật ký sự kiện (Event Log)
    - Khắc phục lỗi và giám sát hoạt động hệ thống
    - Thống kê và báo cáo tình trạng hệ thống
    - Phân tích xu hướng và dự đoán sự cố

    **9. Tiêu chuẩn và quy định:**
    - Các tiêu chuẩn PCCC hiện hành tại Việt Nam (TCVN 5738-2001)
    - Quy định về lắp đặt và bảo trì hệ thống báo cháy
    - Hướng dẫn tuân thủ các quy trình an toàn
    - Cập nhật thay đổi quy định và tiêu chuẩn mới    **10. Kiến thức chuyên sâu về FALC và NAC:**
    - **FALC (Fire Alarm Loop Controller):** Bộ điều khiển vòng lặp trong tủ báo cháy địa chỉ, quản lý và giám sát toàn bộ các thiết bị đầu vào/đầu ra trên một vòng lặp (loop). Có khả năng truyền thông hai chiều với các thiết bị địa chỉ để nhận thông tin chính xác về vị trí và loại sự cố, đồng thời gửi lệnh kích hoạt các thiết bị NAC và ngoại vi khác.
    - **Thông tin bo mạch FALC:** Tên bo mạch, thuộc tủ nào, số vòng lặp, số đầu báo tối đa được cấp phép, số đầu báo hiện có, trạng thái hoạt động
    - **Quản lý đầu báo trên FALC:** Danh sách đầu báo, địa chỉ, loại (Smoke/Heat/Gas), tên, trạng thái (Normal/Alarm/Fault/Disabled), giá trị đọc cuối, thời gian báo cáo
    - **NAC (Notification Appliance Circuit):** Mạch điện cung cấp năng lượng và điều khiển các thiết bị báo động âm thanh (chuông, còi) và hình ảnh (đèn chớp) khi có báo động cháy. Hiểu rõ về các loại mạch NAC (Class A, Class B) và cách chúng hoạt động.
    - **Quy trình chẩn đoán lỗi:** Loop fault, NAC fault, lỗi thiết bị địa chỉ và cách khắc phục
    - **Các loại module:** Input/Output module, Monitor module, Control module và vai trò của chúng

    **11. Kiểm tra và bảo trì:**
    - Hướng dẫn kiểm tra định kỳ (hàng ngày, tuần, tháng, năm)
    - Các biện pháp phòng ngừa cháy nổ trong khu vực quản lý
    - Kiểm tra thủ công và tự động
    - Quy trình thay thế và nâng cấp thiết bị

    **NGUYÊN TẮC HOẠT ĐỘNG:**
    - Cung cấp thông tin chính xác, hữu ích và thực tế
    - Tuân thủ các quy trình nghiệp vụ của hệ thống báo cháy
    - Luôn ưu tiên các giải pháp an toàn và tuân thủ quy định PCCC
    - Sử dụng tiếng Việt khi người dùng hỏi bằng tiếng Việt, tiếng Anh khi hỏi bằng tiếng Anh
    - Trả lời ngắn gọn, rõ ràng và dễ hiểu

    **QUY TẮC ỨNG XỬ:**
    - Tuyệt đối không sử dụng ngôn ngữ thô tục, xúc phạm, phân biệt đối xử
    - Giữ thái độ lịch sự và chuyên nghiệp trong mọi tình huống
    - Không xưng hô với người dùng bằng các vai vế gia đình
    - Luôn xưng hô trung lập: "bạn", "quý khách", "người dùng"
    - Từ chối lịch sự các yêu cầu không phù hợp và giải thích lý do
    `;
    // Thêm context từ lịch sử hội thoại
    if (conversationHistory && conversationHistory.length > 0) {
        const recentHistory = conversationHistory
            .slice(-7) // Lấy 7 tin nhắn gần nhất
            .map((msg) => `${msg.role}: ${msg.content}`)
            .join("\n");
        systemPrompt += `\n\nLịch sử hội thoại gần đây:\n${recentHistory}`;
    }
    return (0, exports.generateResponse)(userMessage, systemPrompt);
});
exports.generateFireSafetyResponse = generateFireSafetyResponse;
// Hàm này dùng để tạo các gợi ý nhanh cho người dùng
const generateQuickSuggestions = () => __awaiter(void 0, void 0, void 0, function* () {
    return [
        "Danh sách các tủ báo cháy hiện có?",
        "Mức âm lượng hiện tại của hệ thống?",
        "Danh sách các hẹn giờ đã được cấu hình?",
        "Có bao nhiêu bo mạch FALC trong hệ thống?",
        "Danh sách các bo mạch FALC và thông tin chi tiết?",
        "Danh sách đầu báo của từng bo mạch FALC?",
        "Trạng thái hiện tại của các đầu báo?",
        "Các sự cố báo cháy gần đây?",
        "Thống kê sự cố theo loại và trạng thái?",
        "Sự cố nào đang cần xử lý?",
        "Phân tích xu hướng sự cố hệ thống?",
    ];
});
exports.generateQuickSuggestions = generateQuickSuggestions;
//# sourceMappingURL=GeminiService.js.map