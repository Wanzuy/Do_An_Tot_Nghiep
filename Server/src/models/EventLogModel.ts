import mongoose, { Schema } from "mongoose";

const eventLogSchema = new Schema(
    {
        timestamp: {
            // Thời điểm chính xác khi sự kiện xảy ra
            type: Date,
            required: true,
            default: Date.now,
        },
        event_type: {
            // Loại sự kiện (ví dụ: 'Fire Alarm' (báo động), 'Fault' (lỗi), 'Restore' (khôi phục), 'Activation' (kích hoạt), 'Deactivation' (vô hiệu hóa), 'StatusChange' (thay đổi trạng thái), 'ConfigChange' (thay đổi cấu hình))
            type: String,
            required: true,
            enum: [
                "Fire Alarm",
                "Fault",
                "Restore",
                "Offline",
                "Activation",
                "Deactivation",
                "StatusChange",
                "ConfigChange",
            ],
        },
        description: {
            // Mô tả chi tiết về sự kiện
            type: String,
            required: true,
            trim: true,
        },
        source_type: {
            // Loại nguồn gây ra sự kiện hoặc liên quan đến sự kiện (ví dụ: 'Detector', 'NAC')
            type: String,
            required: true,
            enum: ["Detector", "NAC", "Panel"],
        },
        source_id: {
            type: Schema.Types.ObjectId,
            required: false, // Có thể không có ID nếu source_type là 'System' chung chung
        },
        zoneId: {
            // Liên kết đến Zone liên quan đến sự kiện (ví dụ: zone của detector báo động)
            type: Schema.Types.ObjectId,
            ref: "zones",
            required: false, // Không phải mọi sự kiện đều liên quan đến một zone cụ thể
        },
        panelId: {
            // Liên kết đến Panel liên quan (ví dụ: panel chứa detector báo động)
            type: Schema.Types.ObjectId,
            ref: "panels", // Tham chiếu đến collection 'panels'
            required: false, // Không phải mọi sự kiện đều liên quan đến một panel cụ thể
        },
        status: {
            // Trạng thái của bản ghi sự kiện (ví dụ: 'Active' cho báo động/lỗi chưa xử lý, 'Cleared' cho đã xử lý)
            type: String,
            enum: ["Active", "Cleared", "Info"], // Active (cần xử lý), Cleared (đã xử lý), Info (thông tin không cần xử lý)
            default: "Info", // Mặc định là thông tin
        },
        acknowledged_by_user_id: {
            // ID của người dùng đã xác nhận sự kiện (nếu có)
            type: Schema.Types.ObjectId,
            ref: "users",
            default: null,
        },
        acknowledged_at: {
            // Thời gian sự kiện được xác nhận (nếu có)
            type: Date,
            default: null,
        },
        details: {
            type: mongoose.Schema.Types.Mixed, // Cho phép lưu các kiểu dữ liệu khác nhau (object, array, etc.)
        },
    },
    {
        timestamps: true,
    }
);

// Index cho các trường thường dùng để lọc và sắp xếp log
eventLogSchema.index({ timestamp: -1 }); // Sắp xếp theo thời gian giảm dần (mới nhất trước)
eventLogSchema.index({ event_type: 1, status: 1 }); // Lọc theo loại và trạng thái
eventLogSchema.index({ zoneId: 1 }); // Lọc theo zone
eventLogSchema.index({ panelId: 1 }); // Lọc theo panel
eventLogSchema.index({ source_type: 1, source_id: 1 }); // Lọc theo nguồn

const EventLogModel = mongoose.model("eventlogs", eventLogSchema);

export default EventLogModel;
