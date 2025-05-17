// Import các Model, mongoose và hàm ghi log cần thiết
import mongoose from "mongoose";
import NacCircuitModel from "../models/NacCircuitModel";
import NacBoardModel from "../models/NacBoardModel";
import ZoneModel from "../models/ZoneModel";
import { createEventLog } from "./EventLogController";

/**
 * Create a new NAC Circuit
 */
export const createNacCircuit = async (req: any, res: any) => {
    try {
        // Kiểm tra nacBoardId và zoneId có được cung cấp và hợp lệ không
        if (
            !req.body.nacBoardId ||
            !mongoose.Types.ObjectId.isValid(req.body.nacBoardId)
        ) {
            return res.status(400).json({
                success: false,
                message: "NacBoard ID không hợp lệ hoặc bị thiếu.",
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

        // Kiểm tra nacBoardId và zoneId có tồn tại không
        const nacBoard = await NacBoardModel.findById(req.body.nacBoardId);
        if (!nacBoard) {
            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy Bo mạch NAC với ID " + req.body.nacBoardId,
            });
        }
        const zone = await ZoneModel.findById(req.body.zoneId);
        if (!zone) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Vùng (Zone) với ID " + req.body.zoneId,
            });
        }

        // Tạo NacCircuit mới bằng cách truyền trực tiếp req.body
        // Đảm bảo req.body chứa output_type và zoneId
        const newNacCircuit = new NacCircuitModel(req.body);

        const savedCircuit = await newNacCircuit.save();

        // Populate các trường liên kết trước khi trả về
        const result = await NacCircuitModel.findById(savedCircuit._id)
            .populate({
                path: "nacBoardId",
                populate: { path: "panelId", select: "name panel_type" },
            }) // Populate NacBoard và populate tiếp Panel
            .populate("zoneId", "name description"); // Populate Zone

        res.status(201).json({
            success: true,
            message: "Tạo Mạch NAC thành công.",
            data: result,
        });
    } catch (error: any) {
        console.error("Lỗi khi tạo Mạch NAC:", error);
        // Xử lý lỗi unique index kết hợp (nacBoardId + circuit_number)
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: "Số mạch đã tồn tại trên bo mạch NAC này.",
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
                message: "Định dạng ID không hợp lệ cho NacBoard hoặc Zone.",
            });
        } else {
            res.status(500).json({
                success: false,
                message: error.message || "Đã xảy ra lỗi khi tạo Mạch NAC.",
            });
        }
    }
};

/**
 * Get all NAC Circuits with optional filtering and pagination
 */
export const getAllNacCircuits = async (req: any, res: any) => {
    try {
        const filter: any = {};

        if (req.query.nacBoardId) {
            if (!mongoose.Types.ObjectId.isValid(req.query.nacBoardId)) {
                return res.status(400).json({
                    success: false,
                    message: "NacBoard ID trong tham số truy vấn không hợp lệ.",
                });
            }
            filter.nacBoardId = req.query.nacBoardId;
        }
        if (req.query.zoneId) {
            // Thêm lọc theo zoneId
            if (!mongoose.Types.ObjectId.isValid(req.query.zoneId)) {
                return res.status(400).json({
                    success: false,
                    message: "Zone ID trong tham số truy vấn không hợp lệ.",
                });
            }
            filter.zoneId = req.query.zoneId;
        }
        if (req.query.status) filter.status = req.query.status;
        if (req.query.output_type) filter.output_type = req.query.output_type;
        if (req.query.is_active !== undefined)
            filter.is_active = req.query.is_active === "true"; // Chuyển string "true"/"false" sang boolean

        // Phân trang (Thêm logic phân trang giống Detector Controller)
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 100;
        const skip = (page - 1) * limit;

        const circuits = await NacCircuitModel.find(filter)
            .populate({
                path: "nacBoardId",
                populate: { path: "panelId", select: "name panel_type" },
            }) // Populate NacBoard và Panel
            .populate("zoneId", "name description") // Populate Zone
            .skip(skip) // Thêm skip
            .limit(limit) // Thêm limit
            .sort({ nacBoardId: 1, circuit_number: 1 }); // Sắp xếp mặc định theo board và circuit number

        // Lấy tổng số document cho phân trang (Thêm logic countDocuments)
        const total = await NacCircuitModel.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: circuits.length,
            total, // Thêm total
            page, // Thêm page
            pages: Math.ceil(total / limit), // Thêm pages
            data: circuits,
        });
    } catch (error: any) {
        console.error("Lỗi khi lấy danh sách Mạch NAC:", error);
        if (error.kind === "ObjectId") {
            // Xử lý lỗi CastError
            return res.status(400).json({
                success: false,
                message: "Định dạng ID không hợp lệ trong truy vấn.",
            });
        }
        res.status(500).json({
            success: false,
            message:
                error.message || "Đã xảy ra lỗi khi lấy danh sách Mạch NAC.",
        });
    }
};

