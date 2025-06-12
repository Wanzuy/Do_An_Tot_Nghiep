import mongoose, { Schema } from "mongoose";
const detectorSchema = new Schema(
  {
    falcBoardId: {
      // Liên kết đến bo mạch FALC mà đầu báo này thuộc về
      type: Schema.Types.ObjectId,
      ref: "falcboards",
      required: true,
    },
    detector_address: {
      // Địa chỉ của đầu báo trên bo mạch (quan trọng với hệ thống địa chỉ)
      type: Number,
      required: true,
      min: 1,
      unique: true,
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
      type: Schema.Types.ObjectId,
      ref: "zones",
      default: null,
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
      type: mongoose.Schema.Types.Mixed, // Kiểu dữ liệu linh hoạt
    },
    last_reported_at: {
      // Thời gian trạng thái/giá trị được báo cáo lần cuối - Giả lập
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// Indexes for performance optimization
detectorSchema.index({ falcBoardId: 1 });
detectorSchema.index({ zoneId: 1 });
detectorSchema.index({ status: 1 });

const DetectorModel = mongoose.model("detectors", detectorSchema);
export default DetectorModel;
