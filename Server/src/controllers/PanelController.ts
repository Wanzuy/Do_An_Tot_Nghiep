import mongoose from "mongoose";
import PanelModel from "../models/PanelModel";
import FalcBoardModel from "../models/FalcBoardModel";
import NacBoardModel from "../models/NacBoardModel";

export const createPanel = async (req: any, res: any) => {
  try {
    // Kiểm tra nếu main_panel_id được cung cấp và không rỗng, nó phải là một Panel tồn tại
    if (req.body.main_panel_id) {
      // Kiểm tra định dạng ID
      if (!mongoose.Types.ObjectId.isValid(req.body.main_panel_id)) {
        return res.status(400).json({
          success: false,
          message: "Định dạng ID của tủ trung tâm không hợp lệ.",
        });
      }
      const mainPanel = await PanelModel.findById(req.body.main_panel_id);
      if (!mainPanel) {
        return res.status(404).json({
          success: false,
          message:
            "Không tìm thấy tủ trung tâm với ID " + req.body.main_panel_id,
        });
      }
    }

    // --- Validation cho các trường mới ---

    // Kiểm tra loops_supported
    if (req.body.loops_supported !== undefined) {
      if (
        typeof req.body.loops_supported !== "number" ||
        req.body.loops_supported < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Số lượng loops hỗ trợ phải là số không âm.",
        });
      }
    }

    // Kiểm tra ram_usage
    if (req.body.ram_usage !== undefined) {
      if (
        typeof req.body.ram_usage !== "number" ||
        req.body.ram_usage < 0 ||
        req.body.ram_usage > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "RAM usage phải là số từ 0 đến 100%.",
        });
      }
    }

    // Kiểm tra cpu_usage
    if (req.body.cpu_usage !== undefined) {
      if (
        typeof req.body.cpu_usage !== "number" ||
        req.body.cpu_usage < 0 ||
        req.body.cpu_usage > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "CPU usage phải là số từ 0 đến 100%.",
        });
      }
    }

    // --- Kết thúc validation cho các trường mới ---

    // Tạo Panel mới bằng cách truyền trực tiếp req.body
    const newPanel = new PanelModel(req.body);
    const savedPanel = await newPanel.save(); // Populate thông tin tủ cha trước khi trả về
    const result = await PanelModel.findById(savedPanel._id).populate(
      "main_panel_id",
      "name panel_type ip_address loops_supported ram_usage cpu_usage"
    );

    res.status(201).json({
      success: true,
      message: "Tạo tủ thành công",
      data: result,
    });
  } catch (error: any) {
    console.error("Lỗi khi tạo tủ:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];

      let errorMessage = "Thông tin tủ bị trùng lặp.";
      if (field === "name") {
        errorMessage = "Tên tủ đã tồn tại.";
      } else if (field === "ip_address") {
        errorMessage = "Địa chỉ IP đã tồn tại.";
      }
      res.status(400).json({
        success: false,
        message: errorMessage,
      });
    } else if (error.name === "ValidationError") {
      // Xử lý lỗi validation của Mongoose
      res.status(400).json({
        success: false,
        message: "Lỗi xác thực dữ liệu: " + error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: error.message || "Đã xảy ra lỗi khi tạo tủ.",
      });
    }
  }
};

/**
 * Get all panels
 */
