import { Request, Response } from "express";
import DetectorModel from "../models/DetectorModel";
import FalcBoardModel from "../models/FalcBoardModel";
import NacBoardModel from "../models/NacBoardModel";
import NacCircuitModel from "../models/NacCircuitModel";
import EventLogModel from "../models/EventLogModel";
import PanelModel from "../models/PanelModel";

class StatisticsController {
  // Lấy thống kê tổng quan cho dashboard
  async getDashboardStats(req: Request, res: Response) {
    try {
      // Lấy thống kê detectors
      const totalDetectors = await DetectorModel.countDocuments();
      const disconnectedDetectors = await DetectorModel.countDocuments({
        status: { $in: ["Fault", "Disabled"] },
      });
      const normalDetectors = await DetectorModel.countDocuments({
        status: "Normal",
      }); // Lấy thống kê bo mạch (FALC + NAC)
      const totalFalcBoards = await FalcBoardModel.countDocuments();
      const disconnectedFalcBoards = await FalcBoardModel.countDocuments({
        is_active: false,
      });

      const totalNacBoards = await NacBoardModel.countDocuments();
      const disconnectedNacBoards = await NacBoardModel.countDocuments({
        is_active: false,
      });

      const totalBoards = totalFalcBoards + totalNacBoards;
      const disconnectedBoards = disconnectedFalcBoards + disconnectedNacBoards;

      // Lấy thống kê sự cố
      const activeEvents = await EventLogModel.countDocuments({
        status: "Active",
      });
      const totalEvents = await EventLogModel.countDocuments();

      // Lấy danh sách detector bị lỗi (để hiển thị trong list)
      const faultyDetectors = await DetectorModel.find({
        status: { $in: ["Fault", "Disabled"] },
      })
        .populate("falcBoardId", "name")
        .limit(10)
        .sort({ updatedAt: -1 });

      // Lấy tất cả bo mạch bị tắt (is_active: false)
      const disabledFalcBoardsList = await FalcBoardModel.find({
        is_active: false,
      })
        .populate("panelId", "name")
        .sort({ updatedAt: -1 });

      const disabledNacBoardsList = await NacBoardModel.find({
        is_active: false,
      })
        .populate("panelId", "name")
        .sort({ updatedAt: -1 }); // Tổng hợp trạng thái từ cả detectors và nacCircuits

      const detectorOperating = await DetectorModel.countDocuments({
        is_active: true,
      });
      const detectorWarning = await DetectorModel.countDocuments({
        status: { $ne: "Normal" },
      });
      const detectorError = await DetectorModel.countDocuments({
        is_active: false,
      });
      const detectorUndefined = await DetectorModel.countDocuments({
        $or: [{ status: { $exists: false } }, { status: null }, { status: "" }],
      });

      const nacCircuitOperating = await NacCircuitModel.countDocuments({
        is_active: true,
      });
      const nacCircuitWarning = await NacCircuitModel.countDocuments({
        status: { $ne: "Normal" },
      });
      const nacCircuitError = await NacCircuitModel.countDocuments({
        is_active: false,
      });
      const nacCircuitUndefined = await NacCircuitModel.countDocuments({
        $or: [{ status: { $exists: false } }, { status: null }, { status: "" }],
      });

      const statusStats = {
        operating: detectorOperating + nacCircuitOperating,
        warning: detectorWarning + nacCircuitWarning,
        error: detectorError + nacCircuitError,
        undefined: detectorUndefined + nacCircuitUndefined,
      };

      // Xác định trạng thái hệ thống
      const hasSystemError =
        activeEvents > 0 || disconnectedBoards > 0 || disconnectedDetectors > 0;

      res.status(200).json({
        success: true,
        data: {
          detectors: {
            total: totalDetectors,
            disconnected: disconnectedDetectors,
            normal: normalDetectors,
            faultyList: faultyDetectors.map((detector) => ({
              id: detector._id,
              name: detector.name || `Đầu báo ${detector.detector_address}`,
              message: `Thiết bị ${detector.name} ngắt kết nối trong loop: ${
                (detector.falcBoardId as { name?: string })?.name || "Unknown"
              }`,
              status: detector.status,
              address: detector.detector_address,
            })),
          },
          boards: {
            total: totalBoards,
            disconnected: disconnectedBoards,
            disabled: disconnectedBoards,
            disabledList: [
              ...disabledFalcBoardsList.map((board) => ({
                id: board._id,
                name: board.name,
                message: `Bo mạch FALC ${board.name} đã bị tắt`,
                type: "FALC",
                is_active: board.is_active,
                panel: (board.panelId as { name?: string })?.name || "N/A",
              })),
              ...disabledNacBoardsList.map((board) => ({
                id: board._id,
                name: board.name,
                message: `Bo mạch NAC ${board.name} đã bị tắt`,
                type: "NAC",
                is_active: board.is_active,
                panel: (board.panelId as { name?: string })?.name || "N/A",
              })),
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
    } catch (error) {
      console.error("Error getting dashboard statistics:", error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi lấy thống kê",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Lấy thống kê chi tiết detectors
  async getDetectorStats(req: Request, res: Response) {
    try {
      const stats = await DetectorModel.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const detectorsByType = await DetectorModel.aggregate([
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
    } catch (error) {
      console.error("Error getting detector statistics:", error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi lấy thống kê đầu báo",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Lấy thống kê chi tiết bo mạch
  async getBoardStats(req: Request, res: Response) {
    try {
      const falcStats = await FalcBoardModel.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const nacStats = await NacBoardModel.aggregate([
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
    } catch (error) {
      console.error("Error getting board statistics:", error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi lấy thống kê bo mạch",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Lấy thống kê hệ thống
  async getSystemStats(req: Request, res: Response) {
    try {
      // Lấy thông tin CPU và RAM từ Control Panel
      const controlPanel = await PanelModel.findOne({
        panel_type: "Control Panel",
      });

      res.status(200).json({
        success: true,
        data: {
          cpu_usage: controlPanel?.cpu_usage || 0,
          ram_usage: controlPanel?.ram_usage || 0,
          uptime: process.uptime(),
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error("Error getting system statistics:", error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi lấy thống kê hệ thống",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Test endpoint để kiểm tra dữ liệu bo mạch
  async testBoardsData(req: Request, res: Response) {
    try {
      console.log("=== Testing Boards Data ===");

      // Kiểm tra tất cả FALC boards
      const allFalcBoards = await FalcBoardModel.find({})
        .populate("panelId", "name")
        .select("name status panelId");

      // Kiểm tra tất cả NAC boards
      const allNacBoards = await NacBoardModel.find({})
        .populate("panelId", "name")
        .select("name status panelId");

      console.log("All FALC Boards:", allFalcBoards);
      console.log("All NAC Boards:", allNacBoards);

      const falcByStatus: Record<string, number> = {};
      const nacByStatus: Record<string, number> = {};

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
    } catch (error) {
      console.error("Error testing boards data:", error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi test dữ liệu bo mạch",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export default new StatisticsController();
