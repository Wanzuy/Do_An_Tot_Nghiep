import mongoose from "mongoose";
import EventLogModel from "../models/EventLogModel";
import DetectorModel from "../models/DetectorModel";

// --- Hàm nội bộ: Tạo một bản ghi Log sự kiện ---
// Hàm này sẽ được các controller khác (Detector, NAC, User, System...) gọi.
type EventType =
  | "Fire Alarm"
  | "Fault"
  | "Offline"
  | "Restore"
  | "Activation"
  | "Deactivation"
  | "StatusChange";

type SourceType = "Detector" | "NAC" | "FalcBoard"; // Chỉ log từ Detector hoặc NAC

type LogStatus = "Active" | "Cleared" | "Info"; // Giữ nguyên

export const createEventLog = async (
  eventType: EventType,
  description: string,
  sourceType: SourceType,
  sourceId: mongoose.Types.ObjectId | string | null | undefined,
  zoneId: mongoose.Types.ObjectId | string | null | undefined,
  panelId: mongoose.Types.ObjectId | string | null | undefined,
  status: LogStatus = "Info",
  details: any | null = null
) => {
  try {
    const newLog = new EventLogModel({
      timestamp: new Date(),
      event_type: eventType,
      description: description,
      source_type: sourceType,
      source_id: sourceId,
      zoneId: zoneId,
      panelId: panelId,
      status: status,
      details: details,
    });
    await newLog.save(); // console.log(`Event Logged: ${eventType} - ${description}`);
  } catch (error) {
    console.error("Error creating Event Log:", error);
  }
};

// --- Hàm Controller API: Lấy lịch sử Log sự kiện ---
/**
 * Get all Event Logs
 */
export const getAllEvents = async (req: any, res: any) => {
  try {
    const query: any = {}; // Object chứa các điều kiện lọc

    // Lọc theo loại sự kiện
    if (req.query.type) {
      query.event_type = req.query.type;
    }
    // Lọc theo zone
    if (req.query.zoneId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.zoneId)) {
        return res.status(400).json({
          success: false,
          message: "Định dạng ID Zone trong tham số truy vấn không hợp lệ.",
        });
      }
      query.zoneId = req.query.zoneId;
    } // Lọc theo panel
    if (req.query.panelId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.panelId)) {
        return res.status(400).json({
          success: false,
          message: "Định dạng ID Panel trong tham số truy vấn không hợp lệ.",
        });
      }
      query.panelId = req.query.panelId;
    }
    // Lọc theo loại nguồn
    if (req.query.sourceType) {
      query.source_type = req.query.sourceType;
    }
    // Lọc theo trạng thái log (Active, Cleared, Info)
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Lọc theo khoảng thời gian
    if (req.query.startDate || req.query.endDate) {
      query.timestamp = {};
      if (req.query.startDate) {
        query.timestamp.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        // Thêm 1 ngày và trừ 1ms để bao gồm cả cuối ngày endDate
        const endDate = new Date(req.query.endDate);
        endDate.setDate(endDate.getDate() + 1);
        endDate.setMilliseconds(endDate.getMilliseconds() - 1);
        query.timestamp.$lte = endDate;
      }
    }

    // Phân trang và Sắp xếp
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50; // Mặc định 50 bản ghi mỗi trang
    const skip = (page - 1) * limit;
    const sort = req.query.sortBy || "-timestamp"; // Mặc định sắp xếp theo thời gian giảm dần    // Lấy logs
    const logs = await EventLogModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      // Populate các trường có ref cố định nếu cần (Zone, Panel, User)
      .populate("zoneId", "name")
      .populate("panelId", "name")
      // .populate('acknowledged_by_user_id', 'username') // Cần Model User
      .exec();

    // Lấy tổng số document cho phân trang
    const total = await EventLogModel.countDocuments(query);

    res.status(200).json({
      success: true,
      count: logs.length,
      total: total,
      page: page,
      limit: limit,
      data: logs,
    });
  } catch (error: any) {
    console.error("Lỗi khi lấy lịch sử sự kiện:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Đã xảy ra lỗi khi lấy lịch sử sự kiện.",
    });
  }
};

/**
 * Get a single Event Log by ID
 */
export const getEventById = async (req: any, res: any) => {
  try {
    // Kiểm tra định dạng ID trong params
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bản ghi sự kiện với ID " + req.params.id,
      });
    }
    const log = await EventLogModel.findById(req.params.id)
      .populate("zoneId", "name")
      .populate("panelId", "name");
    // .populate('acknowledged_by_user_id', 'username'); // Cần Model User

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bản ghi sự kiện với ID " + req.params.id,
      });
    }

    res.status(200).json({ success: true, data: log });
  } catch (error: any) {
    console.error("Lỗi khi lấy bản ghi sự kiện theo ID:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bản ghi sự kiện với ID " + req.params.id,
      });
    }
    res.status(500).json({
      success: false,
      message:
        error.message || "Lỗi khi lấy bản ghi sự kiện với ID " + req.params.id,
    });
  }
};

/**
 * Acknowledge an Event Log (Mark as Cleared)
 */
export const acknowledgeEvent = async (req: any, res: any) => {
  try {
    // Kiểm tra định dạng ID trong params
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bản ghi sự kiện với ID " + req.params.id,
      });
    }
    // Kiểm tra userId trong body nếu bạn yêu cầu người dùng đăng nhập để xác nhận
    // if (!req.body.userId || !mongoose.Types.ObjectId.isValid(req.body.userId)) {
    //     return res.status(400).json({ success: false, message: "ID người dùng xác nhận không hợp lệ." });
    // }
    // const user = await User.findById(req.body.userId); // Cần Model User    // if (!user) {
    //      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng xác nhận với ID " + req.body.userId });
    // }

    const updatedLog = await EventLogModel.findByIdAndUpdate(
      req.params.id,
      {
        status: "Cleared", // Đổi trạng thái sang Cleared
        acknowledged_at: new Date(), // Lưu thời gian xác nhận
        // acknowledged_by_user_id: req.body.userId // Lưu ID người dùng
      },
      { new: true } // Trả về document sau khi cập nhật
    )
      .populate("zoneId", "name")
      .populate("panelId", "name");
    // .populate('acknowledged_by_user_id', 'username');

    if (!updatedLog) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bản ghi sự kiện với ID " + req.params.id,
      });
    }

    // Nếu sự kiện liên quan đến detector, cập nhật trạng thái detector về bình thường
    if (updatedLog.source_type === "Detector" && updatedLog.source_id) {
      try {
        await DetectorModel.findByIdAndUpdate(updatedLog.source_id, {
          status: "Normal",
          is_active: true,
          last_reported_at: new Date(),
        });
      } catch (detectorError) {
        console.error("Lỗi khi cập nhật trạng thái detector:", detectorError);
        // Không return error ở đây vì việc acknowledge event đã thành công
        // Chỉ log lỗi để theo dõi
      }
    }

    res.status(200).json({
      success: true,
      message: "Sự kiện đã được xác nhận.",
      data: updatedLog,
    });
  } catch (error: any) {
    console.error("Lỗi khi xác nhận sự kiện:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bản ghi sự kiện với ID " + req.params.id,
      });
    }
    res.status(500).json({
      success: false,
      message:
        error.message || "Lỗi khi xác nhận sự kiện với ID " + req.params.id,
    });
  }
};