export const getAllPanels = async (req: any, res: any) => {
  try {
    const query: any = {};
    // Thêm logic lọc theo panel_type nếu có query parameter
    if (req.query.panel_type) {
      query.panel_type = req.query.panel_type;
    }
    // Thêm logic lọc theo main_panel_id nếu có query parameter (để lấy tủ con)
    if (req.query.main_panel_id) {
      // Kiểm tra định dạng ID trong query
      if (!mongoose.Types.ObjectId.isValid(req.query.main_panel_id)) {
        return res.status(400).json({
          success: false,
          message:
            "Định dạng ID tủ trung tâm trong tham số truy vấn không hợp lệ.",
        });
      }
      query.main_panel_id = req.query.main_panel_id;
    } else if (req.query.isRoot === "true") {
      // Lọc chỉ lấy tủ gốc (main_panel_id là null) nếu có query parameter isRoot=true
      query.main_panel_id = null;
    } // Lấy Panels và populate thông tin tủ cha
    const panels = await PanelModel.find(query).populate(
      "main_panel_id",
      "name panel_type ip_address loops_supported ram_usage cpu_usage"
    );

    res.status(200).json({
      success: true,
      count: panels.length,
      data: panels,
    });
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách tủ:", error);
    if (error.kind === "ObjectId") {
      // Xử lý lỗi CastError có thể xảy ra nếu dùng các toán tử query phức tạp hơn không đúng định dạng
      return res.status(400).json({
        success: false,
        message: "Định dạng ID trong tham số truy vấn không hợp lệ.",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Đã xảy ra lỗi khi lấy danh sách tủ.",
    });
  }
};

/**
 * Get panel by ID
 * @route GET /api/panels/:id
 */
export const getPanelById = async (req: any, res: any) => {
  try {
    // Kiểm tra định dạng ID trong params
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tủ với ID " + req.params.id,
      });
    }
    const panel = await PanelModel.findById(req.params.id).populate(
      "main_panel_id",
      "name panel_type ip_address loops_supported ram_usage cpu_usage"
    );

    if (!panel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tủ với ID " + req.params.id,
      });
    }

    res.status(200).json({
      success: true,
      data: panel,
    });
  } catch (error: any) {
    console.error("Lỗi khi lấy thông tin tủ theo ID:", error);
    // Lỗi CastError đã được bắt ở kiểm tra isValid phía trên, lỗi khác là lỗi server
    res.status(500).json({
      success: false,
      message:
        error.message || "Lỗi khi lấy thông tin tủ với ID " + req.params.id,
    });
  }
};

/**
 * Update panel by ID
 */
