import mongoose, { Schema } from "mongoose";

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
  },
  {
    timestamps: true,
  }
);

panelSchema.index({ panel_type: 1 });
panelSchema.index({ main_panel_id: 1 });

const PanelModel = mongoose.model("panels", panelSchema);
export default PanelModel;
