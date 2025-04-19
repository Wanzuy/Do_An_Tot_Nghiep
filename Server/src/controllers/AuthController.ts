import UserModel from "../models/UserModel";

//tạo tài khoản mới
const createAccount = async (req: any, res: any) => {
    const body = req.body;
    const { accountname } = body;
    try {
        const user = await UserModel.findOne({ accountname: accountname });
        if (user) {
            return res
                .status(409)
                .json({ message: "Tài khoản đã tồn tại trong hệ thống!" });
        }
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

export { createAccount };
