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
const detectorSchema = new mongoose_1.Schema({
    falcBoardId: {
        // Liên kết đến vòng lặp mà đầu báo này thuộc về
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "falcboards",
        required: true,
    },
    loop_number: {
        // Số thứ tự vòng lặp MÀ đầu báo này thuộc về TRÊN BO MẠCH đó
        type: Number,
        required: true,
    },
    detector_address: {
        // Địa chỉ của đầu báo trên vòng lặp (quan trọng với hệ thống địa chỉ)
        type: String,
        required: true,
        // unique: true, // Có thể unique trong toàn hệ thống hoặc chỉ trong loop tùy kiến trúc
    },
    name: {
        // Tên gợi nhớ cho đầu báo, ví dụ: Dau bao khoi p.201A
        type: String,
        trim: true,
    },
    detector_type: {
        // Loại đầu báo (Smoke (Khói), Heat (Nhiệt), Gas (Khí gas))
        type: String,
        enum: ["Smoke", "Heat", "Gas"],
        required: true,
    },
    zoneId: {
        // Liên kết đến Phân vùng (Zone) mà đầu báo này thuộc về
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "zones",
        required: true,
    },
    status: {
        // Trạng thái hiện tại (Normal (Đầu báo đang hoạt động bình thường, không có lỗi), Alarm (Đầu báo phát hiện sự cố, cảnh báo), Fault (Đầu báo gặp sự cố hoặc lỗi), Disabled (Đầu báo bị tắt hoặc không hoạt động))
        type: String,
        enum: ["Normal", "Alarm", "Fault", "Disabled"],
        default: "Normal",
    },
    is_active: {
        // Trạng thái hoạt động (được cấu hình sử dụng hay không)
        type: Boolean,
        default: true,
    },
    last_reading: {
        // Giá trị đọc được gần nhất (nếu có, ví dụ mức khói, nhiệt độ) - Giả lập
        type: mongoose_1.default.Schema.Types.Mixed, // Kiểu dữ liệu linh hoạt
    },
    last_reported_at: {
        // Thời gian trạng thái/giá trị được báo cáo lần cuối - Giả lập
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true, // Tự động thêm createdAt và updatedAt
});
// Index và unique constraint: Địa chỉ đầu báo phải là duy nhất trong một Vòng Lặp CỤ THỂ trên một Bo mạch CỤ THỂ.
detectorSchema.index({ falcBoardId: 1, loop_number: 1, detector_address: 1 }, { unique: true });
detectorSchema.index({ zoneId: 1 });
detectorSchema.index({ status: 1 });
const DetectorModel = mongoose_1.default.model("detectors", detectorSchema);
exports.default = DetectorModel;
//# sourceMappingURL=DetectorModel.js.map