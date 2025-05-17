import mongoose, { Schema } from "mongoose";
const detectorSchema = new Schema(
    {
        falcBoardId: {
            // Liên kết đến vòng lặp mà đầu báo này thuộc về
            type: Schema.Types.ObjectId,
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
        description: {
            // Mô tả vị trí cụ thể, ví dụ: Trần phòng 201A, canh cua ra vao
            type: String,
            trim: true,
        },
        detector_type: {
            // Loại đầu báo (Smoke (Khói), Heat (Nhiệt), Manual Call Point (Gọi khẩn cấp), Gas (Khí gas), Other (Khác))
            type: String,
            enum: ["Smoke", "Heat", "Manual Call Point", "Gas", "Other"],
            required: true,
        },
        zoneId: {
            // Liên kết đến Phân vùng (Zone) mà đầu báo này thuộc về
            type: Schema.Types.ObjectId,
            ref: "zones",
            required: true,
        },
        status: {
            // Trạng thái hiện tại (Normal (Đầu báo đang hoạt động bình thường, không có lỗi), Alarm (Đầu báo phát hiện sự cố, cảnh báo), Fault (Đầu báo gặp sự cố hoặc lỗi, nhưng vẫn có kết nối), Disabled (Đầu báo bị tắt hoặc không hoạt động))
            type: String,
            enum: ["Normal", "Alarm", "Fault", "Disabled"],
            default: "Normal",
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
        is_active: {
            // Trạng thái hoạt động (được cấu hình sử dụng hay không)
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true, // Tự động thêm createdAt và updatedAt
    }
);

// Index và unique constraint: Địa chỉ đầu báo phải là duy nhất trong một Vòng Lặp CỤ THỂ trên một Bo mạch CỤ THỂ.
detectorSchema.index(
    { falcBoardId: 1, loop_number: 1, detector_address: 1 },
    { unique: true }
);
detectorSchema.index({ zoneId: 1 });
detectorSchema.index({ status: 1 });

const DetectorModel = mongoose.model("detectors", detectorSchema);
export default DetectorModel;
