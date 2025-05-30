"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const eventLogSchema = new mongoose_1.Schema({
    timestamp: {
        // Thời điểm chính xác khi sự kiện xảy ra
        type: Date,
        required: true,
        default: Date.now,
    },
    event_type: {
        // Loại sự kiện (ví dụ: 'Fire Alarm' (báo động), 'Fault' (lỗi), 'Restore' (khôi phục), 'Activation' (kích hoạt), 'Deactivation' (vô hiệu hóa), 'StatusChange' (thay đổi trạng thái), 'ConfigChange' (thay đổi cấu hình))
        type: String,
        required: true,
        enum: [
            "Fire Alarm",
            "Fault",
            "Restore",
            "Offline",
            "Activation",
            "Deactivation",
            "StatusChange",
            "ConfigChange",
        ],
    },
    description: {
        // Mô tả chi tiết về sự kiện
        type: String,
        required: true,
        trim: true,
    },
    source_type: {
        // Loại nguồn gây ra sự kiện hoặc liên quan đến sự kiện (ví dụ: 'Detector', 'NAC')
        type: String,
        required: true,
        enum: ["Detector", "NAC", "Panel"],
    },
    source_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: false, // Có thể không có ID nếu source_type là 'System' chung chung
    },
    zoneId: {
        // Liên kết đến Zone liên quan đến sự kiện (ví dụ: zone của detector báo động)
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "zones",
        required: false, // Không phải mọi sự kiện đều liên quan đến một zone cụ thể
    },
    panelId: {
        // Liên kết đến Panel liên quan (ví dụ: panel chứa detector báo động)
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "panels", // Tham chiếu đến collection 'panels'
        required: false, // Không phải mọi sự kiện đều liên quan đến một panel cụ thể
    },
    status: {
        // Trạng thái của bản ghi sự kiện (ví dụ: 'Active' cho báo động/lỗi chưa xử lý, 'Cleared' cho đã xử lý)
        type: String,
        enum: ["Active", "Cleared", "Info"], // Active (cần xử lý), Cleared (đã xử lý), Info (thông tin không cần xử lý)
        default: "Info", // Mặc định là thông tin
    },
    acknowledged_by_user_id: {
        // ID của người dùng đã xác nhận sự kiện (nếu có)
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    acknowledged_at: {
        // Thời gian sự kiện được xác nhận (nếu có)
        type: Date,
        default: null,
    },
    details: {
        type: mongoose_1.default.Schema.Types.Mixed, // Cho phép lưu các kiểu dữ liệu khác nhau (object, array, etc.)
    },
}, {
    timestamps: true,
});
// Index cho các trường thường dùng để lọc và sắp xếp log
eventLogSchema.index({ timestamp: -1 }); // Sắp xếp theo thời gian giảm dần (mới nhất trước)
eventLogSchema.index({ event_type: 1, status: 1 }); // Lọc theo loại và trạng thái
eventLogSchema.index({ zoneId: 1 }); // Lọc theo zone
eventLogSchema.index({ panelId: 1 }); // Lọc theo panel
eventLogSchema.index({ source_type: 1, source_id: 1 }); // Lọc theo nguồn
const EventLogModel = mongoose_1.default.model("eventlogs", eventLogSchema);
exports.default = EventLogModel;
//# sourceMappingURL=EventLogModel.js.map