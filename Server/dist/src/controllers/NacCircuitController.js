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
exports.getCircuitsByNacBoardId = exports.deleteNacCircuit = exports.deactivateCircuit = exports.activateCircuit = exports.updateNacCircuit = exports.getNacCircuitById = exports.getAllNacCircuits = exports.createNacCircuit = void 0;
// Import các Model, mongoose và hàm ghi log cần thiết
const mongoose_1 = __importDefault(require("mongoose"));
const NacCircuitModel_1 = __importDefault(require("../models/NacCircuitModel"));
const NacBoardModel_1 = __importDefault(require("../models/NacBoardModel"));
const ZoneModel_1 = __importDefault(require("../models/ZoneModel"));
const EventLogController_1 = require("./EventLogController");
/**
 * Create a new NAC Circuit
 */
const createNacCircuit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Kiểm tra nacBoardId và zoneId có được cung cấp và hợp lệ không
        if (!req.body.nacBoardId ||
            !mongoose_1.default.Types.ObjectId.isValid(req.body.nacBoardId)) {
            return res.status(400).json({
                success: false,
                message: "NacBoard ID không hợp lệ hoặc bị thiếu.",
            });
        }
        if (!req.body.zoneId ||
            !mongoose_1.default.Types.ObjectId.isValid(req.body.zoneId)) {
            return res.status(400).json({
                success: false,
                message: "Zone ID không hợp lệ hoặc bị thiếu.",
            });
        }
        // Kiểm tra nacBoardId và zoneId có tồn tại không
        const nacBoard = yield NacBoardModel_1.default.findById(req.body.nacBoardId);
        if (!nacBoard) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Bo mạch NAC với ID " + req.body.nacBoardId,
            });
        }
        const zone = yield ZoneModel_1.default.findById(req.body.zoneId);
        if (!zone) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Vùng (Zone) với ID " + req.body.zoneId,
            });
        }
        const requestedCircuitNumber = req.body.circuit_number;
        const maxCircuits = nacBoard.circuit_count;
        if (requestedCircuitNumber < 1 ||
            requestedCircuitNumber > maxCircuits) {
            return res.status(400).json({
                success: false,
                message: `Bo mạch NAC "${nacBoard.name}". Chỉ cho phép gắn ${maxCircuits} mạch circuit.`,
            });
        }
        const newNacCircuit = new NacCircuitModel_1.default(req.body);
        const savedCircuit = yield newNacCircuit.save();
        const result = yield NacCircuitModel_1.default.findById(savedCircuit._id)
            .populate({
            path: "nacBoardId",
            populate: { path: "panelId", select: "name panel_type" },
        })
            .populate("zoneId", "name description");
        res.status(201).json({
            success: true,
            message: "Tạo Mạch NACcircuit thành công.",
            data: result,
        });
    }
    catch (error) {
        console.error("Lỗi khi tạo Mạch NAC:", error);
        // Xử lý lỗi unique index kết hợp (nacBoardId + circuit_number)
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: "Số mạch đã tồn tại trên bo mạch NAC này.",
            });
        }
        else if (error.name === "ValidationError") {
            // Lỗi validation của Mongoose
            res.status(400).json({
                success: false,
                message: "Lỗi xác thực dữ liệu: " + error.message,
            });
        }
        else if (error.kind === "ObjectId") {
            // Lỗi CastError cho các ID trong body
            return res.status(400).json({
                success: false,
                message: "Định dạng ID không hợp lệ cho NacBoard hoặc Zone.",
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: error.message || "Đã xảy ra lỗi khi tạo Mạch NAC.",
            });
        }
    }
});
exports.createNacCircuit = createNacCircuit;
/**
 * Get all NAC Circuits with optional filtering and pagination
 */
