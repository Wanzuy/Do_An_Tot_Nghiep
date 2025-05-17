import mongoose from "mongoose";
import DetectorModel from "../models/DetectorModel";
import FalcBoardModel from "../models/FalcBoardModel";
import ZoneModel from "../models/ZoneModel";
import { createEventLog } from "./EventLogController";

export const createDetector = async (req: any, res: any) => {
    try {
        // Kiểm tra falcBoardId và zoneId có được cung cấp và hợp lệ không
        if (
            !req.body.falcBoardId ||
            !mongoose.Types.ObjectId.isValid(req.body.falcBoardId)
        ) {
            return res.status(400).json({
                success: false,
                message: "FalcBoard ID không hợp lệ hoặc bị thiếu.",
            });
        }
        if (
            !req.body.zoneId ||
            !mongoose.Types.ObjectId.isValid(req.body.zoneId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Zone ID không hợp lệ hoặc bị thiếu.",
            });
        } // Kiểm tra falcBoardId và zoneId có tồn tại không

        const falcBoard = await FalcBoardModel.findById(req.body.falcBoardId);
        if (!falcBoard) {
            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy Bo mạch FALC với ID " +
                    req.body.falcBoardId,
            });
        }
        const zone = await ZoneModel.findById(req.body.zoneId);
        if (!zone) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Vùng (Zone) với ID " + req.body.zoneId,
            });
        } // Tạo Detector mới bằng cách truyền trực tiếp req.body

        const newDetector = new DetectorModel(req.body); // Mongoose sẽ tự động lấy các trường trong schema
        newDetector.last_reported_at = new Date(); // Cập nhật thời gian báo cáo khi tạo

        const savedDetector = await newDetector.save(); // Lưu vào database

        // Populate các trường liên kết trước khi trả về
        const result = await DetectorModel.findById(savedDetector._id)
            .populate("falcBoardId", "name panelId")
            .populate("zoneId", "name description");

        res.status(201).json({
            success: true,
            message: "Tạo đầu báo thành công.",
            data: result,
        });
    } catch (error: any) {
        console.error("Lỗi khi tạo đầu báo:", error); // Xử lý lỗi unique index kết hợp (falcBoardId + loop_number + detector_address)
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message:
                    "Địa chỉ đầu báo đã tồn tại trên vòng lặp này của bo mạch FALC.",
            });
        } else if (error.name === "ValidationError") {
            // Lỗi validation của Mongoose
            res.status(400).json({
                success: false,
                message: "Lỗi xác thực dữ liệu: " + error.message,
            });
        } else if (error.kind === "ObjectId") {
            // Lỗi CastError cho các ID trong body
            return res.status(400).json({
                success: false,
                message: "Định dạng ID không hợp lệ cho FalcBoard hoặc Zone.",
            });
        } else {
            res.status(500).json({
                success: false,
                message: error.message || "Đã xảy ra lỗi khi tạo đầu báo.",
            });
        }
    }
};

/**
 * Get all detectors with optional filtering
 */
