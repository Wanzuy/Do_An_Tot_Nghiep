import mongoose, { Schema } from "mongoose";

const volumeSchema = new Schema(
    {
        panelId: {
            type: Schema.Types.ObjectId,
            ref: "panels",
            required: true,
            unique: true,
        },
        level: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

const VolumeModel = mongoose.model("volumes", volumeSchema);
export default VolumeModel;
