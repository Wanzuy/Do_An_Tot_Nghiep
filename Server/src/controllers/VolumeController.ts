import mongoose from "mongoose";
import VolumeModel from "../models/VolumeModel";
import PanelModel from "../models/PanelModel";

/**
 * Create a new volume setting
 */
export const createVolumeSetting = async (req: any, res: any) => {
    try {
        const { panelId, level } = req.body;

        // Validate panelId (bắt buộc)
        if (!panelId) {
            return res.status(400).json({
                success: false,
                message: "Panel ID là bắt buộc.",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(panelId)) {
            return res.status(400).json({
                success: false,
                message: "Panel ID không hợp lệ.",
            });
        }

        // Kiểm tra panel có tồn tại không
        const panel = await PanelModel.findById(panelId);
        if (!panel) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Panel với ID " + panelId,
            });
        }

        // Kiểm tra xem panel đã có volume setting chưa (quan hệ 1:1)
        const existingVolume = await VolumeModel.findOne({ panelId });
        if (existingVolume) {
            return res.status(400).json({
                success: false,
                message:
                    "Panel này đã có cài đặt âm lượng. Mỗi panel chỉ có một cài đặt âm lượng.",
            });
        }

        // Validate level
        if (level === undefined || level === null) {
            return res.status(400).json({
                success: false,
                message: "Level là bắt buộc.",
            });
        }

        if (typeof level !== "number" || level < 0 || level > 100) {
            return res.status(400).json({
                success: false,
                message: "Level phải là số từ 0 đến 100.",
            });
        }

        const newVolume = new VolumeModel({ panelId, level });
        const savedVolume = await newVolume.save();

        // Populate panelId
        const result = await VolumeModel.findById(savedVolume._id).populate(
            "panelId",
            "name panel_type"
        );

        res.status(201).json({
            success: true,
            message: "Tạo cài đặt âm lượng thành công.",
            data: result,
        });
    } catch (error: any) {
        console.error("Lỗi khi tạo cài đặt âm lượng:", error);

        if (error.name === "ValidationError") {
            res.status(400).json({
                success: false,
                message: "Lỗi xác thực dữ liệu: " + error.message,
            });
        } else if (error.code === 11000) {
            // Lỗi duplicate key (unique constraint)
            res.status(400).json({
                success: false,
                message: "Panel này đã có cài đặt âm lượng.",
            });
        } else {
            res.status(500).json({
                success: false,
                message:
                    error.message || "Đã xảy ra lỗi khi tạo cài đặt âm lượng.",
            });
        }
    }
};

/**
 * Get volume settings by panel ID
 */
export const getVolumeSettingByPanel = async (req: any, res: any) => {
    try {
        const { panelId } = req.params;

        // Kiểm tra panelId hợp lệ
        if (!mongoose.Types.ObjectId.isValid(panelId)) {
            return res.status(400).json({
                success: false,
                message: "Panel ID không hợp lệ.",
            });
        }

        // Kiểm tra panel có tồn tại không
        const panel = await PanelModel.findById(panelId);
        if (!panel) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Panel với ID " + panelId,
            });
        } // Lấy volume setting của panel cụ thể (quan hệ 1:1)
        const volume = await VolumeModel.findOne({ panelId }).populate(
            "panelId",
            "name panel_type"
        );

        if (!volume) {
            return res.status(404).json({
                success: false,
                message: "Panel này chưa có cài đặt âm lượng.",
                panelInfo: {
                    _id: panel._id,
                    name: panel.name,
                    panel_type: panel.panel_type,
                },
            });
        }

        res.status(200).json({
            success: true,
            panelInfo: {
                _id: panel._id,
                name: panel.name,
                panel_type: panel.panel_type,
            },
            data: volume,
        });
    } catch (error: any) {
        console.error("Lỗi khi lấy cài đặt âm lượng theo panel:", error);

        if (error.kind === "ObjectId") {
            return res.status(400).json({
                success: false,
                message: "Định dạng ID không hợp lệ.",
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || "Đã xảy ra lỗi khi lấy cài đặt âm lượng.",
        });
    }
};

/**
 * Update volume setting by ID
 */
export const updateVolumeSetting = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { level } = req.body;

        // Kiểm tra ID hợp lệ
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy cài đặt âm lượng với ID " + id,
            });
        }

        // Validate level nếu được cung cấp
        if (level !== undefined && level !== null) {
            if (typeof level !== "number" || level < 0 || level > 100) {
                return res.status(400).json({
                    success: false,
                    message: "Level phải là số từ 0 đến 100.",
                });
            }
        }

        // Chỉ cập nhật level vì chỉ có level có thể thay đổi (panelId không được thay đổi)
        const updatedVolume = await VolumeModel.findByIdAndUpdate(
            id,
            { level },
            { new: true, runValidators: true }
        ).populate("panelId", "name panel_type");

        if (!updatedVolume) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy cài đặt âm lượng với ID " + id,
            });
        }

        res.status(200).json({
            success: true,
            message: "Cập nhật cài đặt âm lượng thành công.",
            data: updatedVolume,
        });
    } catch (error: any) {
        console.error("Lỗi khi cập nhật cài đặt âm lượng:", error);

        if (error.name === "ValidationError") {
            res.status(400).json({
                success: false,
                message: "Lỗi xác thực dữ liệu: " + error.message,
            });
        } else if (error.kind === "ObjectId") {
            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy cài đặt âm lượng với ID " + req.params.id,
            });
        } else {
            res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "Lỗi khi cập nhật cài đặt âm lượng với ID " + req.params.id,
            });
        }
    }
};

/**
 * Test volume setting
 */
export const testVolume = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { testLevel, duration } = req.body;

        // Kiểm tra ID hợp lệ
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy cài đặt âm lượng với ID " + id,
            });
        }

        // Tìm volume setting
        const volume = await VolumeModel.findById(id).populate(
            "panelId",
            "name panel_type"
        );
        if (!volume) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy cài đặt âm lượng với ID " + id,
            });
        }

        // Validate testLevel
        const testLevelValue =
            testLevel !== undefined ? testLevel : volume.level;
        if (
            typeof testLevelValue !== "number" ||
            testLevelValue < 0 ||
            testLevelValue > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Test level phải là số từ 0 đến 100.",
            });
        }

        // Validate duration
        const testDuration = duration || 5; // Default 5 seconds
        if (
            typeof testDuration !== "number" ||
            testDuration < 1 ||
            testDuration > 60
        ) {
            return res.status(400).json({
                success: false,
                message: "Duration phải là số từ 1 đến 60 giây.",
            });
        }

        // Mô phỏng việc test âm lượng
        // Trong thực tế, đây sẽ là nơi gửi lệnh đến phần cứng để test âm thanh
        const testResult = {
            volumeId: volume._id,
            panelId: volume.panelId,
            originalLevel: volume.level,
            testLevel: testLevelValue,
            duration: testDuration,
            status: "success",
            message: `Đã test âm lượng ở mức ${testLevelValue}% trong ${testDuration} giây`,
            testedAt: new Date(),
        };

        res.status(200).json({
            success: true,
            message: "Test âm lượng thành công.",
            data: {
                volume: volume,
                testResult: testResult,
            },
        });
    } catch (error: any) {
        console.error("Lỗi khi test âm lượng:", error);

        if (error.kind === "ObjectId") {
            return res.status(404).json({
                success: false,
                message:
                    "Không tìm thấy cài đặt âm lượng với ID " + req.params.id,
            });
        }

        res.status(500).json({
            success: false,
            message:
                error.message ||
                "Đã xảy ra lỗi khi test âm lượng với ID " + req.params.id,
        });
    }
};
