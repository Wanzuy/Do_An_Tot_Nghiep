import { Router } from "express";
import {
    createAccount,
    deleteAccount,
    getAllAccounts,
    login,
    resetPassword,
    updateAccount,
} from "../controllers/AuthController";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

router.get("/", verifyToken, getAllAccounts);
router.post("/", verifyToken, createAccount);
router.put("/:userId", verifyToken, updateAccount);
router.post("/login", login);
router.post("/:userId/reset-password", verifyToken, resetPassword);
router.delete("/:userId", verifyToken, deleteAccount);
export default router;