export const getAllDetectors = async (req: any, res: any) => {
    try {
        const filter: any = {}; // Object chứa các điều kiện lọc

        if (req.query.falcBoardId) {
            if (!mongoose.Types.ObjectId.isValid(req.query.falcBoardId)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "FalcBoard ID trong tham số truy vấn không hợp lệ.",
                });
            }
            filter.falcBoardId = req.query.falcBoardId;
        }
        if (req.query.loop_number !== undefined)
            filter.loop_number = req.query.loop_number; // Cho phép lọc cả loop_number = 0
        if (req.query.zoneId) {
            if (!mongoose.Types.ObjectId.isValid(req.query.zoneId)) {
                return res.status(400).json({
                    success: false,
                    message: "Zone ID trong tham số truy vấn không hợp lệ.",
                });
            }
            filter.zoneId = req.query.zoneId;
        }
        if (req.query.status) filter.status = req.query.status;
        if (req.query.detector_type)
            filter.detector_type = req.query.detector_type;
        if (req.query.is_active !== undefined)
            filter.is_active = req.query.is_active === "true"; // Chuyển string "true"/"false" sang boolean // Phân trang

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 100; // Mặc định 100 bản ghi mỗi trang
        const skip = (page - 1) * limit;

        const detectors = await DetectorModel.find(filter)
            .populate("falcBoardId", "name panelId") // Populate board và lấy cả panelId từ board
            .populate("zoneId", "name description") // Populate zone
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }) // Sắp xếp mặc định
            .exec(); // Thêm .exec() // Get total count for pagination

        const total = await DetectorModel.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: detectors.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: detectors,
        });
    } catch (error: any) {
        console.error("Lỗi khi lấy danh sách đầu báo:", error);
        if (error.kind === "ObjectId") {
            // Xử lý lỗi CastError (nếu ID trong query không hợp lệ)
            return res.status(400).json({
                success: false,
                message: "Định dạng ID không hợp lệ trong truy vấn.",
            });
        }
        res.status(500).json({
            success: false,
            message:
                error.message || "Đã xảy ra lỗi khi lấy danh sách đầu báo.",
        });
    }
};

/**
 * Get detector by ID
 */
export const getDetectorById = async (req: any, res: any) => {
    try {
        // Kiểm tra ID hợp lệ
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đầu báo với ID " + req.params.id,
            });
        }

        const detector = await DetectorModel.findById(req.params.id)
            .populate("falcBoardId", "name panelId") // Populate board và lấy cả panelId từ board
            .populate("zoneId", "name description"); // Populate zone

        if (!detector) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy đầu báo với ID " + req.params.id,
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: detector,
        });
    } catch (error: any) {
        console.error("Lỗi khi lấy đầu báo theo ID:", error);
        if (error.kind === "ObjectId") {
            // Xử lý lỗi CastError
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đầu báo với ID " + req.params.id,
            });
        }
        res.status(500).json({
            success: false,
            message:
                error.message || "Lỗi khi lấy đầu báo với ID " + req.params.id,
        });
    }
};

/**
 * Update detector by ID
 */
export const updateDetector = async (req: any, res: any) => {
    try {
        // Kiểm tra ID hợp lệ
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đầu báo với ID " + req.params.id,
            });
        }

        // Nếu falcBoardId được gửi trong body, kiểm tra nó có hợp lệ và tồn tại không
        if (
            req.body.falcBoardId !== undefined &&
            req.body.falcBoardId !== null &&
            req.body.falcBoardId !== ""
        ) {
            if (!mongoose.Types.ObjectId.isValid(req.body.falcBoardId)) {
                return res.status(400).json({
                    success: false,
                    message: "FalcBoard ID mới không hợp lệ.",
                });
            } else {
                const falcBoard = await FalcBoardModel.findById(
                    req.body.falcBoardId
                );
                if (!falcBoard) {
                    return res.status(404).json({
                        success: false,
                        message:
                            "Không tìm thấy Bo mạch FALC với ID mới " +
                            req.body.falcBoardId,
                    });
                }
            }
        }
        // Nếu zoneId được gửi trong body, kiểm tra nó có hợp lệ và tồn tại không
        if (
            req.body.zoneId !== undefined &&
            req.body.zoneId !== null &&
            req.body.zoneId !== ""
        ) {
            if (!mongoose.Types.ObjectId.isValid(req.body.zoneId)) {
                return res.status(400).json({
                    success: false,
                    message: "Zone ID mới không hợp lệ.",
                });
            } else {
                const zone = await ZoneModel.findById(req.body.zoneId);
                if (!zone) {
                    return res.status(404).json({
                        success: false,
                        message:
                            "Không tìm thấy Vùng (Zone) với ID mới " +
                            req.body.zoneId,
                    });
                }
            }
        }

        const updatedDetector = await DetectorModel.findByIdAndUpdate(
            req.params.id,
            req.body, // Truyền trực tiếp req.body
            { new: true, runValidators: true }
        )
            .populate("falcBoardId", "name panelId")
            .populate("zoneId", "name description");

        if (!updatedDetector) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy đầu báo với ID " + req.params.id,
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Cập nhật thông tin đầu báo thành công.",
            data: updatedDetector,
        });
    } catch (error: any) {
        console.error("Lỗi khi cập nhật thông tin đầu báo:", error); // Xử lý lỗi unique index kết hợp (falcBoardId + loop_number + detector_address)
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message:
                    "Địa chỉ đầu báo đã tồn tại trên vòng lặp này của bo mạch FALC.",
            });
        } else if (error.name === "ValidationError") {
            res.status(400).json({
                success: false,
                message: "Lỗi xác thực dữ liệu: " + error.message,
            });
        } else if (error.kind === "ObjectId") {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đầu báo với ID " + req.params.id,
            });
        } else {
            res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "Lỗi khi cập nhật thông tin đầu báo với ID " +
                        req.params.id,
            });
        }
    }
};

