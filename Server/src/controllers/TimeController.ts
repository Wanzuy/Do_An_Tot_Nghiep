import TimeModel from "../models/TimeModel";
import mongoose from "mongoose";

// Tạo mới time
export const createTime = async (req: any, res: any) => {
    try {
        const user = req.user;
        const {
            panelId,
            name,
            time,
            repeat,
            audioFile,
            isEnabled,
            description,
        } = req.body;

        if (user.role !== 1 && user.role !== 2) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập vào chức năng này !",
            });
        }

        // Validate panelId
        if (!mongoose.Types.ObjectId.isValid(panelId)) {
            return res.status(400).json({
                success: false,
                message: "Panel ID không hợp lệ",
            });
        }

        const newTime = new TimeModel({
            panelId,
            name,
            time: new Date(time),
            repeat: repeat || [],
            audioFile,
            isEnabled: isEnabled !== undefined ? isEnabled : true,
            description,
        });

        const savedTime = await newTime.save();
        await savedTime.populate("panelId", "name");

        res.status(201).json({
            success: true,
            message: "Tạo hẹn giờ thành công!",
            data: savedTime,
        });
    } catch (error: any) {
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
};

// Lấy tất cả times
export const getAllTimes = async (req: any, res: any) => {
    try {
        const user = req.user;

        if (user.role !== 1 && user.role !== 2) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập vào chức năng này !",
            });
        }

        const times = await TimeModel.find()
            .populate("panelId", "name")
            .sort({ time: 1 });

        res.status(200).json({
            success: true,
            message: "Lấy danh sách thời gian thành công!",
            data: times,
            count: times.length,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message,
        });
    }
};

// Lấy chi tiết một time
export const getTimeById = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const user = req.user;

        if (user.role !== 1 && user.role !== 2) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập vào chức năng này!",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Time ID không hợp lệ",
            });
        }

        const time = await TimeModel.findById(id).populate("panelId", "name");

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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message,
        });
    }
};

// Cập nhật time
export const updateTime = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { name, time, repeat, audioFile, isEnabled, description } =
            req.body;
        const user = req.user;

        if (user.role !== 1 && user.role !== 2) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập vào chức năng này !",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Time ID không hợp lệ",
            });
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (time !== undefined) updateData.time = new Date(time);
        if (repeat !== undefined) updateData.repeat = repeat;
        if (audioFile !== undefined) updateData.audioFile = audioFile;
        if (isEnabled !== undefined) updateData.isEnabled = isEnabled;
        if (description !== undefined) updateData.description = description;

        const updatedTime = await TimeModel.findByIdAndUpdate(id, updateData, {
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
    } catch (error: any) {
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
};

// Xóa time
export const deleteTime = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const user = req.user;

        if (user.role !== 1 && user.role !== 2) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập vào chức năng này !",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Time ID không hợp lệ",
            });
        }

        const deletedTime = await TimeModel.findByIdAndDelete(id);

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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message,
        });
    }
};

// Bật/tắt time
export const toggleTime = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const user = req.user;

        if (user.role !== 1 && user.role !== 2) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập vào chức năng này !",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Time ID không hợp lệ",
            });
        }

        const time = await TimeModel.findById(id);

        if (!time) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thời gian",
            });
        }

        time.isEnabled = !time.isEnabled;
        await time.save();
        await time.populate("panelId", "name");

        res.status(200).json({
            success: true,
            message: `${time.isEnabled ? "Bật" : "Tắt"} thời gian thành công`,
            data: time,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message,
        });
    }
};
