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
const DetectorModel_1 = __importDefault(require("../models/DetectorModel"));
const FalcBoardModel_1 = __importDefault(require("../models/FalcBoardModel"));
const NacBoardModel_1 = __importDefault(require("../models/NacBoardModel"));
const NacCircuitModel_1 = __importDefault(require("../models/NacCircuitModel"));
const EventLogModel_1 = __importDefault(require("../models/EventLogModel"));
const PanelModel_1 = __importDefault(require("../models/PanelModel"));
class StatisticsController {
    // Lấy thống kê tổng quan cho dashboard
    getDashboardStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Lấy thống kê detectors
                const totalDetectors = yield DetectorModel_1.default.countDocuments();
                const disconnectedDetectors = yield DetectorModel_1.default.countDocuments({
                    status: { $in: ["Fault", "Disabled"] },
                });
                const normalDetectors = yield DetectorModel_1.default.countDocuments({
                    status: "Normal",
                }); // Lấy thống kê bo mạch (FALC + NAC)
                const totalFalcBoards = yield FalcBoardModel_1.default.countDocuments();
                const disconnectedFalcBoards = yield FalcBoardModel_1.default.countDocuments({
                    is_active: false,
                });
                const totalNacBoards = yield NacBoardModel_1.default.countDocuments();
                const disconnectedNacBoards = yield NacBoardModel_1.default.countDocuments({
                    is_active: false,
                });
                const totalBoards = totalFalcBoards + totalNacBoards;
                const disconnectedBoards = disconnectedFalcBoards + disconnectedNacBoards;
                // Lấy thống kê sự cố
                const activeEvents = yield EventLogModel_1.default.countDocuments({
                    status: "Active",
                });
                const totalEvents = yield EventLogModel_1.default.countDocuments();
                // Lấy danh sách detector bị lỗi (để hiển thị trong list)
                const faultyDetectors = yield DetectorModel_1.default.find({
                    status: { $in: ["Fault", "Disabled"] },
                })
                    .populate("falcBoardId", "name")
                    .limit(10)
                    .sort({ updatedAt: -1 });
                // Lấy tất cả bo mạch bị tắt (is_active: false)
                const disabledFalcBoardsList = yield FalcBoardModel_1.default.find({
                    is_active: false,
                })
                    .populate("panelId", "name")
                    .sort({ updatedAt: -1 });
                const disabledNacBoardsList = yield NacBoardModel_1.default.find({
                    is_active: false,
                })
                    .populate("panelId", "name")
                    .sort({ updatedAt: -1 }); // Tổng hợp trạng thái từ cả detectors và nacCircuits
                const detectorOperating = yield DetectorModel_1.default.countDocuments({
                    is_active: true,
                });
                const detectorWarning = yield DetectorModel_1.default.countDocuments({
                    status: { $ne: "Normal" },
                });
                const detectorError = yield DetectorModel_1.default.countDocuments({
                    is_active: false,
                });
                const detectorUndefined = yield DetectorModel_1.default.countDocuments({
                    $or: [{ status: { $exists: false } }, { status: null }, { status: "" }],
                });
                const nacCircuitOperating = yield NacCircuitModel_1.default.countDocuments({
                    is_active: true,
                });
                const nacCircuitWarning = yield NacCircuitModel_1.default.countDocuments({
                    status: { $ne: "Normal" },
                });
                const nacCircuitError = yield NacCircuitModel_1.default.countDocuments({
                    is_active: false,
                });
                const nacCircuitUndefined = yield NacCircuitModel_1.default.countDocuments({
                    $or: [{ status: { $exists: false } }, { status: null }, { status: "" }],
                });
                const statusStats = {
                    operating: detectorOperating + nacCircuitOperating,
                    warning: detectorWarning + nacCircuitWarning,
                    error: detectorError + nacCircuitError,
                    undefined: detectorUndefined + nacCircuitUndefined,
                };
                // Xác định trạng thái hệ thống
                const hasSystemError = activeEvents > 0 || disconnectedBoards > 0 || disconnectedDetectors > 0;
                res.status(200).json({
                    success: true,
                    data: {
                        detectors: {
                            total: totalDetectors,
                            disconnected: disconnectedDetectors,
                            normal: normalDetectors,
                            faultyList: faultyDetectors.map((detector) => {
                                var _a;
                                return ({
                                    id: detector._id,
                                    name: detector.name || `Đầu báo ${detector.detector_address}`,
                                    message: `Thiết bị ${detector.name} ngắt kết nối trong loop: ${((_a = detector.falcBoardId) === null || _a === void 0 ? void 0 : _a.name) || "Unknown"}`,
                                    status: detector.status,
                                    address: detector.detector_address,
                                });
                            }),
                        },
                        boards: {
                            total: totalBoards,
                            disconnected: disconnectedBoards,
                            disabled: disconnectedBoards,
                            disabledList: [
                                ...disabledFalcBoardsList.map((board) => {
                                    var _a;
                                    return ({
                                        id: board._id,
                                        name: board.name,
                                        message: `Bo mạch FALC ${board.name} đã bị tắt`,
                                        type: "FALC",
                                        is_active: board.is_active,
                                        panel: ((_a = board.panelId) === null || _a === void 0 ? void 0 : _a.name) || "N/A",
                                    });
                                }),
                                ...disabledNacBoardsList.map((board) => {
                                    var _a;
                                    return ({
                                        id: board._id,
                                        name: board.name,
                                        message: `Bo mạch NAC ${board.name} đã bị tắt`,
                                        type: "NAC",
                                        is_active: board.is_active,
                                        panel: ((_a = board.panelId) === null || _a === void 0 ? void 0 : _a.name) || "N/A",
                                    });
                                }),
                            ],
                        },
                        events: {
                            active: activeEvents,
                            total: totalEvents,
                        },
                        statusStats,
                        systemStatus: {
                            hasError: hasSystemError,
                            message: hasSystemError
                                ? "HỆ THỐNG ĐANG CÓ LỖI"
                                : "HỆ THỐNG HOẠT ĐỘNG BÌNH THƯỜNG",
                        },
                    },
                });
            }
            catch (error) {
                console.error("Error getting dashboard statistics:", error);
                res.status(500).json({
                    success: false,
                    message: "Có lỗi xảy ra khi lấy thống kê",
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        });
    }
    // Lấy thống kê chi tiết detectors
    getDetectorStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = yield DetectorModel_1.default.aggregate([
                    {
                        $group: {
                            _id: "$status",
                            count: { $sum: 1 },
                        },
                    },
                ]);
                const detectorsByType = yield DetectorModel_1.default.aggregate([
                    {
                        $group: {
                            _id: "$detector_type",
                            count: { $sum: 1 },
                        },
                    },
                ]);
                res.status(200).json({
                    success: true,
                    data: {
                        byStatus: stats,
                        byType: detectorsByType,
                    },
                });
            }
            catch (error) {
                console.error("Error getting detector statistics:", error);
                res.status(500).json({
                    success: false,
                    message: "Có lỗi xảy ra khi lấy thống kê đầu báo",
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        });
    }
    // Lấy thống kê chi tiết bo mạch
    getBoardStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const falcStats = yield FalcBoardModel_1.default.aggregate([
                    {
                        $group: {
                            _id: "$status",
                            count: { $sum: 1 },
                        },
                    },
                ]);
                const nacStats = yield NacBoardModel_1.default.aggregate([
                    {
                        $group: {
                            _id: "$status",
                            count: { $sum: 1 },
                        },
                    },
                ]);
                res.status(200).json({
                    success: true,
                    data: {
                        falc: falcStats,
                        nac: nacStats,
                    },
                });
            }
            catch (error) {
                console.error("Error getting board statistics:", error);
                res.status(500).json({
                    success: false,
                    message: "Có lỗi xảy ra khi lấy thống kê bo mạch",
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        });
    }
    // Lấy thống kê hệ thống
    getSystemStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Lấy thông tin CPU và RAM từ Control Panel
                const controlPanel = yield PanelModel_1.default.findOne({
                    panel_type: "Control Panel",
                });
                res.status(200).json({
                    success: true,
                    data: {
                        cpu_usage: (controlPanel === null || controlPanel === void 0 ? void 0 : controlPanel.cpu_usage) || 0,
                        ram_usage: (controlPanel === null || controlPanel === void 0 ? void 0 : controlPanel.ram_usage) || 0,
                        uptime: process.uptime(),
                        timestamp: new Date(),
                    },
                });
            }
            catch (error) {
                console.error("Error getting system statistics:", error);
                res.status(500).json({
                    success: false,
                    message: "Có lỗi xảy ra khi lấy thống kê hệ thống",
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        });
    }
    // Test endpoint để kiểm tra dữ liệu bo mạch
    testBoardsData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("=== Testing Boards Data ===");
                // Kiểm tra tất cả FALC boards
                const allFalcBoards = yield FalcBoardModel_1.default.find({})
                    .populate("panelId", "name")
                    .select("name status panelId");
                // Kiểm tra tất cả NAC boards
                const allNacBoards = yield NacBoardModel_1.default.find({})
                    .populate("panelId", "name")
                    .select("name status panelId");
                console.log("All FALC Boards:", allFalcBoards);
                console.log("All NAC Boards:", allNacBoards);
                const falcByStatus = {};
                const nacByStatus = {};
                allFalcBoards.forEach((board) => {
                    const status = board.status || "undefined";
                    falcByStatus[status] = (falcByStatus[status] || 0) + 1;
                });
                allNacBoards.forEach((board) => {
                    const status = board.status || "undefined";
                    nacByStatus[status] = (nacByStatus[status] || 0) + 1;
                });
                console.log("FALC Boards by Status:", falcByStatus);
                console.log("NAC Boards by Status:", nacByStatus);
                res.status(200).json({
                    success: true,
                    data: {
                        falcBoards: {
                            total: allFalcBoards.length,
                            byStatus: falcByStatus,
                            list: allFalcBoards,
                        },
                        nacBoards: {
                            total: allNacBoards.length,
                            byStatus: nacByStatus,
                            list: allNacBoards,
                        },
                    },
                });
            }
            catch (error) {
                console.error("Error testing boards data:", error);
                res.status(500).json({
                    success: false,
                    message: "Có lỗi xảy ra khi test dữ liệu bo mạch",
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        });
    }
}
exports.default = new StatisticsController();
//# sourceMappingURL=StatisticsController.js.map