/**
 * Get NAC Circuit by ID
 */
export const getNacCircuitById = async (req: any, res: any) => {
    try {
        // Kiểm tra ID hợp lệ
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Mạch NAC với ID " + req.params.id,
            });
        }

        const circuit = await NacCircuitModel.findById(req.params.id)
            .populate({
                path: "nacBoardId",
                populate: { path: "panelId", select: "name panel_type" },
            }) // Populate NacBoard và Panel
            .populate("zoneId", "name description"); // Populate Zone

        if (!circuit) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy Mạch NAC với ID " + req.params.id,
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: circuit,
        });
    } catch (error: any) {
        console.error("Lỗi khi lấy Mạch NAC theo ID:", error);
        if (error.kind === "ObjectId") {
            // Xử lý lỗi CastError
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Mạch NAC với ID " + req.params.id,
            });
        }
        res.status(500).json({
            success: false,
            message:
                error.message || "Lỗi khi lấy Mạch NAC với ID " + req.params.id,
        });
    }
};

/**
 * Update NAC Circuit by ID
 */
export const updateNacCircuit = async (req: any, res: any) => {
    try {
        // Kiểm tra ID hợp lệ
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Mạch NAC với ID " + req.params.id,
            });
        }

        // Nếu nacBoardId được gửi trong body, kiểm tra nó có hợp lệ và tồn tại không
        if (
            req.body.nacBoardId !== undefined &&
            req.body.nacBoardId !== null &&
            req.body.nacBoardId !== ""
        ) {
            if (!mongoose.Types.ObjectId.isValid(req.body.nacBoardId)) {
                return res.status(400).json({
                    success: false,
                    message: "NacBoard ID mới không hợp lệ.",
                });
            } else {
                const nacBoard = await NacBoardModel.findById(
                    req.body.nacBoardId
                );
                if (!nacBoard) {
                    return res.status(404).json({
                        success: false,
                        message:
                            "Không tìm thấy Bo mạch NAC với ID mới " +
                            req.body.nacBoardId,
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

        // Lấy thông tin mạch gốc trước khi update để so sánh trạng thái
        const originalCircuit = await NacCircuitModel.findById(
            req.params.id
        ).lean();

        const updatedCircuit = await NacCircuitModel.findByIdAndUpdate(
            req.params.id,
            req.body, // Truyền trực tiếp req.body (đảm bảo body dùng output_type và zoneId)
            { new: true, runValidators: true }
        )
            .populate({
                path: "nacBoardId",
                populate: { path: "panelId", select: "name panel_type" },
            }) // Populate NacBoard và Panel
            .populate("zoneId", "name description"); // Populate Zone

        if (!updatedCircuit) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy Mạch NAC với ID " + req.params.id,
            });
            return;
        }

        // --- Tích hợp ghi Log sự kiện tại đây (nếu status thay đổi qua hàm này) ---
        // Chỉ ghi log nếu originalCircuit tồn tại và status đã thay đổi
        // if (
        //     originalCircuit &&
        //     originalCircuit.status !== updatedCircuit.status
        // ) {
        //     const eventType =
        //         updatedCircuit.status === "Active"
        //             ? "Activation"
        //             : updatedCircuit.status === "Fault"
        //             ? "Fault"
        //             : originalCircuit.status === "Active"
        //             ? "Deactivation"
        //             : originalCircuit.status === "Fault"
        //             ? "Restore"
        //             : "StatusChange"; // Xác định loại log (Activation, Fault, Deactivation, Restore, StatusChange)

        //     let description = `Trạng thái Mạch NAC số ${updatedCircuit.circuit_number} thay đổi từ "${originalCircuit.status}" sang "${updatedCircuit.status}".`;
        //     if (eventType === "Activation")
        //         description = `Kích hoạt Mạch NAC số ${updatedCircuit.circuit_number}`;
        //     if (eventType === "Fault")
        //         description = `Lỗi tại Mạch NAC số ${updatedCircuit.circuit_number}`;
        //     if (
        //         eventType === "Deactivation" &&
        //         updatedCircuit.status === "Disabled"
        //     )
        //         description = `Hủy kích hoạt Mạch NAC số ${updatedCircuit.circuit_number}`;
        //     if (eventType === "Restore" && updatedCircuit.status === "Normal")
        //         description = `Khôi phục trạng thái bình thường cho Mạch NAC số ${updatedCircuit.circuit_number}`;

        //     // Lấy panelId và zoneId từ document đã được populate
        //     // Cần kiểm tra null/undefined an toàn hơn trong JS thuần
        //     const panelId = updatedCircuit.nacBoardId
        //         ? (updatedCircuit.nacBoardId as any).panelId
        //         : null;
        //     const zoneId = updatedCircuit.zoneId
        //         ? (updatedCircuit.zoneId as any)._id
        //         : null; // ZoneId ở đây là populated object, lấy _id

        //     // Xác định trạng thái log ('Active' cho Active/Fault, 'Info' cho Normal/Disabled)
        //     const logStatus =
        //         updatedCircuit.status === "Active" ||
        //         updatedCircuit.status === "Fault"
        //             ? "Active"
        //             : "Info";

        //     // Gọi hàm ghi log
        //     await createEventLog(
        //         eventType,
        //         description,
        //         "NAC", // Loại nguồn
        //         updatedCircuit._id, // ID nguồn
        //         zoneId, // ID Zone
        //         panelId, // ID Panel
        //         logStatus, // Trạng thái log
        //         {
        //             /* Có thể thêm chi tiết khác nếu cần */
        //         }
        //     );
        // }
        // --- Kết thúc tích hợp ghi Log ---

        res.status(200).json({
            success: true,
            message: "Cập nhật thông tin Mạch NAC thành công.",
            data: updatedCircuit,
        });
    } catch (error: any) {
        console.error("Lỗi khi cập nhật thông tin Mạch NAC:", error);
        // Xử lý lỗi unique index kết hợp (nacBoardId + circuit_number)
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: "Số mạch đã tồn tại trên bo mạch NAC này.",
            });
        } else if (error.name === "ValidationError") {
            res.status(400).json({
                success: false,
                message: "Lỗi xác thực dữ liệu: " + error.message,
            });
        } else if (error.kind === "ObjectId") {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Mạch NAC với ID " + req.params.id,
            });
        } else {
            res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "Lỗi khi cập nhật thông tin Mạch NAC với ID " +
                        req.params.id,
            });
        }
    }
};

