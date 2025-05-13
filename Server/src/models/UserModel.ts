import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    accountname: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 6,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    role: {
        type: Number,
        // 1: quản trị viên, 2: vận hành hệ thống, 3: kỹ thuật viên bảo trì, 4: chưa phân quyền
        enum: [1, 2, 3, 4],
        default: 4,
    },
    showname: {
        // tên hiển thị
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const UserModel = mongoose.model("users", UserSchema);
export default UserModel;
