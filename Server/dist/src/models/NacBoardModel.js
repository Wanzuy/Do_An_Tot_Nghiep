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
const nacBoardSchema = new mongoose_1.Schema({
    panelId: {
        // LIÊN KẾT đến Tủ vật lý chứa bo mạch này
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "panels",
        required: true,
    },
    name: {
        // Tên bo mạch, ví dụ: nac01
        type: String,
        trim: true,
    },
    description: {
        // Ghi chú về vị trí hoặc mục đích, ví dụ: PCB 1F
        type: String,
        trim: true,
    },
    is_active: {
        // Trạng thái hoạt động
        type: Boolean,
        default: true,
    },
    status: {
        // Trạng thái hiện tại của bo mạch (Normal (Bo mạch đang hoạt động bình thường, không có lỗi), Fault(Bo mạch đang gặp sự cố hoặc lỗi, nhưng vẫn có kết nối), Offline (bo mạch không kết nối được với hệ thống, có thể do mất điện, đứt kết nối, hoặc bị tắt)) - Giả lập
        type: String,
        enum: ["Normal", "Fault", "Offline"],
        default: "Normal",
    },
    circuit_count: {
        // circuit_count để lưu số lượng mạch NAC trên bo mạch này
        type: Number,
        required: true,
        min: 1,
        max: 2,
    },
}, {
    timestamps: true,
});
// Unique index kết hợp: Tên bo mạch phải là duy nhất bên trong cùng một Tủ
nacBoardSchema.index({ panelId: 1, name: 1 }, { unique: true });
// Index cho panelId để truy vấn nhanh các board trong 1 tủ
nacBoardSchema.index({ panelId: 1 });
const NacBoardModel = mongoose_1.default.model("nacboards", nacBoardSchema);
exports.default = NacBoardModel;
//# sourceMappingURL=NacBoardModel.js.map