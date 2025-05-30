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
exports.getZoneChildren = exports.deleteZone = exports.updateZone = exports.getZoneById = exports.getAllZones = exports.createZone = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ZoneModel_1 = __importDefault(require("../models/ZoneModel"));
const DetectorModel_1 = __importDefault(require("../models/DetectorModel"));
const NacCircuitModel_1 = __importDefault(require("../models/NacCircuitModel"));
/**
 * Thêm mới một zone
 */
const createZone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, parentId, description } = req.body;
        const user = req.user;
        if (user.role !== 1 && user.role !== 2) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập vào chức năng này !",
            });
        }
        if (!name) {
            return res.status(400).json({
                message: "Vui lòng nhập tên vùng !",
            });
        }
        // Kiểm tra parentId có hợp lệ không (nếu có)
        if (parentId && !mongoose_1.default.Types.ObjectId.isValid(parentId)) {
            return res.status(400).json({
                message: "ID vùng cha không hợp lệ !",
            });
        }
        // Tạo zone mới bằng cách truyền trực tiếp req.body
        const newZone = new ZoneModel_1.default(Object.assign(Object.assign({}, req.body), { name: name.trim(), parentId: parentId || null }));
        const savedZone = yield newZone.save();
        // Populate parentId trước khi trả về (Tùy chọn)
        const resultZone = yield ZoneModel_1.default.findById(savedZone._id).populate("parentId", "name description");
        return res.status(201).json({
            success: true,
            message: "Tạo vùng mới thành công!",
            data: resultZone,
        });
    }
    catch (error) {
        console.error("Lỗi khi tạo vùng mới:", error);
        if (error.name === "ValidationError") {
            // Lỗi validation Mongoose
            return res.status(400).json({
                success: false,
                message: "Lỗi xác thực dữ liệu: " + error.message,
            });
        }
        return res.status(500).json({
            success: false,
            message: error.message || "Đã xảy ra lỗi khi tạo vùng mới.",
        });
    }
});
exports.createZone = createZone;
/**
 * Lấy danh sách tất cả zone
 */
const getAllZones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (user.role !== 1 && user.role !== 2) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập vào chức năng này !",
            });
        }
        const zones = yield ZoneModel_1.default.find().sort({ createdAt: -1 });
        return res.status(200).json({
            data: zones,
        });
    }
    catch (error) {
        console.error("Lỗi khi lấy danh sách vùng:", error);
        return res.status(500).json({
            message: "Đã xảy ra lỗi khi lấy danh sách vùng",
        });
    }
});
exports.getAllZones = getAllZones;
/**
 * Lấy thông tin chi tiết của một zone theo ID
 */
const getZoneById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (user.role !== 1 && user.role !== 2) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập vào chức năng này !",
            });
        }
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "ID vùng không hợp lệ",
            });
        }
        const zone = yield ZoneModel_1.default.findById(id);
        if (!zone) {
            return res.status(404).json({
                message: "Không tìm thấy vùng",
            });
        }
        return res.status(200).json({
            data: zone,
        });
    }
    catch (error) {
        console.error("Lỗi khi lấy thông tin vùng:", error);
        return res.status(500).json({
            message: "Đã xảy ra lỗi khi lấy thông tin vùng",
        });
    }
});
exports.getZoneById = getZoneById;
/**
 * Cập nhật thông tin của một zone
 */
