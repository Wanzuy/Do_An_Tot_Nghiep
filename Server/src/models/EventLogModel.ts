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
            // Loại sự kiện (ví dụ: 'Alarm' (báo động), 'Fault' (lỗi), 'Restore' (khôi phục), 'Activation' (kích hoạt), 'Deactivation' (vô hiệu hóa), 'StatusChange' (thay đổi trạng thái), 'ConfigChange' (thay đổi cấu hình))
            type: String,
            required: true,
            enum: [
                "Fire Alarm",
                "Fault",
                "Restore",
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
            // ID của nguồn cụ thể (liên kết tới document Detector, NacCircuit, Panel, User tương ứng)
            // Lưu ý: Vì source_type có thể khác nhau, chúng ta không dùng ref cố định ở đây.
            // Bạn sẽ dùng source_type để biết nên populate từ collection nào nếu cần.
            type: Schema.Types.ObjectId,
            // ref: (doc) => doc.source_type, // Mongoose có thể hỗ trợ ref động, nhưng query/populate phức tạp hơn.
            // Để đơn giản cho đồ án, chỉ lưu ID và dùng source_type khi cần populate thủ công hoặc xử lý ở code.
            required: false, // Có thể không có ID nếu source_type là 'System' chung chung
        },
        zoneId: {
            // Liên kết đến Zone liên quan đến sự kiện (ví dụ: zone của detector báo động)
            type: Schema.Types.ObjectId,
            ref: "zones", // Tham chiếu đến collection 'zones'
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
            ref: "users", // Tham chiếu đến collection 'users' (cần tạo model User sau)
            default: null,
        },
        acknowledged_at: {
            // Thời gian sự kiện được xác nhận (nếu có)
            type: Date,
            default: null,
        },
        details: {
            // Trường tùy chọn để lưu thông tin thêm dạng JSON về sự kiện
            type: mongoose.Schema.Types.Mixed, // Cho phép lưu các kiểu dữ liệu khác nhau (object, array, etc.)
        },
    },
    {
        // Mongoose timestamps sẽ tự động thêm createdAt và updatedAt.
        // Timestamp ở đây khác timestamp trường trên, dùng để biết document log được tạo/cập nhật khi nào trong DB.
        // Trường timestamp trên là thời điểm sự kiện THỰC TẾ xảy ra.
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
