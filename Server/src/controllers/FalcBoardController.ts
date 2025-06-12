import mongoose from "mongoose";
import FalcBoardModel from "../models/FalcBoardModel";
import PanelModel from "../models/PanelModel";
import DetectorModel from "../models/DetectorModel";

/**
 * Create a new FALC board
 */
export const createFalcBoard = async (req: any, res: any) => {
  try {
    // Kiểm tra panelId có được cung cấp và hợp lệ không
    if (
      !req.body.panelId ||
      !mongoose.Types.ObjectId.isValid(req.body.panelId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Panel ID không hợp lệ hoặc bị thiếu.",
      });
    }

    // Kiểm tra number_of_detectors có hợp lệ không
    if (req.body.number_of_detectors !== undefined) {
      const numberOfDetectors = Number(req.body.number_of_detectors);

      if (isNaN(numberOfDetectors) || numberOfDetectors < 1) {
        return res.status(400).json({
          success: false,
          message: "Số lượng đầu báo phải là số nguyên dương (≥ 1).",
        });
      }

      if (numberOfDetectors > 200) {
        return res.status(400).json({
          success: false,
          message: "Số lượng đầu báo không được vượt quá 200.",
        });
      }
    }

    // Kiểm tra panelId có tồn tại trong collection Panel không
    const panel = await PanelModel.findById(req.body.panelId);
    if (!panel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tủ (Panel) với ID " + req.body.panelId,
      });
    }

    // Tạo FalcBoard mới bằng cách truyền trực tiếp req.body
    const newFalcBoard = new FalcBoardModel(req.body); // Mongoose sẽ tự động lấy các trường trong schema
    const savedFalcBoard = await newFalcBoard.save(); // Lưu vào database

    // Populate panelId trước khi trả về
    const result = await FalcBoardModel.findById(savedFalcBoard._id).populate(
      "panelId",
      "name panel_type"
    );

    res.status(201).json({
      success: true,
      message: "Tạo bo mạch FALC thành công.",
      data: result,
    });
  } catch (error: any) {
    console.error("Lỗi khi tạo bo mạch FALC:", error); // Log lỗi chi tiết

    // Xử lý lỗi unique index kết hợp (panelId + name)
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Tên bo mạch đã tồn tại trong tủ này.",
      });
    } else if (error.name === "ValidationError") {
      // Xử lý lỗi validation của Mongoose
      let errorMessage = "Lỗi xác thực dữ liệu: ";

      // Xử lý cụ thể cho từng trường validation
      if (error.errors?.number_of_detectors) {
        if (error.errors.number_of_detectors.kind === "max") {
          errorMessage = "Số lượng đầu báo không được vượt quá 200.";
        } else if (error.errors.number_of_detectors.kind === "min") {
          errorMessage = "Số lượng đầu báo phải lớn hơn hoặc bằng 1.";
        } else {
          errorMessage = "Số lượng đầu báo không hợp lệ.";
        }
      } else {
        errorMessage += error.message;
      }

      res.status(400).json({
        success: false,
        message: errorMessage,
      });
    } else {
      res.status(500).json({
        success: false,
        message: error.message || "Đã xảy ra lỗi khi tạo bo mạch FALC.",
      });
    }
  }
};

/**
 * Get all FALC boards
 */

export const getAllFalcBoards = async (req: any, res: any) => {
  try {
    const query: any = {}; // Object chứa điều kiện lọc // Lọc theo panelId nếu có query parameter

    if (req.query.panelId) {
      // Sử dụng panelId trong query
      if (!mongoose.Types.ObjectId.isValid(req.query.panelId)) {
        return res.status(400).json({
          success: false,
          message: "ID Panel trong tham số truy vấn không hợp lệ.",
        });
      }
      query.panelId = req.query.panelId; // Lọc theo panelId
    }
    const falcBoards = await FalcBoardModel.find(query)
      .populate("panelId", "name panel_type") // Populate panelId
      .sort({ createdAt: 1 }); // Sắp xếp theo thời gian tạo tăng dần (cũ nhất lên đầu)

    // Thêm số lượng detector hiện có cho mỗi falc board
    const falcBoardsWithDetectorCount = await Promise.all(
      falcBoards.map(async (board) => {
        const detectorCount = await DetectorModel.countDocuments({
          falcBoardId: board._id,
        });
        return {
          ...board.toObject(),
          current_detector_count: detectorCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: falcBoardsWithDetectorCount.length,
      data: falcBoardsWithDetectorCount,
    });
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách bo mạch FALC:", error);
    if (error.kind === "ObjectId") {
      // Xử lý lỗi CastError (nếu có lỗi khác liên quan ID trong query)
      return res.status(400).json({
        success: false,
        message: "Định dạng ID không hợp lệ trong truy vấn.",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Đã xảy ra lỗi khi lấy danh sách bo mạch FALC.",
    });
  }
};

/**
 * Get FALC board by ID
 * @route GET /api/falc-boards/:id
 */
export const getFalcBoardById = async (req: any, res: any) => {
  try {
    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bo mạch FALC với ID " + req.params.id,
      });
    }
    const falcBoard = await FalcBoardModel.findById(req.params.id).populate(
      "panelId", // Populate panelId
      "name panel_type"
    );

    if (!falcBoard) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy bo mạch FALC với ID " + req.params.id,
      });
      return;
    }

    // Tính toán số lượng detector hiện có
    const detectorCount = await DetectorModel.countDocuments({
      falcBoardId: falcBoard._id,
    });

    // Thêm current_detector_count vào dữ liệu trả về
    const falcBoardWithDetectorCount = {
      ...falcBoard.toObject(),
      current_detector_count: detectorCount,
    };

    res.status(200).json({
      success: true,
      data: falcBoardWithDetectorCount,
    });
  } catch (error: any) {
    console.error("Lỗi khi lấy bo mạch FALC theo ID:", error);
    if (error.kind === "ObjectId") {
      // Xử lý lỗi CastError
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bo mạch FALC với ID " + req.params.id,
      });
    }
    res.status(500).json({
      success: false,
      message:
        error.message || "Lỗi khi lấy bo mạch FALC với ID " + req.params.id,
    });
  }
};

