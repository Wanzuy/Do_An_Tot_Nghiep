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
exports.getNacBoardsWithCircuits = exports.deleteNacBoard = exports.updateNacBoard = exports.getNacBoardById = exports.getAllNacBoards = exports.createNacBoard = exports.updateNacBoardStatus = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const NacBoardModel_1 = __importDefault(require("../models/NacBoardModel"));
const PanelModel_1 = __importDefault(require("../models/PanelModel"));
const NacCircuitModel_1 = __importDefault(require("../models/NacCircuitModel"));
/**
 * Update NAC board status by ID
 */
const updateNacBoardStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Kiểm tra ID hợp lệ
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bo mạch NAC với ID " + req.params.id,
            });
        }
        // Kiểm tra is_active có được cung cấp không
        if (req.body.is_active === undefined || req.body.is_active === null) {
            return res.status(400).json({
                success: false,
                message: "Trạng thái hoạt động (is_active) là bắt buộc.",
            });
        }
        const updatedNacBoard = yield NacBoardModel_1.default.findByIdAndUpdate(req.params.id, { is_active: req.body.is_active }, { new: true, runValidators: true }).populate("panelId", "name panel_type");
        if (!updatedNacBoard) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bo mạch NAC với ID " + req.params.id,
            });
        }
        res.status(200).json({
            success: true,
            message: `${req.body.is_active ? "Bật" : "Tắt"} bo mạch NAC thành công.`,
            data: updatedNacBoard,
        });
    }
    catch (error) {
        console.error("Lỗi khi cập nhật trạng thái bo mạch NAC:", error);
        if (error.kind === "ObjectId") {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bo mạch NAC với ID " + req.params.id,
            });
        }
        res.status(500).json({
            success: false,
            message: error.message ||
                "Lỗi khi cập nhật trạng thái bo mạch NAC với ID " + req.params.id,
        });
    }
});
exports.updateNacBoardStatus = updateNacBoardStatus;
/**
 * Create a new NAC board
 */
const createNacBoard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Kiểm tra panelId có được cung cấp và hợp lệ không
        if (!req.body.panelId ||
            !mongoose_1.default.Types.ObjectId.isValid(req.body.panelId)) {
            return res.status(400).json({
                success: false,
                message: "Panel ID không hợp lệ hoặc bị thiếu.",
            });
        } // Kiểm tra panelId có tồn tại trong collection Panel không
        const panel = yield PanelModel_1.default.findById(req.body.panelId);
        if (!panel) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tủ (Panel) với ID " + req.body.panelId,
            });
        } // Tạo NacBoard mới bằng cách truyền trực tiếp req.body
        const newNacBoard = new NacBoardModel_1.default(req.body); // Mongoose sẽ tự động lấy các trường trong schema
        const savedNacBoard = yield newNacBoard.save(); // Lưu vào database
        // Populate panelId trước khi trả về
        const result = yield NacBoardModel_1.default.findById(savedNacBoard._id).populate("panelId", "name panel_type");
        res.status(201).json({
            success: true,
            message: "Tạo bo mạch NAC thành công.",
            data: result,
        });
    }
    catch (error) {
        console.error("Lỗi khi tạo bo mạch NAC:", error); // Xử lý lỗi unique index kết hợp (panelId + name)
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: "Tên bo mạch đã tồn tại trong tủ này.",
            });
        }
        else if (error.name === "ValidationError") {
            // Lỗi validation của Mongoose
            res.status(400).json({
                success: false,
                message: "Lỗi xác thực dữ liệu: " + error.message,
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: error.message || "Đã xảy ra lỗi khi tạo bo mạch NAC.",
            });
        }
    }
});
exports.createNacBoard = createNacBoard;
/**
 * Get all NAC boards
 */
