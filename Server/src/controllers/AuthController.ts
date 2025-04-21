import UserModel from "../models/UserModel";
import { getAccesstoken } from "../utils/getAccesstoken";
import {
    comparePassword,
    hashPassword,
    isValidPassword,
} from "../utils/password";

//tạo tài khoản mới
const createAccount = async (req: any, res: any) => {
    const body = req.body;
    const user = req.user;

    if (user.role !== 1) {
        return res.status(403).json({
            message: "Bạn không có quyền truy cập vào chức năng này!",
        });
    }
    const { accountname, password } = body;
    try {
        const user = await UserModel.findOne({ accountname: accountname });
        if (user) {
            return res
                .status(409)
                .json({ message: "Tài khoản đã tồn tại trong hệ thống!" });
        }
        if (!isValidPassword(password)) {
            return res.status(400).json({
                message:
                    "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
            });
        }

        body.password = await hashPassword(password);
        const newUser = new UserModel(body);
        await newUser.save();
        return res
            .status(201)
            .json({ message: "Tạo tài khoản thành công", data: newUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// đăng nhập
const login = async (req: any, res: any) => {
    const { accountname, password } = req.body;

    try {
        const user: any = await UserModel.findOne({
            accountname: accountname,
            status: true,
        });
        if (!user) {
            return res.status(401).json({ message: "Tài khoản không tồn tại" });
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res
                .status(401)
                .json({ message: "Tài khoản hoặc mật khẩu không chính xác" });
        }

        delete user._doc.password;

        user._doc.token = await getAccesstoken({
            _id: user._id,
            accountname: user.accountname,
            role: user.role,
        });

        res.status(200).json({
            message: "Đăng nhập thành công!",
            data: user,
        });
    } catch (error: any) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Đặt lại mật khẩu (chỉ admin)
const resetPassword = async (req: any, res: any) => {
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
        const userToReset = await UserModel.findById(userId);
        if (!userToReset) {
            return res.status(404).json({
                message: "Không tìm thấy tài khoản này trong hệ thống!",
            });
        }

        // Kiểm tra độ mạnh của mật khẩu mới
        if (!isValidPassword(newPassword)) {
            return res.status(400).json({
                message:
                    "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
            });
        }

        // Mã hóa mật khẩu mới
        const hashedPassword = await hashPassword(newPassword);

        // Cập nhật mật khẩu và thời gian cập nhật
        await UserModel.findByIdAndUpdate(userId, {
            password: hashedPassword,
            updatedAt: new Date(),
        });

        return res.status(200).json({
            message: "Đặt lại mật khẩu thành công!",
        });
    } catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export { createAccount, login, resetPassword };