const updateZone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, parentId, description } = req.body;
        const user = req.user;
        if (user.role !== 1 && user.role !== 2) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập vào chức năng này !",
            });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "ID vùng không hợp lệ",
            });
        } // Kiểm tra zone có tồn tại không
        const zone = yield ZoneModel_1.default.findById(id);
        if (!zone) {
            return res.status(404).json({
                message: "Không tìm thấy vùng",
            });
        } // Kiểm tra parentId có hợp lệ và tồn tại không
        if (parentId) {
            if (!mongoose_1.default.Types.ObjectId.isValid(parentId)) {
                return res.status(400).json({
                    message: "ID vùng cha không hợp lệ",
                });
            } // Kiểm tra parentId có tồn tại
            const parentZone = yield ZoneModel_1.default.findById(parentId);
            if (!parentZone) {
                return res.status(404).json({
                    message: "Không tìm thấy vùng cha",
                });
            } // Không cho phép chọn chính nó làm cha
            if (id === parentId) {
                return res.status(400).json({
                    message: "Không thể chọn chính vùng này làm vùng cha",
                });
            } // Không cho phép chọn con của nó làm cha (tránh tạo vòng lặp)
            const isDescendantOf = (nodeId, possibleAncestorId) => __awaiter(void 0, void 0, void 0, function* () {
                if (nodeId === possibleAncestorId)
                    return true;
                const children = yield ZoneModel_1.default.find({
                    parentId: possibleAncestorId,
                });
                for (const child of children) {
                    if (yield isDescendantOf(nodeId, child._id.toString())) {
                        return true;
                    }
                }
                return false;
            });
            if (yield isDescendantOf(parentId, id)) {
                return res.status(400).json({
                    message: "Không thể chọn vùng con làm vùng cha (sẽ tạo ra vòng lặp)",
                });
            }
        } // Cập nhật thông tin
        const updatedZone = yield ZoneModel_1.default.findByIdAndUpdate(id, {
            name: name || zone.name,
            parentId: parentId === undefined ? zone.parentId : parentId,
            description: description === undefined ? zone.description : description,
        }, { new: true });
        return res.status(200).json({
            message: "Cập nhật vùng thành công",
            data: updatedZone,
        });
    }
    catch (error) {
        console.error("Lỗi khi cập nhật vùng:", error);
        return res.status(500).json({
            message: "Đã xảy ra lỗi khi cập nhật vùng",
        });
    }
});
exports.updateZone = updateZone;
/**
 * Xóa một zone (chỉ khi không có zone con trực thuộc)
 */
const deleteZone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = req.user;
        if (user.role !== 1 && user.role !== 2) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập vào chức năng này !",
            });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "ID vùng không hợp lệ",
            });
        }
        // Kiểm tra zone có tồn tại không
        const zone = yield ZoneModel_1.default.findById(id);
        if (!zone) {
            return res.status(404).json({
                message: "Không tìm thấy vùng",
            });
        }
        // Kiểm tra có zone con không (logic gốc của bạn)
        const childrenCount = yield ZoneModel_1.default.countDocuments({ parentId: id });
        if (childrenCount > 0) {
            return res.status(400).json({
                message: "Không thể xóa vùng có chứa vùng con",
                childrenCount,
            });
        }
        // --- THÊM KIỂM TRA PHỤ THUỘC DETECTOR ---
        const detectorsCount = yield DetectorModel_1.default.countDocuments({
            zoneId: id,
        }); // zoneId trong Detector
        if (detectorsCount > 0) {
            return res.status(400).json({
                success: false, // Thêm success: false cho nhất quán
                message: `Không thể xóa vùng có chứa Đầu báo (${detectorsCount}). Vui lòng di chuyển hoặc xóa các Đầu báo liên quan trước.`,
                detectorsCount,
            });
        }
        // --- THÊM KIỂM TRA PHỤ THUỘC NAC CIRCUIT ---
        const circuitsCount = yield NacCircuitModel_1.default.countDocuments({
            zoneId: id,
        }); // zoneId trong NacCircuit
        if (circuitsCount > 0) {
            return res.status(400).json({
                success: false, // Thêm success: false cho nhất quán
                message: `Không thể xóa vùng có chứa Mạch NAC (${circuitsCount}). Vui lòng di chuyển hoặc xóa các Mạch NAC liên quan trước.`,
                circuitsCount,
            });
        }
        // --- KẾT THÚC KIỂM TRA PHỤ THUỘC ---
        // Thực hiện xóa (nếu không có phụ thuộc nào)
        yield ZoneModel_1.default.findByIdAndDelete(id);
        // Không ghi log theo yêu cầu
        return res.status(200).json({
            message: "Xóa vùng thành công",
        });
    }
    catch (error) {
        console.error("Lỗi khi xóa vùng:", error);
        return res.status(500).json({
            message: "Đã xảy ra lỗi khi xóa vùng",
        });
    }
});
exports.deleteZone = deleteZone;
/**
 * Lấy tất cả các zone con của một zone
 */
const getZoneChildren = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = req.user;
        if (user.role !== 1 && user.role !== 2) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập vào chức năng này !",
            });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "ID vùng không hợp lệ",
            });
        }
        const children = yield ZoneModel_1.default.find({ parentId: id });
        return res.status(200).json({
            data: children,
        });
    }
    catch (error) {
        console.error("Lỗi khi lấy danh sách vùng con:", error);
        return res.status(500).json({
            message: "Đã xảy ra lỗi khi lấy danh sách vùng con",
        });
    }
});
exports.getZoneChildren = getZoneChildren;
//# sourceMappingURL=ZoneController.js.map