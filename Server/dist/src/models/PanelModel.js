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
const panelSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    panel_type: {
        type: String,
        // Loại bảng điều khiển,  Control Panel(Tủ điều khiển chính), Sub Panel (Tủ điều khiển phụ hoặc Tủ điều khiển địa chỉ)
        enum: ["Control Panel", "Sub Panel"],
        required: true,
    },
    location: {
        type: String,
        trim: true,
    },
    ip_address: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
    },
    subnet_mask: {
        // Subnet Mask của tủ
        type: String,
        trim: true,
        // Có thể thêm regex validation
    },
    default_gateway: {
        // Default Gateway của tủ
        type: String,
        trim: true,
        // Có thể thêm regex validation
    },
    main_panel_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "panels",
        default: null,
    },
    status: {
        type: String,
        enum: ["Online", "Offline", "Fault"],
        default: "Online",
    },
    loops_supported: {
        // Số lượng loop mà panel này hỗ trợ
        type: Number,
        min: 0,
        default: 0,
    },
    ram_usage: {
        // Phần trăm RAM đang sử dụng (0-100%)
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    cpu_usage: {
        // Phần trăm CPU đang sử dụng (0-100%)
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
}, {
    timestamps: true,
});
panelSchema.index({ panel_type: 1 });
panelSchema.index({ main_panel_id: 1 });
const PanelModel = mongoose_1.default.model("panels", panelSchema);
exports.default = PanelModel;
//# sourceMappingURL=PanelModel.js.map