/**
 * Update FALC board by ID
 * @route PUT /api/falc-boards/:id
 */
export const updateFalcBoard = async (req: any, res: any) => {
  try {
    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bo mạch FALC với ID " + req.params.id,
      });
    }

    // Nếu panelId được gửi trong body, kiểm tra nó có hợp lệ và tồn tại không
    if (req.body.panelId !== undefined) {
      // Sử dụng panelId
      if (req.body.panelId === null || req.body.panelId === "") {
        // Cho phép gỡ liên kết panelId nếu cần (ít phổ biến nhưng có thể xảy ra)
        // Mongoose sẽ set null
      } else if (!mongoose.Types.ObjectId.isValid(req.body.panelId)) {
        // Kiểm tra panelId
        return res.status(400).json({
          success: false,
          message: "Panel ID mới không hợp lệ.",
        });
      } else {
        const panel = await PanelModel.findById(req.body.panelId); // Kiểm tra panelId
        if (!panel) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy tủ (Panel) với ID mới " + req.body.panelId,
          });
        }
      }
    }
    const updatedFalcBoard = await FalcBoardModel.findByIdAndUpdate(
      req.params.id,
      req.body, // Truyền trực tiếp req.body
      { new: true, runValidators: true }
    ).populate("panelId", "name panel_type"); // Populate lại sau khi update

    if (!updatedFalcBoard) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy bo mạch FALC với ID " + req.params.id,
      });
      return;
    }

    // Tính toán số lượng detector hiện có cho board vừa được update
    const detectorCount = await DetectorModel.countDocuments({
      falcBoardId: updatedFalcBoard._id,
    });

    // Thêm current_detector_count vào dữ liệu trả về
    const falcBoardWithDetectorCount = {
      ...updatedFalcBoard.toObject(),
      current_detector_count: detectorCount,
    };

    res.status(200).json({
      success: true,
      message: "Cập nhật bo mạch FALC thành công.",
      data: falcBoardWithDetectorCount,
    });
  } catch (error: any) {
    console.error("Lỗi khi cập nhật bo mạch FALC:", error); // Xử lý lỗi unique index kết hợp (panelId + name)
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Tên bo mạch đã tồn tại trong tủ này.",
      });
    } else if (error.name === "ValidationError") {
      res.status(400).json({
        success: false,
        message: "Lỗi xác thực dữ liệu: " + error.message,
      });
    } else if (error.kind === "ObjectId") {
      // Xử lý lỗi CastError
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bo mạch FALC với ID " + req.params.id,
      });
    } else {
      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Lỗi khi cập nhật bo mạch FALC với ID " + req.params.id,
      });
    }
  }
};

/**
 * Update FALC board status by ID
 */
