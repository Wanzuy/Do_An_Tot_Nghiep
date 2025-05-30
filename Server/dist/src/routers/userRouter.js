"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const verifyToken_1 = require("../middlewares/verifyToken");
const router = (0, express_1.Router)();
router.get("/", verifyToken_1.verifyToken, AuthController_1.getAllAccounts);
router.post("/", verifyToken_1.verifyToken, AuthController_1.createAccount);
router.put("/:userId", verifyToken_1.verifyToken, AuthController_1.updateAccount);
router.post("/login", AuthController_1.login);
router.post("/:userId/reset-password", verifyToken_1.verifyToken, AuthController_1.resetPassword);
router.delete("/:userId", verifyToken_1.verifyToken, AuthController_1.deleteAccount);
exports.default = router;
//# sourceMappingURL=userRouter.js.map