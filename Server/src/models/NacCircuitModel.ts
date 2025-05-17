import mongoose, { Schema } from "mongoose";

const nacCircuitSchema = new Schema(
    {
        nacBoardId: {
            // Liên kết đến bo mạch NAC chứa mạch này
            type: Schema.Types.ObjectId,
            ref: "nacboards", // Tham chiếu đến collection 'nacboards'
            required: true,
        },
        circuit_number: {
            // Số thứ tự mạch trên bo mạch (ví dụ: 1, 2)
            type: Number,
            required: true,
        },
        description: {
            // Mô tả mạch, ví dụ: Chuong bao dong Tang 1, Den bao chay hanh lang
            type: String,
            trim: true,
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
            enum: ["Audible", "Visual", "Audible/Visual", "Relay", "Other"],
            default: "Audible/Visual",
        },
        zoneId: {
            // Liên kết đến Phân vùng (Zone) mà mạch này phục vụ
            type: Schema.Types.ObjectId,
            ref: "zones", // Đã sửa ref thành "zones"
            required: true,
        },
        // Có thể thêm trường volume nếu điều chỉnh âm lượng theo mạch
        // volume: { type: Number, min: 0, max: 100, default: 50 }
    },
    {
        timestamps: true,
    }
);

// Index để đảm bảo circuit_number là duy nhất trong mỗi bo mạch
nacCircuitSchema.index({ nacBoardId: 1, circuit_number: 1 }, { unique: true });
// Index cho zoneId để query theo zone hiệu quả
nacCircuitSchema.index({ zoneId: 1 });
// Index cho status để query nhanh các mạch đang active/fault
nacCircuitSchema.index({ status: 1 });

// Đã sửa tên collection thành 'naccircuits' (số nhiều, chữ thường)
const NacCircuitModel = mongoose.model("naccircuits", nacCircuitSchema);
export default NacCircuitModel;
