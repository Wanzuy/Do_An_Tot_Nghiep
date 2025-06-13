"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const StatisticsController_1 = __importDefault(require("../controllers/StatisticsController"));
const verifyToken_1 = require("../middlewares/verifyToken");
const router = express_1.default.Router();
// Tất cả các route đều cần xác thực
router.use(verifyToken_1.verifyToken);
// GET /statistics/dashboard - Lấy thống kê tổng quan cho dashboard
router.get("/dashboard", StatisticsController_1.default.getDashboardStats);
// GET /statistics/detectors - Lấy thống kê chi tiết detectors
router.get("/detectors", StatisticsController_1.default.getDetectorStats);
// GET /statistics/boards - Lấy thống kê chi tiết bo mạch
router.get("/boards", StatisticsController_1.default.getBoardStats);
// GET /statistics/system - Lấy thống kê hệ thống
router.get("/system", StatisticsController_1.default.getSystemStats);
// GET /statistics/test-boards - Test endpoint để kiểm tra dữ liệu bo mạch
router.get("/test-boards", StatisticsController_1.default.testBoardsData);
exports.default = router;
//# sourceMappingURL=StatisticsRouter.js.map