const getAllNacCircuits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = {};
        if (req.query.nacBoardId) {
            if (!mongoose_1.default.Types.ObjectId.isValid(req.query.nacBoardId)) {
                return res.status(400).json({
                    success: false,
                    message: "NacBoard ID trong tham số truy vấn không hợp lệ.",
                });
            }
            filter.nacBoardId = req.query.nacBoardId;
        }
        if (req.query.zoneId) {
            // Thêm lọc theo zoneId
            if (!mongoose_1.default.Types.ObjectId.isValid(req.query.zoneId)) {
                return res.status(400).json({
                    success: false,
                    message: "Zone ID trong tham số truy vấn không hợp lệ.",
                });
            }
            filter.zoneId = req.query.zoneId;
        }
        if (req.query.status)
            filter.status = req.query.status;
        if (req.query.output_type)
            filter.output_type = req.query.output_type;
        if (req.query.is_active !== undefined)
            filter.is_active = req.query.is_active === "true"; // Chuyển string "true"/"false" sang boolean
        // Phân trang (Thêm logic phân trang giống Detector Controller)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;
        const circuits = yield NacCircuitModel_1.default.find(filter)
            .populate({
            path: "nacBoardId",
            populate: { path: "panelId", select: "name panel_type" },
        }) // Populate NacBoard và Panel
            .populate("zoneId", "name description") // Populate Zone
            .skip(skip) // Thêm skip
            .limit(limit) // Thêm limit
            .sort({ nacBoardId: 1, circuit_number: 1 }); // Sắp xếp mặc định theo board và circuit number
        // Lấy tổng số document cho phân trang (Thêm logic countDocuments)
        const total = yield NacCircuitModel_1.default.countDocuments(filter);
        res.status(200).json({
            success: true,
            count: circuits.length,
            total, // Thêm total
            page, // Thêm page
            pages: Math.ceil(total / limit), // Thêm pages
            data: circuits,
        });
    }
    catch (error) {
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
            message: error.message || "Đã xảy ra lỗi khi lấy danh sách Mạch NAC.",
        });
    }
});
exports.getAllNacCircuits = getAllNacCircuits;
/**
 * Get NAC Circuit by ID
 */
const getNacCircuitById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Kiểm tra ID hợp lệ
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Mạch NAC với ID " + req.params.id,
            });
        }
        const circuit = yield NacCircuitModel_1.default.findById(req.params.id)
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
    }
    catch (error) {
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
            message: error.message || "Lỗi khi lấy Mạch NAC với ID " + req.params.id,
        });
    }
});
exports.getNacCircuitById = getNacCircuitById;
/**
 * Update NAC Circuit by ID
 */
const updateNacCircuit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Kiểm tra ID hợp lệ
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Mạch NAC với ID " + req.params.id,
            });
        }
        // Nếu nacBoardId được gửi trong body, kiểm tra nó có hợp lệ và tồn tại không
        if (req.body.nacBoardId !== undefined &&
            req.body.nacBoardId !== null &&
            req.body.nacBoardId !== "") {
            if (!mongoose_1.default.Types.ObjectId.isValid(req.body.nacBoardId)) {
                return res.status(400).json({
                    success: false,
                    message: "NacBoard ID mới không hợp lệ.",
                });
            }
            else {
                const nacBoard = yield NacBoardModel_1.default.findById(req.body.nacBoardId);
                if (!nacBoard) {
                    return res.status(404).json({
                        success: false,
                        message: "Không tìm thấy Bo mạch NAC với ID mới " +
                            req.body.nacBoardId,
                    });
                }
            }
        }
        // Nếu zoneId được gửi trong body, kiểm tra nó có hợp lệ và tồn tại không
        if (req.body.zoneId !== undefined &&
            req.body.zoneId !== null &&
            req.body.zoneId !== "") {
            if (!mongoose_1.default.Types.ObjectId.isValid(req.body.zoneId)) {
                return res.status(400).json({
                    success: false,
                    message: "Zone ID mới không hợp lệ.",
                });
            }
            else {
                const zone = yield ZoneModel_1.default.findById(req.body.zoneId);
                if (!zone) {
                    return res.status(404).json({
                        success: false,
                        message: "Không tìm thấy Vùng (Zone) với ID mới " +
                            req.body.zoneId,
                    });
                }
            }
        }
        // Lấy thông tin mạch gốc trước khi update để so sánh trạng thái
        const originalCircuit = yield NacCircuitModel_1.default.findById(req.params.id).lean();
        const updatedCircuit = yield NacCircuitModel_1.default.findByIdAndUpdate(req.params.id, req.body, // Truyền trực tiếp req.body (đảm bảo body dùng output_type và zoneId)
        { new: true, runValidators: true })
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
        res.status(200).json({
            success: true,
            message: "Cập nhật thông tin Mạch NAC thành công.",
            data: updatedCircuit,
        });
    }
    catch (error) {
        console.error("Lỗi khi cập nhật thông tin Mạch NAC:", error);
        // Xử lý lỗi unique index kết hợp (nacBoardId + circuit_number)
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: "Số mạch đã tồn tại trên bo mạch NAC này.",
            });
        }
        else if (error.name === "ValidationError") {
            res.status(400).json({
                success: false,
                message: "Lỗi xác thực dữ liệu: " + error.message,
            });
        }
        else if (error.kind === "ObjectId") {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Mạch NAC với ID " + req.params.id,
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: error.message ||
                    "Lỗi khi cập nhật thông tin Mạch NAC với ID " +
                        req.params.id,
            });
        }
    }
});
exports.updateNacCircuit = updateNacCircuit;
/**
 * Activate NAC Circuit - HÀM NÀY CẦN GỌI GHI LOG
 */
