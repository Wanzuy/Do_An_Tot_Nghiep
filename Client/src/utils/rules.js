export const getRules = (t) => {
    // Min 6 characters rule
    const min6 = {
        min: 6,
        message: t("validation.min6Chars"),
    };

    const requiredRule = {
        required: true,
        message: t("validation.required"),
    };

    const passwordComplexity = {
        pattern:
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        message: t("validation.passwordComplexity"),
    };

    // Return object with all rules
    return {
        accountnameRule: [requiredRule, min6],
        passwordRule: [requiredRule, passwordComplexity],
        requiredRule,
        min6,
        passwordComplexity,
    };
};
