export const requiredRule = {
    required: true,
    message: "Vui lòng nhập trường này !",
};

export const passwordComplexity = {
    pattern:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    message:
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
};

export const accountnameRule = [requiredRule]
export const passwordRule = [requiredRule, passwordComplexity];