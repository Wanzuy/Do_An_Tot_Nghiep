import UserModel from "../models/UserModel";
import { hashPassword, isValidPassword } from "../utils/password";

//tạo tài khoản mới
const createAccount = async (req: any, res: any) => {
    const body = req.body;
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
const login = async (req: any, res: any) => {};

export { createAccount };