/**
 * Activate NAC Circuit - HÀM NÀY CẦN GỌI GHI LOG
 */
export const activateCircuit = async (req: any, res: any) => {
    try {
        // Kiểm tra ID hợp lệ
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Mạch NAC với ID " + req.params.id,
            });
        }

        // Lấy thông tin mạch gốc trước khi update để so sánh trạng thái
        const originalCircuit = await NacCircuitModel.findById(
            req.params.id
        ).lean();

        // Cập nhật thông tin
        const updatedCircuit = await NacCircuitModel.findByIdAndUpdate(
            req.params.id,
            {
                is_active: true,
                status: "Normal", // Khi activate, status nên về Normal
            },
            { new: true } // Trả về document sau khi update
        )
            .populate({
                path: "nacBoardId",
                populate: { path: "panelId", select: "name panel_type" },
            }) // Populate NacBoard và Panel
            .populate("zoneId", "name description"); // Populate Zone

        if (!updatedCircuit) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy Mạch NAC với ID " + req.params.id,
            });
            return;
        }

        // --- GHI LOG SỰ KIỆN KHI TRẠNG THÁI THAY ĐỔI ---
        // Chỉ ghi log nếu originalCircuit tồn tại và status đã thay đổi HOẶC is_active thay đổi
        if (
            originalCircuit &&
            (originalCircuit.status !== updatedCircuit.status ||
                originalCircuit.is_active !== updatedCircuit.is_active)
        ) {
            let eventType: any = "StatusChange";
            let description = `Trạng thái Mạch NAC số ${updatedCircuit.circuit_number} thay đổi từ "${originalCircuit.status}" sang "${updatedCircuit.status}".`;

            if (
                originalCircuit.status !== updatedCircuit.status &&
                updatedCircuit.status === "Normal" &&
                (originalCircuit.status === "Active" ||
                    originalCircuit.status === "Fault")
            ) {
                eventType = "Restore";
                description = `Khôi phục trạng thái bình thường cho Mạch NAC số ${updatedCircuit.circuit_number}.`;
            } else if (
                originalCircuit.is_active === false &&
                updatedCircuit.is_active === true
            ) {
                eventType = "ConfigChange";
                description = `Mạch NAC số ${updatedCircuit.circuit_number} được cấu hình HOẠT ĐỘNG (is_active = true).`;
            }
            // Có thể thêm các trường hợp logic khác tùy ý

            // Lấy panelId và zoneId từ document đã được populate
            const panelId = updatedCircuit.nacBoardId
                ? (updatedCircuit.nacBoardId as any).panelId
                : null;
            const zoneId = updatedCircuit.zoneId
                ? (updatedCircuit.zoneId as any)._id
                : null;

            // Trạng thái log: Info cho ConfigChange, Restore, StatusChange (khi về Normal)
            const logStatus = "Info";

            // Gọi hàm ghi log
            await createEventLog(
                eventType,
                description,
                "NAC", // Loại nguồn
                updatedCircuit._id, // ID nguồn
                zoneId, // ID Zone
                panelId, // ID Panel
                logStatus, // Trạng thái log
                {
                    /* chi tiết */
                }
            );
        }
        // --- KẾT THÚC GHI LOG ---

        res.status(200).json({
            success: true,
            message: "Kích hoạt Mạch NAC thành công.",
            data: updatedCircuit,
        });
    } catch (error: any) {
        console.error("Lỗi khi kích hoạt Mạch NAC:", error);
        if (error.kind === "ObjectId") {
            // Xử lý lỗi CastError
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Mạch NAC với ID " + req.params.id,
            });
        }
        res.status(500).json({
            success: false,
            message:
                error.message ||
                "Đã xảy ra lỗi khi kích hoạt Mạch NAC với ID " + req.params.id,
        });
    }
};

