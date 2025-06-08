import mongoose, { Schema } from "mongoose";

const timeSchema = new Schema(
    {
        panelId: {
            type: Schema.Types.ObjectId,
            ref: "panels",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        time: {
            type: Date,
            required: true,
        },
        repeat: {
            type: [String],
            enum: [
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
            ],
            default: [],
        },
        audioFile: {
            type: String,
            required: true,
        },
        isEnabled: {
            type: Boolean,
            default: true,
        },
        description: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Unique index: Tên thời gian phải là duy nhất bên trong cùng một Tủ
timeSchema.index({ panelId: 1, name: 1 }, { unique: true });
// Index cho panelId để truy vấn nhanh các thời gian trong 1 tủ
timeSchema.index({ panelId: 1 });

const TimeModel = mongoose.model("times", timeSchema);
export default TimeModel;