export const updatePanel = async (req: any, res: any) => {
  try {
    // Kiểm tra định dạng ID trong params
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tủ với ID " + req.params.id,
      });
    }

    const panelIdToUpdate = req.params.id;
    const updateData: any = { ...req.body }; // Sao chép body request để có thể sửa đổi

    // --- Logic mới để xử lý main_panel_id dựa trên panel_type và main_panel_ip ---

    // Nếu frontend gửi lên panel_type và nó KHÔNG phải là 'Control Panel' (tức là tủ địa chỉ/phụ)
    if (updateData.panel_type && updateData.panel_type !== "Control Panel") {
      // Kiểm tra xem frontend có gửi kèm Địa chỉ IP của tủ trung tâm không
      if (!updateData.main_panel_ip) {
        // Nếu là tủ địa chỉ/phụ mà không có IP tủ trung tâm, báo lỗi
        return res.status(400).json({
          success: false,
          message:
            "Địa chỉ IP của tủ trung tâm là bắt buộc cho tủ địa chỉ/phụ.",
        });
      }

      // Tìm Panel trung tâm trong database dựa vào Địa chỉ IP mà frontend gửi lên
      const mainPanel = await PanelModel.findOne({
        ip_address: updateData.main_panel_ip,
      });

      // Nếu không tìm thấy Panel nào có IP đó
      if (!mainPanel) {
        return res.status(404).json({
          success: false,
          message:
            "Không tìm thấy tủ trung tâm với địa chỉ IP " +
            updateData.main_panel_ip,
        });
      }

      // Tùy chọn: Kiểm tra thêm xem Panel tìm được có thực sự là loại 'Control Panel' không (để đảm bảo chỉ liên kết với tủ trung tâm thật)
      if (mainPanel.panel_type !== "Control Panel") {
        return res.status(400).json({
          success: false,
          message:
            "Panel với địa chỉ IP " +
            updateData.main_panel_ip +
            " không phải là tủ trung tâm.",
        });
      }

      // Ngăn chặn một Panel làm tủ trung tâm của chính nó (so sánh ID của Panel tìm được với ID Panel đang cập nhật)
      if (mainPanel._id.toString() === panelIdToUpdate.toString()) {
        return res.status(400).json({
          success: false,
          message: "không thể IP đặt tủ trung tâm là chính nó.",
        });
      }
      // Lấy ID của Panel trung tâm vừa tìm được và gán vào trường main_panel_id trong dữ liệu cập nhật
      updateData.main_panel_id = mainPanel._id;
      // Xóa trường main_panel_ip khỏi updateData vì nó không phải là trường trong schema Panel, chỉ dùng để tìm kiếm
      delete updateData.main_panel_ip;
    } else if (updateData.panel_type === "Control Panel") {
      // Nếu panel_type được set là 'Control Panel', thì nó không có tủ trung tâm
      updateData.main_panel_id = null;
      // Đảm bảo xóa main_panel_ip nếu frontend có gửi (trường hợp chuyển từ tủ phụ sang tủ trung tâm)
      delete updateData.main_panel_ip;
    }
    // Nếu panel_type không được gửi lên trong request, logic main_panel_id sẽ không bị thay đổi bởi đoạn code này
    // Nếu bạn muốn cho phép update panel_type mà không cần update main_panel_id cùng lúc (ví dụ: chỉ update tên), code hiện tại vẫn ổn.
    // Nếu bạn muốn cho phép update main_panel_id mà không cần update panel_type cùng lúc, bạn cần xem xét lại logic.
    // Dựa trên modal, dường như panel_type và main_panel_id (hoặc main_panel_ip) luôn đi cùng nhau khi cài đặt chức năng này.        // --- Kết thúc Logic xử lý main_panel_id ---

    // --- Validation cho các trường mới ---

    // Kiểm tra loops_supported
    if (updateData.loops_supported !== undefined) {
      if (
        typeof updateData.loops_supported !== "number" ||
        updateData.loops_supported < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Số lượng loops hỗ trợ phải là số không âm.",
        });
      }
    }

    // Kiểm tra ram_usage
    if (updateData.ram_usage !== undefined) {
      if (
        typeof updateData.ram_usage !== "number" ||
        updateData.ram_usage < 0 ||
        updateData.ram_usage > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "RAM usage phải là số từ 0 đến 100%.",
        });
      }
    }

    // Kiểm tra cpu_usage
    if (updateData.cpu_usage !== undefined) {
      if (
        typeof updateData.cpu_usage !== "number" ||
        updateData.cpu_usage < 0 ||
        updateData.cpu_usage > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "CPU usage phải là số từ 0 đến 100%.",
        });
      }
    }

    // --- Kết thúc validation cho các trường mới ---

    // Tiến hành cập nhật Panel bằng dữ liệu đã chuẩn bị (updateData)
    const updatedPanel = await PanelModel.findByIdAndUpdate(
      panelIdToUpdate,
      updateData, // Sử dụng dữ liệu đã được điều chỉnh (có main_panel_id thay vì main_panel_ip nếu cần)
      { new: true, runValidators: true } // new: true trả về document sau khi cập nhật, runValidators: chạy validator trong schema
    ).populate(
      "main_panel_id",
      "name panel_type ip_address loops_supported ram_usage cpu_usage"
    ); // Populate lại Panel cha sau khi update

    // Kiểm tra xem Panel có tồn tại không sau khi tìm bằng ID params
    if (!updatedPanel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tủ với ID " + req.params.id,
      });
    }
    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin tủ thành công",
      data: updatedPanel,
    });
  } catch (error: any) {
    // --- Xử lý lỗi (giữ nguyên) ---
    console.error("Lỗi khi cập nhật thông tin tủ:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      let errorMessage = "Thông tin tủ bị trùng lặp.";
      if (field === "name") {
        errorMessage = "Tên tủ đã tồn tại.";
      } else if (field === "ip_address") {
        errorMessage = "Địa chỉ IP đã tồn tại.";
      }
      res.status(400).json({ success: false, message: errorMessage });
    } else if (error.name === "ValidationError") {
      res.status(400).json({
        success: false,
        message: "Lỗi xác thực dữ liệu: " + error.message,
      });
    } else if (error.kind === "ObjectId") {
      // Bắt lỗi CastError nếu có ID không hợp lệ ở đâu đó
      return res.status(400).json({
        success: false,
        message: "Định dạng ID không hợp lệ.",
      });
      // Note: req.params.id đã check isValid ở trên, lỗi ObjectId ở đây có thể do main_panel_id nếu không bắt InvalidID ở trên.
    } else {
      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Lỗi khi cập nhật thông tin tủ với ID " + req.params.id,
      });
    }
    // --- Kết thúc Xử lý lỗi ---
  }
};