/**
 * Deactivate NAC Circuit - HÀM NÀY CẦN GỌI GHI LOG
 */
export const deactivateCircuit = async (req: any, res: any) => {
    try {
        // Kiểm tra ID hợp lệ
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Mạch NAC với ID " + req.params.id,
            });
        }

        // Lấy thông tin mạch gốc trước khi update để so sánh trạng thái
        const originalCircuit = await NacCircuitModel.findById(
            req.params.id
        ).lean();

        // Cập nhật thông tin
        const updatedCircuit = await NacCircuitModel.findByIdAndUpdate(
            req.params.id,
            {
                is_active: false,
                status: "Disabled", // Chuyển status sang Disabled khi deactive
            },
            { new: true } // Trả về document sau khi update
        )
            .populate({
                path: "nacBoardId",
                populate: { path: "panelId", select: "name panel_type" },
            }) // Populate NacBoard và Panel
            .populate("zoneId", "name description"); // Populate Zone

        if (!updatedCircuit) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy Mạch NAC với ID " + req.params.id,
            });
            return;
        }

        // --- GHI LOG SỰ KIỆN KHI TRẠNG THÁI THAY ĐỔI ---
        // Chỉ ghi log nếu originalCircuit tồn tại và status đã thay đổi HOẶC is_active thay đổi
        if (
            originalCircuit &&
            (originalCircuit.status !== updatedCircuit.status ||
                originalCircuit.is_active !== updatedCircuit.is_active)
        ) {
            let eventType: any = "StatusChange"; // Mặc định
            let description = `Trạng thái Mạch NAC số ${updatedCircuit.circuit_number} thay đổi từ "${originalCircuit.status}" sang "${updatedCircuit.status}".`;

            if (
                updatedCircuit.status === "Disabled" &&
                originalCircuit.status !== "Disabled"
            ) {
                eventType = "Deactivation";
                description = `Hủy kích hoạt Mạch NAC số ${updatedCircuit.circuit_number}.`;
            } else if (
                originalCircuit.is_active === true &&
                updatedCircuit.is_active === false
            ) {
                eventType = "ConfigChange";
                description = `Mạch NAC số ${updatedCircuit.circuit_number} được cấu hình KHÔNG hoạt động (is_active = false). Trạng thái vẫn là "${updatedCircuit.status}".`;
            }

            // Lấy panelId và zoneId từ document đã được populate
            const panelId = updatedCircuit.nacBoardId
                ? (updatedCircuit.nacBoardId as any).panelId
                : null;
            const zoneId = updatedCircuit.zoneId
                ? (updatedCircuit.zoneId as any)._id
                : null;

            // Trạng thái log: Info cho các loại log này
            const logStatus = "Info";

            // Gọi hàm ghi log
            await createEventLog(
                eventType,
                description,
                "NAC", // Loại nguồn
                updatedCircuit._id, // ID nguồn
                zoneId, // ID Zone
                panelId, // ID Panel
                logStatus, // Trạng thái log
                {
                    /* chi tiết */
                }
            );
        }
        // --- KẾT THÚC GHI LOG ---

        res.status(200).json({
            success: true,
            message: "Hủy kích hoạt Mạch NAC thành công.",
            data: updatedCircuit,
        });
    } catch (error: any) {
        console.error("Lỗi khi hủy kích hoạt Mạch NAC:", error);
        if (error.kind === "ObjectId") {
            // Xử lý lỗi CastError
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Mạch NAC với ID " + req.params.id,
            });
        }
        res.status(500).json({
            success: false,
            message:
                error.message ||
                "Đã xảy ra lỗi khi hủy kích hoạt Mạch NAC với ID " +
                    req.params.id,
        });
    }
};