const activateCircuit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Kiểm tra ID hợp lệ
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Mạch NACcircuit với ID " + req.params.id,
            });
        }
        // Lấy thông tin mạch gốc trước khi update để so sánh trạng thái
        const originalCircuit = yield NacCircuitModel_1.default.findById(req.params.id).lean();
        // Cập nhật thông tin
        const updatedCircuit = yield NacCircuitModel_1.default.findByIdAndUpdate(req.params.id, {
            is_active: true,
            status: "Normal", // Khi activate, status nên về Normal
        }, { new: true } // Trả về document sau khi update
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
        if (originalCircuit &&
            (originalCircuit.status !== updatedCircuit.status ||
                originalCircuit.is_active !== updatedCircuit.is_active)) {
            let eventType = "StatusChange";
            let description = `Trạng thái Mạch NAC số ${updatedCircuit.circuit_number} thay đổi từ "${originalCircuit.status}" sang "${updatedCircuit.status}".`;
            if (originalCircuit.status !== updatedCircuit.status &&
                updatedCircuit.status === "Normal" &&
                (originalCircuit.status === "Active" ||
                    originalCircuit.status === "Fault")) {
                eventType = "Restore";
                description = `Khôi phục trạng thái bình thường cho Mạch NAC số ${updatedCircuit.circuit_number}.`;
            }
            else if (originalCircuit.is_active === false &&
                updatedCircuit.is_active === true) {
                eventType = "ConfigChange";
                description = `Mạch NAC số ${updatedCircuit.circuit_number} được cấu hình HOẠT ĐỘNG (is_active = true).`;
            }
            // Có thể thêm các trường hợp logic khác tùy ý
            // Lấy panelId và zoneId từ document đã được populate
            const panelId = updatedCircuit.nacBoardId
                ? updatedCircuit.nacBoardId.panelId
                : null;
            const zoneId = updatedCircuit.zoneId
                ? updatedCircuit.zoneId._id
                : null;
            // Trạng thái log: Info cho ConfigChange, Restore, StatusChange (khi về Normal)
            const logStatus = "Info";
            // Gọi hàm ghi log
            yield (0, EventLogController_1.createEventLog)(eventType, description, "NAC", // Loại nguồn
            updatedCircuit._id, // ID nguồn
            zoneId, // ID Zone
            panelId, // ID Panel
            logStatus // Trạng thái log
            );
        }
        // --- KẾT THÚC GHI LOG ---
        res.status(200).json({
            success: true,
            message: "Kích hoạt Mạch NAC thành công.",
            data: updatedCircuit,
        });
    }
    catch (error) {
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
            message: error.message ||
                "Đã xảy ra lỗi khi kích hoạt Mạch NAC với ID " + req.params.id,
        });
    }
});
exports.activateCircuit = activateCircuit;
/**
 * Deactivate NAC Circuit - HÀM NÀY CẦN GỌI GHI LOG
 */