/**
 * Update detector status
 */
export const updateDetectorStatus = async (req: any, res: any) => {
    try {
        // Kiểm tra ID hợp lệ
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đầu báo với ID " + req.params.id,
            });
        }

        const { status, last_reading } = req.body;

        if (!status) {
            res.status(400).json({
                success: false,
                message: "Trạng thái (status) là bắt buộc.",
            });
            return;
        } // Validate status

        const validStatuses = ["Normal", "Alarm", "Fault", "Disabled"];
        if (!validStatuses.includes(status)) {
            res.status(400).json({
                success: false,
                message:
                    "Giá trị trạng thái không hợp lệ. Phải là một trong các giá trị: " +
                    validStatuses.join(", "),
            });
            return;
        }

        // Lấy thông tin đầu báo hiện tại để so sánh trạng thái cũ
        const detector: any = await DetectorModel.findById(
            req.params.id
        ).populate("falcBoardId", "panelId"); // Lấy board và panelId để ghi log

        if (!detector) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đầu báo với ID " + req.params.id,
            });
        }

        const oldStatus = detector.status; // Trạng thái cũ

        // Cập nhật thông tin
        detector.status = status;
        if (last_reading !== undefined) detector.last_reading = last_reading; // Cập nhật giá trị đọc nếu có
        detector.last_reported_at = new Date(); // Cập nhật thời gian báo cáo

        const updatedDetector = await detector.save(); // Lưu thay đổi

        // --- GHI LOG SỰ KIỆN ---
        if (oldStatus !== updatedDetector.status) {
            const eventType =
                updatedDetector.status === "Alarm"
                    ? "Alarm"
                    : updatedDetector.status === "Fault"
                    ? "Fault"
                    : oldStatus === "Alarm" || oldStatus === "Fault"
                    ? "Restore"
                    : "StatusChange"; // Xác định loại log (Alarm, Fault, Restore, StatusChange)

            let description = `Trạng thái đầu báo "${
                updatedDetector.name || updatedDetector.detector_address
            }" thay đổi từ "${oldStatus}" sang "${updatedDetector.status}".`;
            if (eventType === "Alarm")
                description = `Báo động tại đầu báo "${
                    updatedDetector.name || updatedDetector.detector_address
                }"`;
            if (eventType === "Fault")
                description = `Lỗi tại đầu báo "${
                    updatedDetector.name || updatedDetector.detector_address
                }"`;
            if (eventType === "Restore" && updatedDetector.status === "Normal")
                description = `Khôi phục trạng thái bình thường cho đầu báo "${
                    updatedDetector.name || updatedDetector.detector_address
                }"`;

            // Lấy panelId từ falcBoardId đã populate
            const panelId = updatedDetector.falcBoardId
                ? updatedDetector.falcBoardId.panelId
                : null;

            // Xác định trạng thái log ('Active' cho Alarm/Fault, 'Info' cho Restore/Normal)
            const logStatus =
                updatedDetector.status === "Alarm" ||
                updatedDetector.status === "Fault"
                    ? "Active"
                    : "Info";

            // Gọi hàm ghi log
            await createEventLog(
                eventType,
                description,
                "Detector", // Loại nguồn
                updatedDetector._id, // ID nguồn
                updatedDetector.zoneId, // ID Zone
                panelId, // ID Panel
                logStatus, // Trạng thái log
                { last_reading: updatedDetector.last_reading } // Thông tin chi tiết thêm
            );
        }
        // --- KẾT THÚC GHI LOG ---

        res.status(200).json({
            success: true,
            message: "Cập nhật trạng thái đầu báo thành công.",
            data: updatedDetector,
        });
    } catch (error: any) {
        console.error("Lỗi khi cập nhật trạng thái đầu báo:", error);
        if (error.kind === "ObjectId") {
            // Xử lý lỗi CastError
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đầu báo với ID " + req.params.id,
            });
        }
        res.status(500).json({
            success: false,
            message:
                error.message ||
                "Lỗi khi cập nhật trạng thái đầu báo với ID " + req.params.id,
        });
    }
};

