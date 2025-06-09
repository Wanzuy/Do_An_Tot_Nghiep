import mongoose, { Document, Schema } from "mongoose";

export interface IMessage {
    role: "user" | "bot";
    content: string;
    timestamp: Date;
}

export interface IChatHistory extends Document {
    userId: Schema.Types.ObjectId;
    messages: IMessage[];
    sessionId: string;
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
    role: {
        type: String,
        enum: ["user", "bot"],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const chatHistorySchema = new Schema<IChatHistory>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        messages: [messageSchema],
        sessionId: {
            type: String,
            required: true,
            default: () => new mongoose.Types.ObjectId().toString(),
        },
    },
    {
        timestamps: true,
    }
);

// Index để tìm kiếm nhanh theo userId và sessionId
chatHistorySchema.index({ userId: 1, sessionId: 1 });
chatHistorySchema.index({ updatedAt: -1 });

export default mongoose.model<IChatHistory>(
    "chat_histories",
    chatHistorySchema
);