export const updateFalcBoardStatus = async (req: any, res: any) => {
  try {
    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bo mạch FALC với ID " + req.params.id,
      });
    }

    const { is_active } = req.body; // CHỈ NHẬN is_active từ body

    // Kiểm tra nếu is_active không được gửi đi hoặc không phải boolean
    if (is_active === undefined || typeof is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "'is_active' (boolean) là bắt buộc trong body.",
      });
    }

    // Lấy thông tin bo mạch hiện tại để so sánh trạng thái cũ và lấy thông tin cho log
    // Populate Panel để ghi log
    const falcBoard: any = await FalcBoardModel.findById(
      req.params.id
    ).populate("panelId", "name panel_type");

    if (!falcBoard) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bo mạch FALC với ID " + req.params.id,
      });
    }

    // CHỈ CẬP NHẬT is_active VÀ TỰ ĐỘNG SET status
    falcBoard.is_active = is_active;

    // Tự động set status dựa trên is_active mới
    if (falcBoard.is_active === true) {
      // Nếu bật, status về Normal
      falcBoard.status = "Normal";
    } else {
      // is_active === false
      // Nếu tắt, status về Offline (giả định người dùng tắt để bảo trì)
      // Lưu ý: Status Fault/Offline do lỗi hệ thống cần logic khác cập nhật
      if (falcBoard.status !== "Fault") {
        // KHÔNG thay đổi status nếu nó đang là Fault (lỗi hệ thống)
        falcBoard.status = "Offline";
      }
    }
    const updatedFalcBoard = await falcBoard.save(); // Lưu thay đổi

    // Tính toán số lượng detector hiện có cho board vừa được update
    const detectorCount = await DetectorModel.countDocuments({
      falcBoardId: updatedFalcBoard._id,
    });

    // Thêm current_detector_count vào dữ liệu trả về
    const falcBoardWithDetectorCount = {
      ...updatedFalcBoard.toObject(),
      current_detector_count: detectorCount,
    };

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái bo mạch FALC thành công.",
      data: falcBoardWithDetectorCount,
    });
  } catch (error: any) {
    console.error("Lỗi khi cập nhật trạng thái bo mạch FALC:", error);
    if (error.name === "ValidationError") {
      res.status(400).json({
        success: false,
        message: "Lỗi xác thực dữ liệu: " + error.message,
      });
    } else if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "ID Bo mạch FALC không hợp lệ.",
      });
    } else {
      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Đã xảy ra lỗi khi cập nhật trạng thái bo mạch FALC.",
      });
    }
  }
};

/**
 * Delete FALC board by ID
 * @route DELETE /api/falc-boards/:id
 */
export const deleteFalcBoard = async (req: any, res: any) => {
  try {
    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bo mạch FALC với ID " + req.params.id,
      });
    }

    // KIỂM TRA PHỤ THUỘC QUAN TRỌNG: Xem có Detector nào còn liên kết không
    // Sử dụng tên trường falc_board_id như đã thống nhất cho Detector Model
    const detectorsCount = await DetectorModel.countDocuments({
      falcBoardId: req.params.id,
    });

    if (detectorsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa bo mạch FALC có ID ${req.params.id} vì vẫn còn Đầu báo (${detectorsCount}) liên kết. Vui lòng xóa tất cả Đầu báo thuộc bo mạch này trước.`,
      });
    } // Nếu không có detector nào, tiến hành xóa FalcBoard

    const deletedFalcBoard = await FalcBoardModel.findByIdAndDelete(
      req.params.id
    );

    if (!deletedFalcBoard) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bo mạch FALC với ID " + req.params.id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa bo mạch FALC thành công.",
    });
  } catch (error: any) {
    console.error("Lỗi khi xóa bo mạch FALC:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bo mạch FALC với ID " + req.params.id,
      });
    }
    res.status(500).json({
      success: false,
      message:
        error.message || "Không thể xóa bo mạch FALC với ID " + req.params.id,
    });
  }
};

/**
 * Get all FALC boards by panel ID
 */
export const getFalcBoardsByPanelId = async (req: any, res: any) => {
  try {
    const { panelId } = req.params; // Giữ tên param là panelId

    // Kiểm tra panelId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(panelId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID Panel không hợp lệ." });
    }
    // Tùy chọn: Kiểm tra panelId có tồn tại trong collection Panel không (đảm bảo lấy boards cho panel có thật)
    // const panel = await PanelModel.findById(panelId);
    // if (!panel) {
    //      return res.status(404).json({ success: false, message: "Không tìm thấy Panel với ID " + panelId });
    // }
    const falcBoards = await FalcBoardModel.find({ panelId }) // Lọc theo panelId
      .populate("panelId", "name panel_type") // Populate panelId
      .sort({ createdAt: -1 });

    // Thêm số lượng detector hiện có cho mỗi falc board
    const falcBoardsWithDetectorCount = await Promise.all(
      falcBoards.map(async (board) => {
        const detectorCount = await DetectorModel.countDocuments({
          falcBoardId: board._id,
        });
        return {
          ...board.toObject(),
          current_detector_count: detectorCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: falcBoardsWithDetectorCount.length,
      data: falcBoardsWithDetectorCount,
    });
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách bo mạch FALC theo Panel ID:", error);
    // Lỗi CastError đã được bắt ở kiểm tra isValid
    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Đã xảy ra lỗi khi lấy danh sách bo mạch FALC theo Panel ID.",
    });
  }
};
