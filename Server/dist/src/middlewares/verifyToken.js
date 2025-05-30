"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
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
        jsonwebtoken_1.default.verify(accessToken, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                res.status(401).json({ error: "Token không hợp lệ!" });
                return;
            }
            // Gán thông tin người dùng vào req.user
            req.user = decoded;
            next(); // Tiếp tục xử lý nếu token hợp lệ
        });
    }
    catch (error) {
        res.status(401).json({ error: error.message });
        return;
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=verifyToken.js.map