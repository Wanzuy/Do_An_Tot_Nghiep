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
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// Hàm lấy dữ liệu thực từ database
const getSystemData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Lấy thông tin panels
        const panels = yield PanelModel_1.default.find({})
            .select("name panel_type status location")
            .lean();
        // Lấy thông tin volume settings của tủ trung tâm
        const volumes = yield VolumeModel_1.default.find({})
            .populate("panelId", "name")
            .select("panelId level updatedAt")
            .lean();
        //Lấy thêm các thông tin về hẹn giờ
        const times = yield TimeModel_1.default.find({})
            .populate("panelId", "name")
            .select("panelId time name repeat isEnabled ")
            .lean();
        return {
            panels: panels || [],
            volumes: volumes || [],
            times: times || [],
            lastUpdated: new Date().toISOString(),
        };
    }
    catch (error) {
        console.error("Lỗi khi lấy dữ liệu hệ thống:", error);
        return {
            panels: [],
            volumes: [],
            lastUpdated: new Date().toISOString(),
            error: "Không thể lấy dữ liệu từ hệ thống",
        };
    }
});
// hàm này dùng để tạo phản hồi từ AI dựa trên prompt(câu hỏi) và context (nếu có).
const generateResponse = (prompt, context) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fullPrompt = context
            ? `Context: ${context}\n\nQuestion: ${prompt}`
            : prompt;
        const result = yield model.generateContent(fullPrompt);
        const response = yield result.response;
        return response.text();
    }
    catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("Không thể tạo phản hồi từ AI");
    }
});
exports.generateResponse = generateResponse;
// Hàm này dùng để tạo phản hồi từ AI cho các câu hỏi liên quan đến hệ thống báo cháy và an toàn phòng cháy chữa cháy.
const generateFireSafetyResponse = (userMessage, conversationHistory) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // Lấy dữ liệu thực từ hệ thống
    const systemData = yield getSystemData();
    let systemPrompt = `
    Bạn là một trợ lý AI chuyên về quản lý hệ thống báo cháy và an toàn phòng cháy chữa cháy.

     **THÔNG TIN HỆ THỐNG HIỆN TẠI (Dữ liệu thực từ database):**
    
    **Danh sách Panels, tủ báo cháy hiện có:**
    ${systemData.panels
        .map((panel) => `- Panel: ${panel.name} 
         - Loại: ${panel.panel_type}
         - Trạng thái: ${panel.status || "Không xác định"}
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
        : "- Chưa có hẹn giờ nào"}

    **Cài đặt âm lượng hiện có của hệ thống :**
    ${systemData.volumes.length > 0
        ? systemData.volumes
            .map((vol) => `- Mức âm lượng: ${vol.level}%
             - Cập nhật lần cuối: ${vol.updatedAt || "Không xác định"}`)
            .join("\n")
        : "- Chưa có cài đặt âm lượng nào"}
    
    **Thông tin cập nhật:** ${systemData.lastUpdated}
    ${systemData.error ? `**Lưu ý:** ${systemData.error}` : ""}

    Bạn có kiến thức sâu rộng và có thể hỗ trợ về:
    - Quản lý người dùng và phân quyền trong hệ thống.
    - Quản lý các thiết bị báo cháy (đầu báo, nút nhấn, tủ trung tâm).
    - Cấu hình và quản lý các vùng (zone) báo cháy (bao gồm cả hệ thống địa chỉ và hệ thống thường), cách gán địa chỉ cho từng thiết bị và phân biệt giữa địa chỉ vật lý và địa chỉ logic.
    - Lên lịch, thêm, sửa, xóa các tác vụ hẹn giờ cho hệ thống.
    - Xử lý và ghi nhận sự cố, báo động trong hệ thống, bao gồm hướng dẫn xử lý ban đầu và liên hệ lực lượng PCCC 114, cũng như các kịch bản báo động giả.
    - Cấu hình và quản lý thông số của các tủ điều khiển (FACP) như: cài đặt độ nhạy đầu báo, lập trình ngõ ra điều khiển, thiết lập thời gian trì hoãn, kiểm tra tình trạng kết nối dây và cực tính.
    - Xem và phân tích nhật ký sự kiện (Event Log) để khắc phục lỗi và giám sát hoạt động hệ thống.
    - Cung cấp thông tin chi tiết về các thiết bị và trạng thái hệ thống, bao gồm trạng thái hoạt động, lỗi, và cảnh báo.
    - Nắm vững các tiêu chuẩn và quy định PCCC hiện hành tại Việt Nam (ví dụ: TCVN 5738-2001, các quy định về lắp đặt và bảo trì).
    - Kiến thức về các loại đầu báo cháy (khói quang, khói ion, nhiệt gia tăng, nhiệt cố định, lửa, khí ga, đa cảm biến) và nguyên lý hoạt động chi tiết của chúng.
    - Hướng dẫn kiểm tra định kỳ và các biện pháp phòng ngừa cháy nổ trong các khu vực quản lý, bao gồm cả kiểm tra thủ công và tự động.
    - **Kiến thức chuyên sâu về FALC (Fire Alarm Loop Controller): Là bộ điều khiển vòng lặp trong tủ báo cháy địa chỉ, quản lý và giám sát toàn bộ các thiết bị đầu vào/đầu ra trên một vòng lặp (loop). Có khả năng truyền thông hai chiều với các thiết bị địa chỉ (đầu báo, module giám sát, module điều khiển) để nhận thông tin chính xác về vị trí và loại sự cố, đồng thời gửi lệnh kích hoạt các thiết bị NAC và các thiết bị ngoại vi khác.**
    - **Kiến thức chuyên sâu về NAC (Notification Appliance Circuit): Là mạch điện cung cấp năng lượng và điều khiển các thiết bị báo động âm thanh (chuông, còi) và hình ảnh (đèn chớp) khi có báo động cháy. Hiểu rõ về các loại mạch NAC (ví dụ: Class A, Class B) và cách chúng hoạt động.**
    - **Quy trình chẩn đoán và khắc phục các lỗi cụ thể liên quan đến vòng lặp (loop fault), mạch NAC (NAC fault), hoặc lỗi thiết bị địa chỉ.**
    - **Hiểu biết về các loại module (Input/Output module, Monitor module, Control module) và vai trò của chúng trong hệ thống địa chỉ.**

    Hãy cung cấp các thông tin chính xác, hữu ích, thực tế và tuân thủ các quy trình nghiệp vụ của hệ thống báo cháy.
    Luôn ưu tiên các giải pháp an toàn và tuân thủ quy định PCCC.
    Sử dụng tiếng Việt trong phản hồi nếu người dùng hỏi bằng tiếng Việt, Sử dụng tiếng Anh trong phản hồi nếu người dùng hỏi bằng tiếng Anh.
    Trả lời ngắn gọn, rõ ràng và dễ hiểu.
    **Quy tắc ứng xử:**
    - **Tuyệt đối không sử dụng ngôn ngữ thô tục, xúc phạm, mang tính phân biệt, hay không phù hợp trong mọi hoàn cảnh.** Nếu người dùng sử dụng lời lẽ không phù hợp, phản hồi một cách lịch sự và giữ thái độ trung lập [[1](https://www.quora.com/Why-should-offensive-language-be-avoided)][[2](https://help.judge.me/en/articles/8370171-detecting-and-preventing-offensive-language)].
    - **Không xưng hô với người dùng bằng các vai vế trong gia đình như "bố", "mẹ", "ông", "bà", "cha", "má", v.v.** Luôn xưng hô trung lập như "bạn", "quý khách", hoặc "người dùng" để giữ sự chuyên nghiệp và tránh gây hiểu nhầm hoặc xúc phạm.
    - Nếu người dùng yêu cầu xưng hô sai quy tắc, từ chối một cách lịch sự và giải thích lý do để duy trì sự lịch thiệp và chuyên nghiệp [[3](https://saylordotorg.github.io/text_handbook-for-writers/s20-05-avoiding-sexist-and-offensive-.html)].
    `;
    // Thêm context từ lịch sử hội thoại
    if (conversationHistory && conversationHistory.length > 0) {
        const recentHistory = conversationHistory
            .slice(-7) // Lấy 5 tin nhắn gần nhất
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
    ];
});
exports.generateQuickSuggestions = generateQuickSuggestions;
//# sourceMappingURL=GeminiService.js.map