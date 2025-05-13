import mongoose from "mongoose";
import ZoneModel from "../models/ZoneModel";

/**
 * Thêm mới một zone
 */
export const createZone = async (req: any, res: any) => {
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
        if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
            return res.status(400).json({
                message: "ID vùng cha không hợp lệ !",
            });
        }

        // Kiểm tra parentId có tồn tại không (nếu có)
        if (parentId) {
            const parentZone = await ZoneModel.findById(parentId);
            if (!parentZone) {
                return res.status(404).json({
                    message: "Không tìm thấy vùng cha !",
                });
            }
        }

        const newZone = new ZoneModel({
            name,
            parentId: parentId || null,
            description,
        });

        await newZone.save();

        return res.status(201).json({
            message: "Tạo vùng mới thành công!",
            data: newZone,
        });
    } catch (error) {
        console.error("Lỗi khi tạo vùng mới:", error);
        return res.status(500).json({
            message: "Đã xảy ra lỗi khi tạo vùng mới",
        });
    }
};

/**
 * Lấy danh sách tất cả zone
 */
export const getAllZones = async (req: any, res: any) => {
    try {
        const user = req.user;

        if (user.role !== 1 && user.role !== 2) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập vào chức năng này !",
            });
        }
        const zones = await ZoneModel.find().sort({ createdAt: -1 });
        return res.status(200).json({
            data: zones,
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách vùng:", error);
        return res.status(500).json({
            message: "Đã xảy ra lỗi khi lấy danh sách vùng",
        });
    }
};

/**
 * Lấy thông tin chi tiết của một zone theo ID
 */
export const getZoneById = async (req: any, res: any) => {
    try {
        const user = req.user;

        if (user.role !== 1 && user.role !== 2) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập vào chức năng này !",
            });
        }
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "ID vùng không hợp lệ",
            });
        }

        const zone = await ZoneModel.findById(id);

        if (!zone) {
            return res.status(404).json({
                message: "Không tìm thấy vùng",
            });
        }

        return res.status(200).json({
            data: zone,
        });
    } catch (error) {
        console.error("Lỗi khi lấy thông tin vùng:", error);
        return res.status(500).json({
            message: "Đã xảy ra lỗi khi lấy thông tin vùng",
        });
    }
};

/**
 * Cập nhật thông tin của một zone
 */
export const updateZone = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { name, parentId, description } = req.body;
        const user = req.user;

        if (user.role !== 1 && user.role !== 2) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập vào chức năng này !",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "ID vùng không hợp lệ",
            });
        }

        // Kiểm tra zone có tồn tại không
        const zone = await ZoneModel.findById(id);
        if (!zone) {
            return res.status(404).json({
                message: "Không tìm thấy vùng",
            });
        }

        // Kiểm tra parentId có hợp lệ và tồn tại không
        if (parentId) {
            if (!mongoose.Types.ObjectId.isValid(parentId)) {
                return res.status(400).json({
                    message: "ID vùng cha không hợp lệ",
                });
            }

            // Kiểm tra parentId có tồn tại
            const parentZone = await ZoneModel.findById(parentId);
            if (!parentZone) {
                return res.status(404).json({
                    message: "Không tìm thấy vùng cha",
                });
            }

            // Không cho phép chọn chính nó làm cha
            if (id === parentId) {
                return res.status(400).json({
                    message: "Không thể chọn chính vùng này làm vùng cha",
                });
            }

            // Không cho phép chọn con của nó làm cha (tránh tạo vòng lặp)
            const isDescendantOf = async (
                nodeId: string,
                possibleAncestorId: string
            ) => {
                if (nodeId === possibleAncestorId) return true;
                const children = await ZoneModel.find({
                    parentId: possibleAncestorId,
                });
                for (const child of children) {
                    if (await isDescendantOf(nodeId, child._id.toString())) {
                        return true;
                    }
                }
                return false;
            };

            if (await isDescendantOf(parentId, id)) {
                return res.status(400).json({
                    message:
                        "Không thể chọn vùng con làm vùng cha (sẽ tạo ra vòng lặp)",
                });
            }
        }

        // Cập nhật thông tin
        const updatedZone = await ZoneModel.findByIdAndUpdate(
            id,
            {
                name: name || zone.name,
                parentId: parentId === undefined ? zone.parentId : parentId,
                description:
                    description === undefined ? zone.description : description,
            },
            { new: true }
        );

        return res.status(200).json({
            message: "Cập nhật vùng thành công",
            data: updatedZone,
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật vùng:", error);
        return res.status(500).json({
            message: "Đã xảy ra lỗi khi cập nhật vùng",
        });
    }
};

/**
 * Xóa một zone (chỉ khi không có zone con trực thuộc)
 */
export const deleteZone = async (req: any, res: any) => {
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
                message: "ID vùng không hợp lệ",
            });
        }

        // Kiểm tra zone có tồn tại không
        const zone = await ZoneModel.findById(id);
        if (!zone) {
            return res.status(404).json({
                message: "Không tìm thấy vùng",
            });
        }

        // Kiểm tra có zone con không
        const childrenCount = await ZoneModel.countDocuments({ parentId: id });
        if (childrenCount > 0) {
            return res.status(400).json({
                message: "Không thể xóa vùng có chứa vùng con",
                childrenCount,
            });
        }

        // Thực hiện xóa
        await ZoneModel.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Xóa vùng thành công",
        });
    } catch (error) {
        console.error("Lỗi khi xóa vùng:", error);
        return res.status(500).json({
            message: "Đã xảy ra lỗi khi xóa vùng",
        });
    }
};

/**
 * Lấy tất cả các zone con của một zone
 */
export const getZoneChildren = async (req: any, res: any) => {
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
                message: "ID vùng không hợp lệ",
            });
        }

        const children = await ZoneModel.find({ parentId: id });

        return res.status(200).json({
            data: children,
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách vùng con:", error);
        return res.status(500).json({
            message: "Đã xảy ra lỗi khi lấy danh sách vùng con",
        });
    }
};