/**
 * Delete NAC Circuit by ID
 * @route DELETE /api/nac-circuits/:id
 */
export const deleteNacCircuit = async (req: any, res: any) => {
    try {
        // Kiểm tra ID hợp lệ
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Mạch NAC với ID " + req.params.id,
            });
        }

        // NacCircuit không có các document con liên kết, nên có thể xóa trực tiếp
        // Tùy chọn: Populate trước khi xóa để lấy thông tin ghi log
        const deletedCircuit = await NacCircuitModel.findByIdAndDelete(
            req.params.id
        ).lean();

        if (!deletedCircuit) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy Mạch NAC với ID " + req.params.id,
            });
            return;
        }

        // Tùy chọn: Ghi log sự kiện xóa
        // if (deletedCircuit) {
        //    const description = `Mạch NAC số ${deletedCircuit.circuit_number} đã bị xóa. (ID: ${deletedCircuit._id})`;
        //     // Lấy panelId và zoneId (ObjectId) từ document đã xóa
        //     // createEventLog chấp nhận ObjectId hoặc string, nên có thể truyền trực tiếp
        //     await createEventLog('ConfigChange', description, 'NAC', deletedCircuit._id, deletedCircuit.zoneId, deletedCircuit.nacBoardId, 'Info');
        // }
        // --- Kết thúc ghi Log ---

        res.status(200).json({
            success: true,
            message: "Xóa Mạch NAC thành công.",
        });
    } catch (error: any) {
        console.error("Lỗi khi xóa Mạch NAC:", error);
        if (error.kind === "ObjectId") {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Mạch NAC với ID " + req.params.id,
            });
        }
        res.status(500).json({
            success: false,
            message:
                error.message ||
                "Không thể xóa Mạch NAC với ID " + req.params.id,
        });
    }
};

/**
 * Get NAC Circuits by NAC Board ID
 * @route GET /api/nac-boards/:nacBoardId/circuits
 */
export const getCircuitsByNacBoardId = async (req: any, res: any) => {
    try {
        const { nacBoardId } = req.params;

        // Kiểm tra nacBoardId hợp lệ
        if (!mongoose.Types.ObjectId.isValid(nacBoardId)) {
            return res
                .status(400)
                .json({ success: false, message: "NacBoard ID không hợp lệ." });
        }
        // Tùy chọn: Kiểm tra NacBoard có tồn tại không (đảm bảo lấy circuits cho board có thật)
        // const nacBoard = await NacBoardModel.findById(nacBoardId);
        // if (!nacBoard) {
        //      return res.status(404).json({ success: false, message: "Không tìm thấy Bo mạch NAC với ID " + nacBoardId });
        // }

        const circuits = await NacCircuitModel.find({ nacBoardId })
            .populate({
                path: "nacBoardId",
                populate: { path: "panelId", select: "name panel_type" },
            }) // Populate NacBoard và Panel
            .populate("zoneId", "name description") // Populate Zone
            .sort({ circuit_number: 1 }); // Sắp xếp theo circuit number

        res.status(200).json({
            success: true,
            count: circuits.length,
            data: circuits,
        });
    } catch (error: any) {
        console.error(
            "Lỗi khi lấy danh sách Mạch NAC theo NacBoard ID:",
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
                "Đã xảy ra lỗi khi lấy danh sách Mạch NAC theo NacBoard ID.",
        });
    }
};
