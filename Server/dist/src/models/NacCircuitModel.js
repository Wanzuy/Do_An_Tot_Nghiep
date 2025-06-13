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
const nacCircuitSchema = new mongoose_1.Schema({
    nacBoardId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "nacboards",
        required: true,
    },
    zoneId: {
        // Liên kết đến Phân vùng (Zone) mà mạch này phục vụ
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "zones",
    },
    name: {
        type: String,
        trim: true,
    },
    circuit_number: {
        // Số thứ tự mạch trên bo mạch (ví dụ: 1, 2)
        type: Number,
        required: true,
    },
    is_active: {
        // Trạng thái hoạt động của mạch
        type: Boolean,
        default: true,
    },
    status: {
        // Trạng thái hiện tại (Normal(Bình thường), Active(Đang hoạt động), Fault(Có lỗi), Disabled(Vô hiệu hóa))
        type: String,
        enum: ["Normal", "Active", "Fault", "Disabled"],
        default: "Normal",
    },
    output_type: {
        // Loại thiết bị đầu ra (Audible - Chuong, Visual - Den, etc.) - Đã sửa tên trường
        type: String,
        enum: ["Audible", "Visual", "Relay", "Other"],
        default: "Audible",
    },
}, {
    timestamps: true,
});
// Index để đảm bảo circuit_number là duy nhất trong mỗi bo mạch
nacCircuitSchema.index({ nacBoardId: 1, circuit_number: 1 }, { unique: true });
// Index cho zoneId để query theo zone hiệu quả
nacCircuitSchema.index({ zoneId: 1 });
// Index cho status để query nhanh các mạch đang active/fault
nacCircuitSchema.index({ status: 1 });
// Đã sửa tên collection thành 'naccircuits' (số nhiều, chữ thường)
const NacCircuitModel = mongoose_1.default.model("naccircuits", nacCircuitSchema);
exports.default = NacCircuitModel;
//# sourceMappingURL=NacCircuitModel.js.map