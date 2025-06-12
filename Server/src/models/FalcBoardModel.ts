import mongoose, { Schema } from "mongoose";

const falcBoardSchema = new Schema(
  {
    panelId: {
      // LIÊN KẾT đến Tủ vật lý chứa bo mạch này
      type: Schema.Types.ObjectId,
      ref: "panels",
      required: true,
    },
    name: {
      // Tên bo mạch, ví dụ: falc01
      type: String,
      required: true,
      trim: true,
    },
    description: {
      // Ghi chú về vị trí hoặc mục đích, ví dụ: PCB 2F
      type: String,
      trim: true,
    },
    is_active: {
      // Trạng thái hoạt động (được cấu hình sử dụng hay không)
      type: Boolean,
      default: true,
    },
    status: {
      // Trạng thái hiện tại của bo mạch (Normal (Bo mạch đang hoạt động bình thường, không có lỗi),
      // Fault(Bo mạch đang gặp sự cố hoặc lỗi), Offline (bo mạch không kết nối được với hệ thống, có thể do mất điện, đứt kết nối, hoặc bị tắt)) - Giả lập
      type: String,
      enum: ["Normal", "Fault", "Offline"],
      default: "Normal",
    },
    number_of_detectors: {
      // Trường để lưu SỐ LƯỢNG THIẾT BỊ TỐI ĐA MÀ BO MẠCH NÀY HỖ TRỢ
      // Ý nghĩa: Bo mạch này hỗ trợ tối đa bao nhiêu thiết bị địa chỉ
      type: Number,
      required: true,
      min: 1,
      max: 200,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index kết hợp: Tên bo mạch phải là duy nhất bên trong cùng một Tủ
falcBoardSchema.index({ panelId: 1, name: 1 }, { unique: true });
// Index cho panelId để truy vấn nhanh các board trong 1 tủ
falcBoardSchema.index({ panelId: 1 });

const FalcBoardModel = mongoose.model("falcboards", falcBoardSchema);
export default FalcBoardModel;