const getAllNacBoards = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = {}; // Object chứa điều kiện lọc // Lọc theo panelId nếu có query parameter
        if (req.query.panelId) {
            // Sử dụng panelId trong query
            if (!mongoose_1.default.Types.ObjectId.isValid(req.query.panelId)) {
                return res.status(400).json({
                    success: false,
                    message: "ID Panel trong tham số truy vấn không hợp lệ.",
                });
            }
            query.panelId = req.query.panelId; // Lọc theo panelId
        }
        const nacBoards = yield NacBoardModel_1.default.find(query)
            .populate("panelId", "name panel_type") // Populate panelId
            .sort({ createdAt: -1 }); // Mặc định sắp xếp theo thời gian tạo giảm dần
        // Thêm thông tin số lượng circuits thực tế cho mỗi board
        const nacBoardsWithCircuitCount = yield Promise.all(nacBoards.map((board) => __awaiter(void 0, void 0, void 0, function* () {
            const circuitCount = yield NacCircuitModel_1.default.countDocuments({
                nacBoardId: board._id,
            });
            return Object.assign(Object.assign({}, board.toObject()), { actual_circuit_count: circuitCount });
        })));
        res.status(200).json({
            success: true,
            count: nacBoardsWithCircuitCount.length,
            data: nacBoardsWithCircuitCount,
        });
    }
    catch (error) {
        console.error("Lỗi khi lấy danh sách bo mạch NAC:", error);
        if (error.kind === "ObjectId") {
            // Xử lý lỗi CastError (nếu có lỗi khác liên quan ID trong query)
            return res.status(400).json({
                success: false,
                message: "Định dạng ID không hợp lệ trong truy vấn.",
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || "Đã xảy ra lỗi khi lấy danh sách bo mạch NAC.",
        });
    }
});
exports.getAllNacBoards = getAllNacBoards;
/**
 * Get NAC board by ID
 */
const getNacBoardById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Kiểm tra ID hợp lệ
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bo mạch NAC với ID " + req.params.id,
            });
        }
        const nacBoard = yield NacBoardModel_1.default.findById(req.params.id).populate("panelId", // Populate panelId
        "name panel_type");
        if (!nacBoard) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy bo mạch NAC với ID " + req.params.id,
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: nacBoard,
        });
    }
    catch (error) {
        console.error("Lỗi khi lấy bo mạch NAC theo ID:", error);
        if (error.kind === "ObjectId") {
            // Xử lý lỗi CastError
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bo mạch NAC với ID " + req.params.id,
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || "Lỗi khi lấy bo mạch NAC với ID " + req.params.id,
        });
    }
});
exports.getNacBoardById = getNacBoardById;
/**
 * Update NAC board by ID
 */
const updateNacBoard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Kiểm tra ID hợp lệ
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bo mạch NAC với ID " + req.params.id,
            });
        }
        // Nếu panelId được gửi trong body, kiểm tra nó có hợp lệ và tồn tại không
        if (req.body.panelId !== undefined) {
            // Sử dụng panelId
            if (req.body.panelId === null || req.body.panelId === "") {
                // Cho phép gỡ liên kết panelId nếu cần (ít phổ biến)
            }
            else if (!mongoose_1.default.Types.ObjectId.isValid(req.body.panelId)) {
                // Kiểm tra panelId
                return res.status(400).json({
                    success: false,
                    message: "Panel ID mới không hợp lệ.",
                });
            }
            else {
                const panel = yield PanelModel_1.default.findById(req.body.panelId); // Kiểm tra panelId
                if (!panel) {
                    return res.status(404).json({
                        success: false,
                        message: "Không tìm thấy tủ (Panel) với ID mới " + req.body.panelId,
                    });
                }
            }
        }
        const updatedNacBoard = yield NacBoardModel_1.default.findByIdAndUpdate(req.params.id, req.body, // Truyền trực tiếp req.body
        { new: true, runValidators: true }).populate("panelId", "name panel_type"); // Populate lại sau khi update
        if (!updatedNacBoard) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy bo mạch NAC với ID " + req.params.id,
            });
            return;
        }
        // Thêm thông tin số lượng circuits thực tế
        const circuitCount = yield NacCircuitModel_1.default.countDocuments({
            nacBoardId: updatedNacBoard._id,
        });
        const nacBoardWithCircuitCount = Object.assign(Object.assign({}, updatedNacBoard.toObject()), { actual_circuit_count: circuitCount });
        res.status(200).json({
            success: true,
            message: "Cập nhật bo mạch NAC thành công.",
            data: nacBoardWithCircuitCount,
        });
    }
    catch (error) {
        console.error("Lỗi khi cập nhật bo mạch NAC:", error); // Xử lý lỗi unique index kết hợp (panelId + name)
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: "Tên bo mạch đã tồn tại trong tủ này.",
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
                message: "Không tìm thấy bo mạch NAC với ID " + req.params.id,
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: error.message ||
                    "Lỗi khi cập nhật bo mạch NAC với ID " + req.params.id,
            });
        }
    }
});
exports.updateNacBoard = updateNacBoard;
/**
 * Delete NAC board by ID
 */
