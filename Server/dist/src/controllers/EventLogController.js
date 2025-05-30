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
exports.acknowledgeEvent = exports.getEventById = exports.getAllEvents = exports.createEventLog = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const EventLogModel_1 = __importDefault(require("../models/EventLogModel"));
const createEventLog = (eventType_1, description_1, sourceType_1, sourceId_1, zoneId_1, panelId_1, ...args_1) => __awaiter(void 0, [eventType_1, description_1, sourceType_1, sourceId_1, zoneId_1, panelId_1, ...args_1], void 0, function* (eventType, description, sourceType, sourceId, zoneId, panelId, status = "Info", details = null) {
    try {
        const newLog = new EventLogModel_1.default({
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
        yield newLog.save(); // console.log(`Event Logged: ${eventType} - ${description}`);
    }
    catch (error) {
        console.error("Error creating Event Log:", error);
    }
});
exports.createEventLog = createEventLog;
// --- Hàm Controller API: Lấy lịch sử Log sự kiện ---
/**
 * Get all Event Logs
 */
const getAllEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = {}; // Object chứa các điều kiện lọc
        // Lọc theo loại sự kiện
        if (req.query.type) {
            query.event_type = req.query.type;
        }
        // Lọc theo zone
        if (req.query.zoneId) {
            if (!mongoose_1.default.Types.ObjectId.isValid(req.query.zoneId)) {
                return res.status(400).json({
                    success: false,
                    message: "Định dạng ID Zone trong tham số truy vấn không hợp lệ.",
                });
            }
            query.zoneId = req.query.zoneId;
        }
        // Lọc theo panel
        if (req.query.panelId) {
            if (!mongoose_1.default.Types.ObjectId.isValid(req.query.panelId)) {
                return res.status(400).json({
                    success: false,
                    message: "Định dạng ID Panel trong tham số truy vấn không hợp lệ.",
                });
            }
            query.paneliId = req.query.panelId;
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
        const sort = req.query.sortBy || "-timestamp"; // Mặc định sắp xếp theo thời gian giảm dần
        // Lấy logs
        const logs = yield EventLogModel_1.default.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            // Populate các trường có ref cố định nếu cần (Zone, Panel, User)
            .populate("zoneId", "name")
            .populate("paneliId", "name")
            // .populate('acknowledged_by_user_id', 'username') // Cần Model User
            .exec();
        // Lấy tổng số document cho phân trang
        const total = yield EventLogModel_1.default.countDocuments(query);
        res.status(200).json({
            success: true,
            count: logs.length,
            total: total,
            page: page,
            limit: limit,
            data: logs,
        });
    }
    catch (error) {
        console.error("Lỗi khi lấy lịch sử sự kiện:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Đã xảy ra lỗi khi lấy lịch sử sự kiện.",
        });
    }
});
exports.getAllEvents = getAllEvents;
/**
 * Get a single Event Log by ID
 */
const getEventById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Kiểm tra định dạng ID trong params
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bản ghi sự kiện với ID " + req.params.id,
            });
        }
        const log = yield EventLogModel_1.default.findById(req.params.id)
            .populate("zoneId", "name")
            .populate("paneliId", "name");
        // .populate('acknowledged_by_user_id', 'username'); // Cần Model User
        if (!log) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bản ghi sự kiện với ID " + req.params.id,
            });
        }
        res.status(200).json({ success: true, data: log });
    }
    catch (error) {
        console.error("Lỗi khi lấy bản ghi sự kiện theo ID:", error);
        if (error.kind === "ObjectId") {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bản ghi sự kiện với ID " + req.params.id,
            });
        }
        res.status(500).json({
            success: false,
            message: error.message ||
                "Lỗi khi lấy bản ghi sự kiện với ID " + req.params.id,
        });
    }
});
exports.getEventById = getEventById;
/**
 * Acknowledge an Event Log (Mark as Cleared)
 */
const acknowledgeEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Kiểm tra định dạng ID trong params
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bản ghi sự kiện với ID " + req.params.id,
            });
        }
        // Kiểm tra userId trong body nếu bạn yêu cầu người dùng đăng nhập để xác nhận
        // if (!req.body.userId || !mongoose.Types.ObjectId.isValid(req.body.userId)) {
        //     return res.status(400).json({ success: false, message: "ID người dùng xác nhận không hợp lệ." });
        // }
        // const user = await User.findById(req.body.userId); // Cần Model User
        // if (!user) {
        //      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng xác nhận với ID " + req.body.userId });
        // }
        const updatedLog = yield EventLogModel_1.default.findByIdAndUpdate(req.params.id, {
            status: "Cleared", // Đổi trạng thái sang Cleared
            acknowledged_at: new Date(), // Lưu thời gian xác nhận
            // acknowledged_by_user_id: req.body.userId // Lưu ID người dùng
        }, { new: true } // Trả về document sau khi cập nhật
        )
            .populate("zoneId", "name")
            .populate("paneliId", "name");
        // .populate('acknowledged_by_user_id', 'username');
        if (!updatedLog) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bản ghi sự kiện với ID " + req.params.id,
            });
        }
        res.status(200).json({
            success: true,
            message: "Sự kiện đã được xác nhận.",
            data: updatedLog,
        });
    }
    catch (error) {
        console.error("Lỗi khi xác nhận sự kiện:", error);
        if (error.kind === "ObjectId") {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bản ghi sự kiện với ID " + req.params.id,
            });
        }
        res.status(500).json({
            success: false,
            message: error.message ||
                "Lỗi khi xác nhận sự kiện với ID " + req.params.id,
        });
    }
});
exports.acknowledgeEvent = acknowledgeEvent;
//# sourceMappingURL=EventLogController.js.map