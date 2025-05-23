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
        }

        // Kiểm tra falcBoardId và zoneId có tồn tại không
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
        }

        // --- Bổ sung: Kiểm tra giới hạn của FalcBoard ---

        const requestedLoop = req.body.loop_number;
        const requestedAddress = req.body.detector_address;
        const maxLoops = falcBoard.loop_count;
        const maxDetectorsPerLoop = falcBoard.number_of_detectors; // Giới hạn thiết bị trên MỖI vòng

        // 1. Kiểm tra loop_number có hợp lệ với số vòng lặp của bo mạch không
        if (requestedLoop < 1 || requestedLoop > maxLoops) {
            return res.status(400).json({
                success: false,
                message: `Số vòng lặp (${requestedLoop}) không hợp lệ cho bo mạch FALC "${falcBoard.name}". Số vòng lặp hợp lệ từ 1 đến ${maxLoops}.`,
            });
        }

        // 2. Kiểm tra detector_address có nằm trong giới hạn địa chỉ trên mỗi vòng lặp không
        // Giả sử địa chỉ bắt đầu từ 1
        if (requestedAddress < 1 || requestedAddress > maxDetectorsPerLoop) {
            return res.status(400).json({
                success: false,
                message: `Địa chỉ đầu báo (${requestedAddress}) nằm ngoài giới hạn cho phép trên mỗi vòng lặp của bo mạch FALC "${falcBoard.name}". Địa chỉ hợp lệ từ 1 đến ${maxDetectorsPerLoop}.`,
            });
        }

        // 3. Kiểm tra số lượng đầu báo hiện tại trên vòng lặp này để không vượt quá giới hạn
        const existingDetectorsCountOnLoop = await DetectorModel.countDocuments(
            {
                falcBoardId: req.body.falcBoardId,
                loop_number: requestedLoop,
            }
        );

        if (existingDetectorsCountOnLoop >= maxDetectorsPerLoop) {
            return res.status(400).json({
                success: false,
                message: `Vòng lặp ${requestedLoop} của bo mạch FALC "${falcBoard.name}" đã đạt số lượng thiết bị tối đa (${maxDetectorsPerLoop}). Không thể thêm đầu báo mới vào vòng lặp này.`,
            });
        }

        // --- Kết thúc kiểm tra giới hạn ---

        // Tạo Detector mới bằng cách truyền trực tiếp req.body
        const newDetector = new DetectorModel(req.body); // Mongoose sẽ tự động lấy các trường trong schema
        newDetector.last_reported_at = new Date(); // Cập nhật thời gian báo cáo khi tạo

        // Lưu vào database
        const savedDetector = await newDetector.save();

        // --- Bổ sung: Cập nhật số lượng đầu báo trên FalcBoard (nếu bạn có trường đó) ---
        // Nếu bạn có trường 'current_detector_count' trên FalcBoardModel
        // falcBoard.current_detector_count = (falcBoard.current_detector_count || 0) + 1;
        // await falcBoard.save();
        // --- Kết thúc Bổ sung ---

        // Populate các trường liên kết trước khi trả về
        const result = await DetectorModel.findById(savedDetector._id)
            .populate({
                path: "falcBoardId",
                populate: {
                    path: "panelId",
                    select: "status",
                },
            })
            .populate("zoneId", "name description"); // Populate Zone như cũ

        res.status(201).json({
            success: true,
            message: "Tạo đầu báo thành công.",
            data: result,
        });
    } catch (error: any) {
        console.error("Lỗi khi tạo đầu báo:", error);
        // Xử lý lỗi unique index kết hợp (falcBoardId + loop_number + detector_address)
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
            // Lỗi CastError cho các ID trong body (đã check isValid ở trên, đây là fallback)
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

        // Cập nhật danh sách trạng thái hợp lệ theo schema mới nhất
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

        // Lấy thông tin đầu báo hiện tại để so sánh trạng thái cũ và lấy thông tin cho log
        // Populate thêm zoneId để có tên zone cho log
        const detector: any = await DetectorModel.findById(req.params.id)
            .populate({
                path: "falcBoardId",
                populate: {
                    path: "panelId",
                    select: "status",
                },
                select: "panelId loop_number is_active",
            })
            .populate("zoneId", "name");

        if (!detector) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đầu báo với ID " + req.params.id,
            });
        }

        // Kiểm tra detector_type có hợp lệ theo enum mới không (nếu dữ liệu cũ tồn tại type khác)
        const validDetectorTypes = ["Smoke", "Heat", "Gas"];
        if (!validDetectorTypes.includes(detector.detector_type)) {
            console.warn(
                `Đầu báo ${detector._id} có detector_type không hợp lệ theo schema mới: ${detector.detector_type}. Cần cập nhật dữ liệu cũ.`
            );
            // Tùy chọn: có thể dừng xử lý hoặc gán một giá trị default/Other nếu schema cho phép
        }

        const oldStatus = detector.status; // Trạng thái cũ

        // Cập nhật thông tin
        detector.status = status;
        if (last_reading !== undefined) detector.last_reading = last_reading; // Cập nhật giá trị đọc nếu có
        detector.last_reported_at = new Date(); // Cập nhật thời gian báo cáo

        const updatedDetector = await detector.save(); // Lưu thay đổi

        // --- GHI LOG SỰ KIỆN ---
        if (
            oldStatus !== updatedDetector.status &&
            (updatedDetector.status === "Alarm" ||
                updatedDetector.status === "Fault") &&
            updatedDetector.falcBoardId &&
            updatedDetector.falcBoardId.is_active &&
            updatedDetector.falcBoardId.panelId &&
            updatedDetector.falcBoardId.panelId.status === "Online"
        ) {
            const eventType: any =
                updatedDetector.status === "Alarm"
                    ? "Fire Alarm"
                    : updatedDetector.status === "Fault"
                    ? "Fault"
                    : oldStatus === "Alarm" || oldStatus === "Fault"
                    ? "Restore"
                    : "Status Change";

            let description = `Trạng thái đầu báo "${
                updatedDetector.name || updatedDetector.detector_address
            }" thay đổi từ: "${oldStatus}" sang: "${updatedDetector.status}".`;

            const detectorAddress = updatedDetector.detector_address;
            const detectorName = updatedDetector.name;
            const detectorType = updatedDetector.detector_type;
            const loopInfo =
                updatedDetector && updatedDetector.loop_number
                    ? `Vòng ${updatedDetector.loop_number}`
                    : "";
            const fullDetectorInfo = `${detectorType} "${
                detectorName || detectorAddress
            }" (${loopInfo}, Địa chỉ: ${detectorAddress})`;
            const zoneName =
                updatedDetector.zoneId && updatedDetector.zoneId.name
                    ? ` tại khu vực(zone): "${updatedDetector.zoneId.name}"`
                    : "";
            const readingInfo =
                updatedDetector.last_reading !== undefined &&
                updatedDetector.last_reading !== null
                    ? ` (Giá trị: ${updatedDetector.last_reading})`
                    : "";

            if (eventType === "Fire Alarm") {
                // Điều chỉnh logic mô tả dựa trên enum detector_type mới
                if (detectorType === "Smoke") {
                    description = `BÁO ĐỘNG CHÁY: Phát hiện khói ${readingInfo} từ ${fullDetectorInfo}${zoneName}.`;
                } else if (detectorType === "Heat") {
                    description = `BÁO ĐỘNG CHÁY: Nhiệt độ tăng cao ${readingInfo} được phát hiện bởi ${fullDetectorInfo}${zoneName}.`;
                } else if (detectorType === "Gas") {
                    description = `BÁO ĐỘNG KHÍ GAS: Phát hiện rò rỉ khí gas: ${readingInfo} từ ${fullDetectorInfo}${zoneName}.`;
                }
                // Nếu detector_type không thuộc enum mới, description sẽ là mặc định hoặc cần xử lý thêm
                else {
                    description = `BÁO ĐỘNG CHÁY: Sự kiện báo động từ ${fullDetectorInfo}${zoneName}${readingInfo}.`;
                }
            } else if (eventType === "Fault") {
                // Điều chỉnh logic mô tả lỗi bao gồm Địa chỉ
                description = `LỖI THIẾT BỊ: ${fullDetectorInfo}${zoneName} báo lỗi${readingInfo}.`;
                // Có thể thêm logic chi tiết hơn về loại lỗi nếu có thông tin (ví dụ: đứt dây, lỗi cảm biến...)
            } else if (
                eventType === "Restore" &&
                updatedDetector.status === "Normal"
            ) {
                if (oldStatus === "Alarm") {
                    description = `KHÔI PHỤC: Trạng thái báo động cháy đã được xóa cho ${fullDetectorInfo}${zoneName}.`;
                } else if (oldStatus === "Fault") {
                    description = `KHÔI PHỤC: Lỗi thiết bị đã được khắc phục cho ${fullDetectorInfo}${zoneName}.`;
                } else {
                    description = `KHÔI PHỤC: ${fullDetectorInfo}${zoneName} trở về trạng thái bình thường.`;
                }
            }
            // EventType "Status Change" sẽ giữ mô tả mặc định nếu không rơi vào các trường hợp trên

            // Lấy panelId từ falcBoardId đã populate
            const panelId = updatedDetector.falcBoardId
                ? (updatedDetector.falcBoardId as any).panelId
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
                updatedDetector.zoneId
                    ? (updatedDetector.zoneId as any)._id
                    : null, // ID Zone
                panelId, // ID Panel
                logStatus, // Trạng thái log
                {
                    last_reading: updatedDetector.last_reading,
                    old_status: oldStatus,
                    new_status: updatedDetector.status,
                    detector_address: updatedDetector.detector_address, // Thêm địa chỉ vào details
                    loop_number: updatedDetector.falcBoardId
                        ? updatedDetector.falcBoardId.loop_number
                        : null, // Thêm số vòng lặp vào details
                }
            );
        }
        // --- KẾT THÚC GHI LOG ---

        // Populate lại đầy đủ thông tin cho response sau khi save
        const finalDetector = await DetectorModel.findById(updatedDetector._id)
            .populate({
                path: "falcBoardId",
                populate: {
                    path: "panelId",
                    select: "status",
                },
                select: "panelId loop_number is_active",
            })
            .populate("zoneId", "name");

        res.status(200).json({
            success: true,
            message: "Cập nhật trạng thái đầu báo thành công.",
            data: finalDetector,
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
                "Đã xảy ra lỗi khi cập nhật trạng thái đầu báo với ID " +
                    req.params.id,
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