const deleteNacBoard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Kiểm tra ID hợp lệ
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bo mạch NAC với ID " + req.params.id,
            });
        }
        // KIỂM TRA PHỤ THUỘC QUAN TRỌNG: Xem có NacCircuit nào còn liên kết không
        // Sử dụng tên trường nacBoardId như sẽ thống nhất cho NacCircuit Model
        const circuitsCount = yield NacCircuitModel_1.default.countDocuments({
            nacBoardId: req.params.id,
        });
        if (circuitsCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Không thể xóa bo mạch NAC có ID ${req.params.id} vì vẫn còn Mạch NAC (${circuitsCount}) liên kết. Vui lòng xóa tất cả Mạch NAC thuộc bo mạch này trước.`,
            });
        } // Nếu không có circuit nào, tiến hành xóa NacBoard
        const deletedNacBoard = yield NacBoardModel_1.default.findByIdAndDelete(req.params.id);
        if (!deletedNacBoard) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bo mạch NAC với ID " + req.params.id,
            });
        }
        res.status(200).json({
            success: true,
            message: "Xóa bo mạch NAC thành công.",
        });
    }
    catch (error) {
        console.error("Lỗi khi xóa bo mạch NAC:", error);
        if (error.kind === "ObjectId") {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bo mạch NAC với ID " + req.params.id,
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || "Không thể xóa bo mạch NAC với ID " + req.params.id,
        });
    }
});
exports.deleteNacBoard = deleteNacBoard;
/**
 * Lấy tất cả bo mạch NAC và circuit của nó
 *
 */
const getNacBoardsWithCircuits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Lấy tất cả NacBoards
        const nacBoards = yield NacBoardModel_1.default.find()
            .populate("panelId", "name panel_type")
            .sort({ createdAt: -1 });
        // Tạo một mảng đối tượng kết quả với trường circuits cho mỗi board
        const result = yield Promise.all(nacBoards.map((board) => __awaiter(void 0, void 0, void 0, function* () {
            // Lấy các mạch liên quan đến board này
            const circuits = yield NacCircuitModel_1.default.find({
                nacBoardId: board._id,
            }).select("name status circuit_number is_active");
            // Trả về đối tượng board với thông tin mạch
            return Object.assign(Object.assign({}, board.toObject()), { circuits });
        })));
        res.status(200).json({
            success: true,
            count: result.length,
            data: result,
        });
    }
    catch (error) {
        console.error("Lỗi khi lấy danh sách bo mạch NAC và circuit:", error);
        res.status(500).json({
            success: false,
            message: error.message ||
                "Đã xảy ra lỗi khi lấy danh sách bo mạch NAC và circuit.",
        });
    }
});
exports.getNacBoardsWithCircuits = getNacBoardsWithCircuits;
//# sourceMappingURL=NacBoardController.js.map