/**
 * Delete detector by ID
 */
export const deleteDetector = async (req: any, res: any) => {
    try {
        // Kiểm tra ID hợp lệ
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đầu báo với ID " + req.params.id,
            });
        }

        // Detector không có các document con liên kết, nên có thể xóa trực tiếp
        const deletedDetector = await DetectorModel.findByIdAndDelete(
            req.params.id
        );

        if (!deletedDetector) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy đầu báo với ID " + req.params.id,
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Xóa đầu báo thành công.",
        });
    } catch (error: any) {
        console.error("Lỗi khi xóa đầu báo:", error);
        if (error.kind === "ObjectId") {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đầu báo với ID " + req.params.id,
            });
        }
        res.status(500).json({
            success: false,
            message:
                error.message ||
                "Không thể xóa đầu báo với ID " + req.params.id,
        });
    }
};

/**
 * Lấy danh sách đầu báo theo ID bảng FALC
 */
export const getDetectorsByFalcBoardId = async (req: any, res: any) => {
    try {
        const { falcBoardId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(falcBoardId)) {
            return res.status(400).json({
                success: false,
                message: "FalcBoard ID không hợp lệ.",
            });
        }

        const detectors = await DetectorModel.find({ falcBoardId })
            .populate("zoneId", "name description")
            .populate({
                path: "falcBoardId",
                populate: { path: "panelId", select: "name panel_type" },
            })
            .sort({ loop_number: 1, detector_address: 1 });

        res.status(200).json({
            success: true,
            count: detectors.length,
            data: detectors,
        });
    } catch (error: any) {
        console.error(
            "Lỗi khi lấy danh sách đầu báo theo FalcBoard ID:",
            error
        );
        if (error.kind === "ObjectId") {
            return res
                .status(400)
                .json({ success: false, message: "ID không hợp lệ." });
        }
        res.status(500).json({
            success: false,
            message:
                error.message ||
                "Đã xảy ra lỗi khi lấy danh sách đầu báo theo FalcBoard ID.",
        });
    }
};

/**
 * Get detectors by Zone ID
 */
export const getDetectorsByZoneId = async (req: any, res: any) => {
    try {
        const { zoneId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(zoneId)) {
            return res
                .status(400)
                .json({ success: false, message: "Zone ID không hợp lệ." });
        }

        const detectors = await DetectorModel.find({ zoneId })
            .populate({
                path: "falcBoardId",
                populate: { path: "panelId", select: "name panel_type" },
            })
            .populate("zoneId", "name description")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: detectors.length,
            data: detectors,
        });
    } catch (error: any) {
        console.error("Lỗi khi lấy danh sách đầu báo theo Zone ID:", error);
        if (error.kind === "ObjectId") {
            return res
                .status(400)
                .json({ success: false, message: "ID không hợp lệ." });
        }
        res.status(500).json({
            success: false,
            message:
                error.message ||
                "Đã xảy ra lỗi khi lấy danh sách đầu báo theo Zone ID.",
        });
    }
};
