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
exports.isValidPassword = exports.passwordRegex = exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const hashPassword = (password_1, ...args_1) => __awaiter(void 0, [password_1, ...args_1], void 0, function* (password, saltRounds = 10) {
    const salt = yield bcrypt_1.default.genSalt(saltRounds);
    return bcrypt_1.default.hash(password, salt);
});
exports.hashPassword = hashPassword;
const comparePassword = (password, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    return bcrypt_1.default.compare(password, hashedPassword);
});
exports.comparePassword = comparePassword;
//regex kiểm tra mật khẩu có ít nhất 1 ký tự viết hoa, 1 ký tự viết thường, 1 ký tự đặc biệt và 1 số
exports.passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const isValidPassword = (password) => {
    return exports.passwordRegex.test(password);
};
exports.isValidPassword = isValidPassword;
//# sourceMappingURL=password.js.map