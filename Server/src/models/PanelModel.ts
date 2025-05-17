const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const panelSchema = new Schema(
    {
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
            type: Schema.Types.ObjectId,
            ref: "panels",
            default: null,
        },
        status: {
            type: String,
            enum: ["Online", "Offline", "Fault"],
            default: "Online",
        },
    },
    {
        timestamps: true,
    }
);

panelSchema.index({ panel_type: 1 });
panelSchema.index({ main_panel_id: 1 });

const PanelModel = mongoose.model("panels", panelSchema);
export default PanelModel;
