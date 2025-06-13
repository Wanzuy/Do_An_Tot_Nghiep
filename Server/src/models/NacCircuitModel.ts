import mongoose, { Schema } from "mongoose";

const nacCircuitSchema = new Schema(
  {
    nacBoardId: {
      type: Schema.Types.ObjectId,
      ref: "nacboards",
      required: true,
    },
    zoneId: {
      // Liên kết đến Phân vùng (Zone) mà mạch này phục vụ
      type: Schema.Types.ObjectId,
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
