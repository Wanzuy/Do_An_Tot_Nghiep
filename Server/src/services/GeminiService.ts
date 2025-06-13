import { GoogleGenerativeAI } from "@google/generative-ai";
import PanelModel from "../models/PanelModel";
import VolumeModel from "../models/VolumeModel";
import TimeModel from "../models/TimeModel";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// dùng circuit breaker để quản lý kết nối với Gemini API
let circuitBreakerState = {
  isOpen: false,
  failureCount: 0,
  lastFailureTime: 0,
  threshold: 5, // số lần thất bại trước khi mở mạch
  timeout: 300000, // thời gian mở mạch (5 phút)
};

// kiểm tra xem circuit breaker có nên mở hay không
const shouldOpenCircuit = (): boolean => {
  return circuitBreakerState.failureCount >= circuitBreakerState.threshold;
};

// kiểm tra xem circuit breaker có nên đóng lại hay không
const shouldCloseCircuit = (): boolean => {
  const now = Date.now();
  return (
    circuitBreakerState.isOpen &&
    now - circuitBreakerState.lastFailureTime > circuitBreakerState.timeout
  );
};

// đây là hàm để ghi nhận thất bại cho circuit breaker
const recordFailure = (): void => {
  circuitBreakerState.failureCount++;
  circuitBreakerState.lastFailureTime = Date.now();

  if (shouldOpenCircuit()) {
    circuitBreakerState.isOpen = true;
    console.warn(
      `🔴 Circuit breaker opened - API calls suspended for ${
        circuitBreakerState.timeout / 1000
      } seconds`
    );
  }
};

// đây là hàm để ghi nhận thành công cho circuit breaker
const recordSuccess = (): void => {
  if (circuitBreakerState.isOpen || circuitBreakerState.failureCount > 0) {
    console.log("✅ Circuit breaker reset - API connection restored");
  }
  circuitBreakerState.failureCount = 0;
  circuitBreakerState.isOpen = false;
};

// cấu hình retry logic
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

// Hàm sleep để delay giữa các lần thử lại
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// kiểm tra xem lỗi có phải là lỗi có thể thử lại hay không
const isRetryableError = (error: any): boolean => {
  if (!error) return false;

  // Check for 503 Service Unavailable
  if (error.status === 503) return true;

  // Check for other retryable errors
  if (error.status === 429) return true; // Rate limit
  if (error.status === 502) return true; // Bad Gateway
  if (error.status === 504) return true; // Gateway Timeout

  // Check error messages
  const errorMessage = error.message?.toLowerCase() || "";
  return (
    errorMessage.includes("overloaded") ||
    errorMessage.includes("unavailable") ||
    errorMessage.includes("timeout")
  );
};

// Hàm tính toán độ trễ giữa các lần thử lại
const calculateDelay = (attempt: number): number => {
  const delay =
    RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
};

