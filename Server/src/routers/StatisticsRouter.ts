import express from "express";
import StatisticsController from "../controllers/StatisticsController";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();

// Tất cả các route đều cần xác thực
router.use(verifyToken);

// GET /statistics/dashboard - Lấy thống kê tổng quan cho dashboard
router.get("/dashboard", StatisticsController.getDashboardStats);

// GET /statistics/detectors - Lấy thống kê chi tiết detectors
router.get("/detectors", StatisticsController.getDetectorStats);

// GET /statistics/boards - Lấy thống kê chi tiết bo mạch
router.get("/boards", StatisticsController.getBoardStats);

// GET /statistics/system - Lấy thống kê hệ thống
router.get("/system", StatisticsController.getSystemStats);

// GET /statistics/test-boards - Test endpoint để kiểm tra dữ liệu bo mạch
router.get("/test-boards", StatisticsController.testBoardsData);

export default router;
