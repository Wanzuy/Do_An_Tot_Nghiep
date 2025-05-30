"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAccounts = exports.updateAccount = exports.deleteAccount = exports.resetPassword = exports.login = exports.createAccount = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const UserModel_1 = __importDefault(require("../models/UserModel"));
const getAccesstoken_1 = require("../utils/getAccesstoken");
const password_1 = require("../utils/password");
//tạo tài khoản mới
const createAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const user = req.user;
    if (user.role !== 1) {
        return res.status(403).json({
            message: "Bạn không có quyền truy cập vào chức năng này!",
        });
    }
    const { accountname, password } = body;
    try {
        const user = yield UserModel_1.default.findOne({ accountname: accountname });
        if (user) {
            return res
                .status(409)
                .json({ message: "Tài khoản đã tồn tại trong hệ thống!" });
        }
        if (!(0, password_1.isValidPassword)(password)) {
            return res.status(400).json({
                message: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
            });
        }
        body.password = yield (0, password_1.hashPassword)(password);
        const newUser = new UserModel_1.default(body);
        yield newUser.save();
        delete newUser._doc.password;
        return res
            .status(201)
            .json({ message: "Tạo tài khoản thành công", data: newUser });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.createAccount = createAccount;
// cập nhật tài khoản
const updateAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const adminUser = req.user;
    const updateData = req.body;
    try {
        // kiểm tra xem phải admin không
        if (adminUser.role !== 1) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập vào chức năng này!",
            });
        }
        // kiểm tra xem userId có hợp lệ không
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "ID người dùng không hợp lệ!",
            });
        }
        // kiểm tra xem tài khoản có tồn tại không
        const userToUpdate = yield UserModel_1.default.findById(userId);
        if (!userToUpdate) {
            return res.status(404).json({
                message: "Không tìm thấy tài khoản này trong hệ thống!",
            });
        }
        // Không cho phép cập nhật trường accountname qua API này
        if (updateData.accountname) {
            delete updateData.accountname;
            return res.status(400).json({
                message: "Không được phép cập nhật tên tài khoản qua API này!",
            });
        }
        // Kiểm tra và xử lý password nếu được cung cấp
        if (updateData.password) {
            // Kiểm tra độ mạnh của mật khẩu
            if (!(0, password_1.isValidPassword)(updateData.password)) {
                return res.status(400).json({
                    message: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
                });
            }
            // Mã hóa mật khẩu trước khi lưu
            updateData.password = yield (0, password_1.hashPassword)(updateData.password);
        }
        // Cập nhật thời gian updatedAt
        updateData.updatedAt = new Date();
        // Cập nhật thông tin user
        const updatedUser = yield UserModel_1.default.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select("-password");
        return res.status(200).json({
            message: "Cập nhật tài khoản thành công!",
            data: updatedUser,
        });
    }
    catch (error) {
        console.error("Error updating account:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateAccount = updateAccount;
// xóa tài khoản
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const adminUser = req.user;
    try {
        // Kiểm tra quyền admin
        if (adminUser.role !== 1) {
            return res.status(403).json({
                message: "Bạn không có quyền xóa tài khoản người dùng!",
            });
        }
        // Kiểm tra và đảm bảo userId là ObjectId hợp lệ
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "ID người dùng không hợp lệ!",
            });
        }
        // Kiểm tra user cần xóa có tồn tại không
        const userToDelete = yield UserModel_1.default.findById(userId);
        if (!userToDelete) {
            return res.status(404).json({
                message: "Không tìm thấy tài khoản này trong hệ thống!",
            });
        }
        // Không cho phép admin tự xóa tài khoản của mình
        if (adminUser._id.toString() === userId) {
            return res.status(400).json({
                message: "Không thể xóa tài khoản admin!",
            });
        }
        // Xóa hoàn toàn tài khoản từ cơ sở dữ liệu
        yield UserModel_1.default.findByIdAndDelete(userId);
        return res.status(200).json({
            message: "Đã xóa tài khoản thành công!",
        });
    }
    catch (error) {
        console.error("Error deleting account:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.deleteAccount = deleteAccount;
// lấy tất cả tài khoản
const getAllAccounts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminUser = req.user;
    try {
        // Kiểm tra quyền admin
        if (adminUser.role !== 1) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập vào chức năng này!",
            });
        }
        // Lấy tất cả tài khoản từ cơ sở dữ liệu
        const users = yield UserModel_1.default.find({}).select("-password");
        if (!users || users.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy tài khoản nào trong hệ thống!",
            });
        }
        return res.status(200).json({
            message: "Lấy danh sách tài khoản thành công!",
            data: users,
        });
    }
    catch (error) {
        console.error("Error getting all accounts:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAllAccounts = getAllAccounts;
// đăng nhập
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { accountname, password } = req.body;
    try {
        const user = yield UserModel_1.default.findOne({
            accountname: accountname,
            status: true,
        });
        if (!user) {
            return res.status(401).json({
                message: "Tài khoản không tồn tại hoặc đã bị vô hiệu hóa!",
            });
        }
        const isPasswordValid = yield (0, password_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            return res
                .status(401)
                .json({ message: "Tài khoản hoặc mật khẩu không chính xác!" });
        }
        delete user._doc.password;
        user._doc.token = yield (0, getAccesstoken_1.getAccesstoken)({
            _id: user._id,
            accountname: user.accountname,
            role: user.role,
        });
        res.status(200).json({
            message: "Đăng nhập thành công!",
            data: user,
        });
    }
    catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.login = login;
// Đặt lại mật khẩu (chỉ admin)
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { newPassword } = req.body;
    const adminUser = req.user;
    try {
        // Kiểm tra quyền admin
        if (adminUser.role !== 1) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập vào chức năng này!",
            });
        }
        // Kiểm tra user cần đặt lại mật khẩu có tồn tại không
        const userToReset = yield UserModel_1.default.findById(userId);
        if (!userToReset) {
            return res.status(404).json({
                message: "Không tìm thấy tài khoản này trong hệ thống!",
            });
        }
        // Kiểm tra độ mạnh của mật khẩu mới
        if (!(0, password_1.isValidPassword)(newPassword)) {
            return res.status(400).json({
                message: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
            });
        }
        // Mã hóa mật khẩu mới
        const hashedPassword = yield (0, password_1.hashPassword)(newPassword);
        // Cập nhật mật khẩu và thời gian cập nhật
        yield UserModel_1.default.findByIdAndUpdate(userId, {
            password: hashedPassword,
            updatedAt: new Date(),
        });
        return res.status(200).json({
            message: "Đặt lại mật khẩu thành công!",
        });
    }
    catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.resetPassword = resetPassword;
//# sourceMappingURL=AuthController.js.map