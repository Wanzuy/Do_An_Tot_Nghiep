import { Router } from "express";
import {
    createAccount,
    login,
    resetPassword,
} from "../controllers/AuthController";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

router.post("/", verifyToken, createAccount);
router.post("/login", login);
router.post("/:userId/reset-password", verifyToken, resetPassword);
export default router;
