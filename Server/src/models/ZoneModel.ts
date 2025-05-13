import mongoose, { Schema } from "mongoose";

const zoneSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        parentId: {
            type: Schema.Types.ObjectId,
            ref: "zones",
            default: null,
        },
        description: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

// Tạo index cho parentId để query hiệu quả các zone con
zoneSchema.index({ parentId: 1 });
const ZoneModel = mongoose.model("zones", zoneSchema);
export default ZoneModel;
