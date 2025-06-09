import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// hàm này dùng để tạo phản hồi từ AI dựa trên prompt(câu hỏi) và context (nếu có).
export const generateResponse = async (
    prompt: string,
    context?: string
): Promise<string> => {
    try {
        const fullPrompt = context
            ? `Context: ${context}\n\nQuestion: ${prompt}`
            : prompt;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("Không thể tạo phản hồi từ AI");
    }
};

// Hàm này dùng để tạo phản hồi từ AI cho các câu hỏi liên quan đến hệ thống báo cháy và an toàn phòng cháy chữa cháy.
export const generateFireSafetyResponse = async (
    userMessage: string,
    conversationHistory?: any[]
): Promise<string> => {
    let systemPrompt = `
    Bạn là một trợ lý AI chuyên về quản lý hệ thống báo cháy và an toàn phòng cháy chữa cháy.

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
            .map((msg: any) => `${msg.role}: ${msg.content}`)
            .join("\n");
        systemPrompt += `\n\nLịch sử hội thoại gần đây:\n${recentHistory}`;
    }

    return generateResponse(userMessage, systemPrompt);
};

// Hàm này dùng để tạo các gợi ý nhanh cho người dùng
export const generateQuickSuggestions = async (): Promise<string[]> => {
    return [
        "Cách thêm người dùng mới?",
        "Làm thế nào để thêm hẹn giờ mới?",
        "Làm thế nào để cấu hình tủ điều khiển?",
        "Báo cáo các lỗi thiết bị thường gặp?",
        "Xử lý sự cố báo động giả?",
        "Xem nhật ký sự kiện của hệ thống?",
        "Quy trình sửa thông tin tài khoản?",
        "Quy trình sửa một hẹn giờ?",
    ];
};
