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
exports.toggleTime = exports.deleteTime = exports.updateTime = exports.getTimeById = exports.getAllTimes = exports.createTime = void 0;
const TimeModel_1 = __importDefault(require("../models/TimeModel"));
const mongoose_1 = __importDefault(require("mongoose"));
// Tạo mới time
const createTime = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { panelId, name, time, repeat, audioFile, isEnabled, description, } = req.body;
        // Validate panelId
        if (!mongoose_1.default.Types.ObjectId.isValid(panelId)) {
            return res.status(400).json({
                success: false,
                message: "Panel ID không hợp lệ",
            });
        }
        const newTime = new TimeModel_1.default({
            panelId,
            name,
            time: new Date(time),
            repeat: repeat || [],
            audioFile,
            isEnabled: isEnabled !== undefined ? isEnabled : true,
            description,
        });
        const savedTime = yield newTime.save();
        yield savedTime.populate("panelId", "name");
        res.status(201).json({
            success: true,
            message: "Tạo hẹn giờ thành công!",
            data: savedTime,
        });
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Tên hẹn giờ đã tồn tại trong tủ này!",
            });
        }
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message,
        });
    }
});
exports.createTime = createTime;
// Lấy tất cả times
const getAllTimes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const times = yield TimeModel_1.default.find()
            .populate("panelId", "name")
            .sort({ time: 1 });
        res.status(200).json({
            success: true,
            message: "Lấy danh sách thời gian thành công!",
            data: times,
            count: times.length,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message,
        });
    }
});
exports.getAllTimes = getAllTimes;
// Lấy chi tiết một time
const getTimeById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Time ID không hợp lệ",
            });
        }
        const time = yield TimeModel_1.default.findById(id).populate("panelId", "name");
        if (!time) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thời gian",
            });
        }
        res.status(200).json({
            success: true,
            message: "Lấy thông tin thời gian thành công",
            data: time,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message,
        });
    }
});
exports.getTimeById = getTimeById;
// Cập nhật time
const updateTime = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, time, repeat, audioFile, isEnabled, description } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Time ID không hợp lệ",
            });
        }
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (time !== undefined)
            updateData.time = new Date(time);
        if (repeat !== undefined)
            updateData.repeat = repeat;
        if (audioFile !== undefined)
            updateData.audioFile = audioFile;
        if (isEnabled !== undefined)
            updateData.isEnabled = isEnabled;
        if (description !== undefined)
            updateData.description = description;
        const updatedTime = yield TimeModel_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).populate("panelId", "name");
        if (!updatedTime) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thời gian",
            });
        }
        res.status(200).json({
            success: true,
            message: "Cập nhật thời gian thành công",
            data: updatedTime,
        });
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Tên thời gian đã tồn tại trong tủ này",
            });
        }
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message,
        });
    }
});
exports.updateTime = updateTime;
// Xóa time
const deleteTime = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Time ID không hợp lệ",
            });
        }
        const deletedTime = yield TimeModel_1.default.findByIdAndDelete(id);
        if (!deletedTime) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thời gian",
            });
        }
        res.status(200).json({
            success: true,
            message: "Xóa thời gian thành công",
            data: deletedTime,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message,
        });
    }
});
exports.deleteTime = deleteTime;
// Bật/tắt time
const toggleTime = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Time ID không hợp lệ",
            });
        }
        const time = yield TimeModel_1.default.findById(id);
        if (!time) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thời gian",
            });
        }
        time.isEnabled = !time.isEnabled;
        yield time.save();
        yield time.populate("panelId", "name");
        res.status(200).json({
            success: true,
            message: `${time.isEnabled ? "Bật" : "Tắt"} thời gian thành công`,
            data: time,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message,
        });
    }
});
exports.toggleTime = toggleTime;
//# sourceMappingURL=TimeController.js.map