/**
 * Delete panel by ID
 */
export const deletePanel = async (req: any, res: any) => {
  try {
    const panelIdToDelete = req.params.id;

    // Kiểm tra định dạng ID trong params
    if (!mongoose.Types.ObjectId.isValid(panelIdToDelete)) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tủ với ID " + panelIdToDelete,
      });
    }

    // --- Bổ sung: Kiểm tra các phụ thuộc trước khi xóa ---

    // 1. Kiểm tra FalcBoards phụ thuộc
    const falcBoardsCount = await FalcBoardModel.countDocuments({
      panelId: panelIdToDelete,
    });
    if (falcBoardsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa tủ vì còn ${falcBoardsCount} Bo mạch FALC đang liên kết. Vui lòng xóa các Bo mạch FALC trước.`,
      });
    }

    // 2. Kiểm tra NacBoards phụ thuộc
    const nacBoardsCount = await NacBoardModel.countDocuments({
      panelId: panelIdToDelete,
    });
    if (nacBoardsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa tủ vì còn ${nacBoardsCount} Bo mạch NAC đang liên kết. Vui lòng xóa các Bo mạch NAC trước.`,
      });
    }

    // 3. Kiểm tra các Panels khác đang xem Panel này là tủ trung tâm của chúng (kiểm tra Panels phụ)
    const subPanelsCount = await PanelModel.countDocuments({
      main_panel_id: panelIdToDelete,
    });
    if (subPanelsCount > 0) {
      // Tìm tên của một vài Panels phụ đang liên kết để hiển thị gợi ý
      const subPanels = await PanelModel.find({
        main_panel_id: panelIdToDelete,
      })
        .select("name")
        .limit(3);
      const subPanelNames = subPanels.map((p: any) => p.name).join(", ");

      let message = `Không thể xóa tủ vì còn ${subPanelsCount} tủ khác đang xem tủ này là tủ trung tâm của chúng.`;
      if (subPanelNames) {
        message += ` Ví dụ: ${subPanelNames}.`;
      }
      message += ` Vui lòng gỡ liên kết các tủ này trước.`;

      return res.status(400).json({
        success: false,
        message: message,
      });
    }

    // --- Kết thúc kiểm tra phụ thuộc ---

    // Nếu không có phụ thuộc nào, tiến hành xóa Panel
    const deletedPanel = await PanelModel.findByIdAndDelete(panelIdToDelete);

    if (!deletedPanel) {
      // Lẽ ra không xảy ra nếu ID hợp lệ và không có phụ thuộc, nhưng vẫn kiểm tra phòng hờ
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tủ với ID " + panelIdToDelete,
      });
    }

    // --- Bỏ GHI LOG cấu hình khi xóa Panel theo yêu cầu trước đó ---
    // const description = `Tủ báo cháy "${deletedPanel.name}" (ID: ${deletedPanel._id}) đã bị xóa.`;
    // await createEventLog('ConfigChange', description, 'Panel', deletedPanel._id, null, deletedPanel._id, 'Info');
    // --- Kết thúc bỏ Ghi Log ---

    res.status(200).json({
      success: true,
      message: "Xóa tủ thành công.",
      data: deletedPanel, // Tùy chọn: trả về document đã xóa
    });
  } catch (error: any) {
    // --- Xử lý lỗi (giữ nguyên) ---
    console.error("Lỗi khi xóa tủ:", error);
    if (error.kind === "ObjectId") {
      // Lỗi CastError nếu params.id không hợp lệ (đã check ở trên, nhưng có thể do lỗi khác)
      return res.status(400).json({
        success: false,
        message: "Định dạng ID không hợp lệ.",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi xóa tủ với ID " + req.params.id,
    });
    // --- Kết thúc Xử lý lỗi ---
  }
};
