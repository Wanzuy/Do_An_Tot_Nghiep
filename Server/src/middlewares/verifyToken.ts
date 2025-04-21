import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const verifyToken = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const header = req.headers.authorization;
        if (!header) {
            res.status(401).json({
                error: "Không có token, truy cập bị từ chối!",
            });
            return;
        }

        const parts = header.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            res.status(401).json({ error: "Token không đúng định dạng!" });
            return;
        }

        const accessToken = parts[1];

        jwt.verify(
            accessToken,
            process.env.SECRET_KEY as string,
            (err, decoded) => {
                if (err) {
                    res.status(401).json({ error: "Token không hợp lệ!" });
                    return;
                }
                // Gán thông tin người dùng vào req.user
                (req as any).user = decoded;
                next(); // Tiếp tục xử lý nếu token hợp lệ
            }
        );
    } catch (error: any) {
        res.status(401).json({ error: error.message });
        return;
    }
};
