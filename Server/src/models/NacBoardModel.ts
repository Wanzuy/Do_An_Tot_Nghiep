import mongoose, { Schema } from "mongoose";

const nacBoardSchema = new Schema(
    {
        panelId: {
            // LIÊN KẾT đến Tủ vật lý chứa bo mạch này
            type: Schema.Types.ObjectId,
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
            // Trạng thái hiện tại của bo mạch (Normal, Fault, Offline) - Giả lập
            type: String,
            enum: ["Normal", "Fault", "Offline"],
            default: "Normal",
        },
    },
    {
        timestamps: true,
    }
);

// Unique index kết hợp: Tên bo mạch phải là duy nhất bên trong cùng một Tủ
nacBoardSchema.index({ panelId: 1, name: 1 }, { unique: true });
// Index cho panelId để truy vấn nhanh các board trong 1 tủ
nacBoardSchema.index({ panelId: 1 });

const NacBoardModel = mongoose.model("nacboards", nacBoardSchema);
export default NacBoardModel;