// Hàm chính để tạo nội dung với cơ chế retry và circuit breaker
const generateContentWithRetry = async (prompt: string): Promise<string> => {
  // Check circuit breaker state
  if (shouldCloseCircuit()) {
    circuitBreakerState.isOpen = false;
    circuitBreakerState.failureCount = 0;
  }

  // If circuit breaker is open, return fallback immediately
  if (circuitBreakerState.isOpen) {
    console.log("⚡ Circuit breaker is open - returning fallback response");
    return getFallbackResponse({ message: "Circuit breaker open" });
  }

  let lastError: any;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Record success
      recordSuccess();
      return text;
    } catch (error: any) {
      lastError = error;
      console.error(
        `Gemini API error (attempt ${attempt + 1}/${
          RETRY_CONFIG.maxRetries + 1
        }):`,
        error
      );

      // If this is the last attempt or error is not retryable, break
      if (attempt === RETRY_CONFIG.maxRetries || !isRetryableError(error)) {
        break;
      }

      // Calculate delay and wait before retry
      const delay = calculateDelay(attempt);
      console.log(`Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  // Record failure for circuit breaker
  recordFailure();

  // If all retries failed, provide fallback response
  return getFallbackResponse(lastError);
};

// Hàm để lấy phản hồi dự phòng khi AI service không khả dụng
const getFallbackResponse = (error: any): string => {
  const isVietnamese = error?.message?.includes("Không thể") || true; // Default to Vietnamese

  if (isVietnamese) {
    return `Xin lỗi, dịch vụ AI tạm thời không khả dụng do quá tải. Vui lòng thử lại sau vài phút.

**Trong thời gian chờ đợi, bạn có thể:**
- Kiểm tra trạng thái hệ thống báo cháy qua giao diện chính
- Xem lại các cài đặt và cấu hình hiện tại
- Liên hệ bộ phận kỹ thuật nếu có sự cố khẩn cấp

**Số điện thoại khẩn cấp PCCC: 114**

Cảm ơn bạn đã thông cảm!`;
  } else {
    return `Sorry, the AI service is temporarily unavailable due to high traffic. Please try again in a few minutes.

**In the meantime, you can:**
- Check the fire alarm system status through the main interface
- Review current settings and configurations
- Contact technical support for emergency issues

**Emergency Fire Department: 114**

Thank you for your understanding!`;
  }
};

// Hàm để lấy trạng thái sức khỏe của API
export const getAPIHealthStatus = (): object => {
  return {
    isHealthy: !circuitBreakerState.isOpen,
    circuitBreakerStatus: {
      isOpen: circuitBreakerState.isOpen,
      failureCount: circuitBreakerState.failureCount,
      lastFailureTime: circuitBreakerState.lastFailureTime,
      timeUntilReset: circuitBreakerState.isOpen
        ? Math.max(
            0,
            circuitBreakerState.timeout -
              (Date.now() - circuitBreakerState.lastFailureTime)
          )
        : 0,
    },
    message: circuitBreakerState.isOpen
      ? "Gemini API is temporarily unavailable - Circuit breaker is open"
      : "Gemini API is available",
  };
};

// Hàm để kiểm tra kết nối với API
export const testAPIConnection = async (): Promise<boolean> => {
  try {
    const testPrompt = "Hello, respond with just 'OK' if you can hear me.";
    const response = await generateContentWithRetry(testPrompt);
    return response.toLowerCase().includes("ok");
  } catch (error) {
    console.error("API connectivity test failed:", error);
    return false;
  }
};

// Hàm lấy dữ liệu thực từ database
const getSystemData = async () => {
  try {
    // Lấy thông tin panels
    const panels = await PanelModel.find({})
      .select(
        "name panel_type status location loops_supported ram_usage cpu_usage"
      )
      .lean();

    // Lấy thông tin volume settings của tủ trung tâm
    const volumes = await VolumeModel.find({})
      .populate("panelId", "name")
      .select("panelId level updatedAt")
      .lean();

    //Lấy thêm các thông tin về hẹn giờ
    const times = await TimeModel.find({})
      .populate("panelId", "name")
      .select("panelId time name repeat isEnabled ")
      .lean();

    return {
      panels: panels || [],
      volumes: volumes || [],
      times: times || [],
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu hệ thống:", error);
    return {
      panels: [],
      volumes: [],
      lastUpdated: new Date().toISOString(),
      error: "Không thể lấy dữ liệu từ hệ thống",
    };
  }
};

// hàm này dùng để tạo phản hồi từ AI dựa trên prompt(câu hỏi) và context (nếu có).
export const generateResponse = async (
  prompt: string,
  context?: string
): Promise<string> => {
  try {
    const fullPrompt = context
      ? `Context: ${context}\n\nQuestion: ${prompt}`
      : prompt;

    return await generateContentWithRetry(fullPrompt);
  } catch (error) {
    console.error("Gemini API error:", error);
    // Return fallback response instead of throwing error
    return getFallbackResponse(error);
  }
};

// Hàm này dùng để tạo phản hồi từ AI cho các câu hỏi liên quan đến hệ thống báo cháy và an toàn phòng cháy chữa cháy.
export const generateFireSafetyResponse = async (
  userMessage: string,
  conversationHistory?: any[]
): Promise<string> => {
  // Lấy dữ liệu thực từ hệ thống
  const systemData = await getSystemData();

  let systemPrompt = `
    Bạn là một trợ lý AI chuyên về quản lý hệ thống báo cháy và an toàn phòng cháy chữa cháy.

     **THÔNG TIN HỆ THỐNG HIỆN TẠI (Dữ liệu thực từ database):**
    
    **Danh sách Panels, tủ báo cháy hiện có:**
    ${systemData.panels
      .map(
        (panel) =>
          `- Panel: ${panel.name} 
         - Loại: ${panel.panel_type}
         - Trạng thái: ${panel.status || "Không xác định"}
         - Số lượng loop hỗ trợ: ${panel.loops_supported || "Không xác định"}
         - Sử dụng tài nguyên, tiêu thụ RAM: ${
           panel.ram_usage || "Không xác định"
         }%     
         - Sử dụng tài nguyên, tiêu thụ CPU: ${
           panel.cpu_usage || "Không xác định"
         }%    
         - Vị trí: ${panel.location || "Chưa xác định"}`
      )
      .join("\n")}

    **Danh sách hẹn giờ hiện có:**
    ${
      (systemData.times ?? []).length > 0
        ? (systemData.times ?? [])
            .map(
              (time) =>
                `- Tên: ${time.name} 
             - Giờ: ${time.time || "Không xác định"}
             - Lặp lại: ${
               time.repeat.length > 0 ? time.repeat.join(", ") : "Không"
             }
             - Trạng thái: ${time.isEnabled ? "Bật" : "Tắt"}`
            )
            .join("\n")
        : "- Chưa có hẹn giờ nào"
    }

    **Cài đặt âm lượng hiện có của hệ thống :**
    ${
      systemData.volumes.length > 0
        ? systemData.volumes
            .map(
              (vol) =>
                `- Mức âm lượng: ${vol.level}%
             - Cập nhật lần cuối: ${vol.updatedAt || "Không xác định"}`
            )
            .join("\n")
        : "- Chưa có cài đặt âm lượng nào"
    }
    
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
      .map((msg: any) => `${msg.role}: ${msg.content}`)
      .join("\n");
    systemPrompt += `\n\nLịch sử hội thoại gần đây:\n${recentHistory}`;
  }

  return generateResponse(userMessage, systemPrompt);
};

// Hàm này dùng để tạo các gợi ý nhanh cho người dùng
export const generateQuickSuggestions = async (): Promise<string[]> => {
  return [
    "Danh sách các tủ báo cháy hiện có?",
    "Mức âm lượng hiện tại của hệ thống?",
    "Danh sách các hẹn giờ đã được cấu hình?",
  ];
};
