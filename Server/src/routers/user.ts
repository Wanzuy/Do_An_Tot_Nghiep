import { Router } from "express";
import { createAccount } from "../controllers/AuthController";

const router = Router();

router.post("/", createAccount);

export default router;