const deactivateCircuit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Kiểm tra ID hợp lệ
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Mạch NAC với ID " + req.params.id,
            });
        }
        // Lấy thông tin mạch gốc trước khi update để so sánh trạng thái
        const originalCircuit = yield NacCircuitModel_1.default.findById(req.params.id).lean();
        // Cập nhật thông tin
        const updatedCircuit = yield NacCircuitModel_1.default.findByIdAndUpdate(req.params.id, {
            is_active: false,
            status: "Disabled", // Chuyển status sang Disabled khi deactive
        }, { new: true } // Trả về document sau khi update
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
        if (originalCircuit &&
            (originalCircuit.status !== updatedCircuit.status ||
                originalCircuit.is_active !== updatedCircuit.is_active)) {
            let eventType = "StatusChange"; // Mặc định
            let description = `Trạng thái Mạch NAC số ${updatedCircuit.circuit_number} thay đổi từ "${originalCircuit.status}" sang "${updatedCircuit.status}".`;
            if (updatedCircuit.status === "Disabled" &&
                originalCircuit.status !== "Disabled") {
                eventType = "Deactivation";
                description = `Hủy kích hoạt Mạch NAC số ${updatedCircuit.circuit_number}.`;
            }
            else if (originalCircuit.is_active === true &&
                updatedCircuit.is_active === false) {
                eventType = "ConfigChange";
                description = `Mạch NAC số ${updatedCircuit.circuit_number} được cấu hình KHÔNG hoạt động (is_active = false). Trạng thái vẫn là "${updatedCircuit.status}".`;
            }
            // Lấy panelId và zoneId từ document đã được populate
            const panelId = updatedCircuit.nacBoardId
                ? updatedCircuit.nacBoardId.panelId
                : null;
            const zoneId = updatedCircuit.zoneId
                ? updatedCircuit.zoneId._id
                : null;
            // Trạng thái log: Info cho các loại log này
            const logStatus = "Info";
            // Gọi hàm ghi log
            yield (0, EventLogController_1.createEventLog)(eventType, description, "NAC", // Loại nguồn
            updatedCircuit._id, // ID nguồn
            zoneId, // ID Zone
            panelId, // ID Panel
            logStatus, // Trạng thái log
            {
            /* chi tiết */
            });
        }
        // --- KẾT THÚC GHI LOG ---
        res.status(200).json({
            success: true,
            message: "Hủy kích hoạt Mạch NAC thành công.",
            data: updatedCircuit,
        });
    }
    catch (error) {
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
            message: error.message ||
                "Đã xảy ra lỗi khi hủy kích hoạt Mạch NAC với ID " +
                    req.params.id,
        });
    }
});
exports.deactivateCircuit = deactivateCircuit;
/**
 * Delete NAC Circuit by ID
 * @route DELETE /api/nac-circuits/:id
 */
const deleteNacCircuit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Kiểm tra ID hợp lệ
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Mạch NAC với ID " + req.params.id,
            });
        }
        // NacCircuit không có các document con liên kết, nên có thể xóa trực tiếp
        // Tùy chọn: Populate trước khi xóa để lấy thông tin ghi log
        const deletedCircuit = yield NacCircuitModel_1.default.findByIdAndDelete(req.params.id).lean();
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
    }
    catch (error) {
        console.error("Lỗi khi xóa Mạch NAC:", error);
        if (error.kind === "ObjectId") {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Mạch NAC với ID " + req.params.id,
            });
        }
        res.status(500).json({
            success: false,
            message: error.message ||
                "Không thể xóa Mạch NAC với ID " + req.params.id,
        });
    }
});
exports.deleteNacCircuit = deleteNacCircuit;
/**
 * Get NAC Circuits by NAC Board ID
 * @route GET /api/nac-boards/:nacBoardId/circuits
 */
const getCircuitsByNacBoardId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nacBoardId } = req.params;
        // Kiểm tra nacBoardId hợp lệ
        if (!mongoose_1.default.Types.ObjectId.isValid(nacBoardId)) {
            return res
                .status(400)
                .json({ success: false, message: "NacBoard ID không hợp lệ." });
        }
        // Tùy chọn: Kiểm tra NacBoard có tồn tại không (đảm bảo lấy circuits cho board có thật)
        // const nacBoard = await NacBoardModel.findById(nacBoardId);
        // if (!nacBoard) {
        //      return res.status(404).json({ success: false, message: "Không tìm thấy Bo mạch NAC với ID " + nacBoardId });
        // }
        const circuits = yield NacCircuitModel_1.default.find({ nacBoardId })
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
    }
    catch (error) {
        console.error("Lỗi khi lấy danh sách Mạch NAC theo NacBoard ID:", error);
        if (error.kind === "ObjectId") {
            return res
                .status(400)
                .json({ success: false, message: "ID không hợp lệ." });
        }
        res.status(500).json({
            success: false,
            message: error.message ||
                "Đã xảy ra lỗi khi lấy danh sách Mạch NAC theo NacBoard ID.",
        });
    }
});
exports.getCircuitsByNacBoardId = getCircuitsByNacBoardId;
//# sourceMappingURL=NacCircuitController.js.map