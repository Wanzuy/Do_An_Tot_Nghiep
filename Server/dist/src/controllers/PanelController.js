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
exports.deletePanel = exports.updatePanel = exports.getPanelById = exports.getAllPanels = exports.createPanel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const PanelModel_1 = __importDefault(require("../models/PanelModel"));
const FalcBoardModel_1 = __importDefault(require("../models/FalcBoardModel"));
const NacBoardModel_1 = __importDefault(require("../models/NacBoardModel"));
const createPanel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Kiểm tra nếu main_panel_id được cung cấp và không rỗng, nó phải là một Panel tồn tại
        if (req.body.main_panel_id) {
            // Kiểm tra định dạng ID
            if (!mongoose_1.default.Types.ObjectId.isValid(req.body.main_panel_id)) {
                return res.status(400).json({
                    success: false,
                    message: "Định dạng ID của tủ trung tâm không hợp lệ.",
                });
            }
            const mainPanel = yield PanelModel_1.default.findById(req.body.main_panel_id);
            if (!mainPanel) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy tủ trung tâm với ID " +
                        req.body.main_panel_id,
                });
            }
        }
        // Tạo Panel mới bằng cách truyền trực tiếp req.body
        const newPanel = new PanelModel_1.default(req.body);
        const savedPanel = yield newPanel.save();
        // Populate thông tin tủ cha trước khi trả về
        const result = yield PanelModel_1.default.findById(savedPanel._id).populate("main_panel_id", "name panel_type ip_address");
        res.status(201).json({
            success: true,
            message: "Tạo tủ thành công",
            data: result,
        });
    }
    catch (error) {
        console.error("Lỗi khi tạo tủ:", error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            let errorMessage = "Thông tin tủ bị trùng lặp.";
            if (field === "name") {
                errorMessage = "Tên tủ đã tồn tại.";
            }
            else if (field === "ip_address") {
                errorMessage = "Địa chỉ IP đã tồn tại.";
            }
            res.status(400).json({
                success: false,
                message: errorMessage,
            });
        }
        else if (error.name === "ValidationError") {
            // Xử lý lỗi validation của Mongoose
            res.status(400).json({
                success: false,
                message: "Lỗi xác thực dữ liệu: " + error.message,
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: error.message || "Đã xảy ra lỗi khi tạo tủ.",
            });
        }
    }
});
exports.createPanel = createPanel;
/**
 * Get all panels
 */
const getAllPanels = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = {};
        // Thêm logic lọc theo panel_type nếu có query parameter
        if (req.query.panel_type) {
            query.panel_type = req.query.panel_type;
        }
        // Thêm logic lọc theo main_panel_id nếu có query parameter (để lấy tủ con)
        if (req.query.main_panel_id) {
            // Kiểm tra định dạng ID trong query
            if (!mongoose_1.default.Types.ObjectId.isValid(req.query.main_panel_id)) {
                return res.status(400).json({
                    success: false,
                    message: "Định dạng ID tủ trung tâm trong tham số truy vấn không hợp lệ.",
                });
            }
            query.main_panel_id = req.query.main_panel_id;
        }
        else if (req.query.isRoot === "true") {
            // Lọc chỉ lấy tủ gốc (main_panel_id là null) nếu có query parameter isRoot=true
            query.main_panel_id = null;
        }
        // Lấy Panels và populate thông tin tủ cha
        const panels = yield PanelModel_1.default.find(query).populate("main_panel_id", "name panel_type ip_address");
        res.status(200).json({
            success: true,
            count: panels.length,
            data: panels,
        });
    }
    catch (error) {
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
});
exports.getAllPanels = getAllPanels;
/**
 * Get panel by ID
 * @route GET /api/panels/:id
 */
const getPanelById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Kiểm tra định dạng ID trong params
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tủ với ID " + req.params.id,
            });
        }
        const panel = yield PanelModel_1.default.findById(req.params.id).populate("main_panel_id", "name panel_type ip_address");
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
    }
    catch (error) {
        console.error("Lỗi khi lấy thông tin tủ theo ID:", error);
        // Lỗi CastError đã được bắt ở kiểm tra isValid phía trên, lỗi khác là lỗi server
        res.status(500).json({
            success: false,
            message: error.message ||
                "Lỗi khi lấy thông tin tủ với ID " + req.params.id,
        });
    }
});
exports.getPanelById = getPanelById;
/**
 * Update panel by ID
 */
const updatePanel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Kiểm tra định dạng ID trong params
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tủ với ID " + req.params.id,
            });
        }
        const panelIdToUpdate = req.params.id;
        const updateData = Object.assign({}, req.body); // Sao chép body request để có thể sửa đổi
        // --- Logic mới để xử lý main_panel_id dựa trên panel_type và main_panel_ip ---
        // Nếu frontend gửi lên panel_type và nó KHÔNG phải là 'Control Panel' (tức là tủ địa chỉ/phụ)
        if (updateData.panel_type &&
            updateData.panel_type !== "Control Panel") {
            // Kiểm tra xem frontend có gửi kèm Địa chỉ IP của tủ trung tâm không
            if (!updateData.main_panel_ip) {
                // Nếu là tủ địa chỉ/phụ mà không có IP tủ trung tâm, báo lỗi
                return res.status(400).json({
                    success: false,
                    message: "Địa chỉ IP của tủ trung tâm là bắt buộc cho tủ địa chỉ/phụ.",
                });
            }
            // Tìm Panel trung tâm trong database dựa vào Địa chỉ IP mà frontend gửi lên
            const mainPanel = yield PanelModel_1.default.findOne({
                ip_address: updateData.main_panel_ip,
            });
            // Nếu không tìm thấy Panel nào có IP đó
            if (!mainPanel) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy tủ trung tâm với địa chỉ IP " +
                        updateData.main_panel_ip,
                });
            }
            // Tùy chọn: Kiểm tra thêm xem Panel tìm được có thực sự là loại 'Control Panel' không (để đảm bảo chỉ liên kết với tủ trung tâm thật)
            if (mainPanel.panel_type !== "Control Panel") {
                return res.status(400).json({
                    success: false,
                    message: "Panel với địa chỉ IP " +
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
        }
        else if (updateData.panel_type === "Control Panel") {
            // Nếu panel_type được set là 'Control Panel', thì nó không có tủ trung tâm
            updateData.main_panel_id = null;
            // Đảm bảo xóa main_panel_ip nếu frontend có gửi (trường hợp chuyển từ tủ phụ sang tủ trung tâm)
            delete updateData.main_panel_ip;
        }
        // Nếu panel_type không được gửi lên trong request, logic main_panel_id sẽ không bị thay đổi bởi đoạn code này
        // Nếu bạn muốn cho phép update panel_type mà không cần update main_panel_id cùng lúc (ví dụ: chỉ update tên), code hiện tại vẫn ổn.
        // Nếu bạn muốn cho phép update main_panel_id mà không cần update panel_type cùng lúc, bạn cần xem xét lại logic.
        // Dựa trên modal, dường như panel_type và main_panel_id (hoặc main_panel_ip) luôn đi cùng nhau khi cài đặt chức năng này.
        // --- Kết thúc Logic xử lý main_panel_id ---
        // Tiến hành cập nhật Panel bằng dữ liệu đã chuẩn bị (updateData)
        const updatedPanel = yield PanelModel_1.default.findByIdAndUpdate(panelIdToUpdate, updateData, // Sử dụng dữ liệu đã được điều chỉnh (có main_panel_id thay vì main_panel_ip nếu cần)
        { new: true, runValidators: true } // new: true trả về document sau khi cập nhật, runValidators: chạy validator trong schema
        ).populate("main_panel_id", "name panel_type ip_address"); // Populate lại Panel cha sau khi update
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
    }
    catch (error) {
        // --- Xử lý lỗi (giữ nguyên) ---
        console.error("Lỗi khi cập nhật thông tin tủ:", error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            let errorMessage = "Thông tin tủ bị trùng lặp.";
            if (field === "name") {
                errorMessage = "Tên tủ đã tồn tại.";
            }
            else if (field === "ip_address") {
                errorMessage = "Địa chỉ IP đã tồn tại.";
            }
            res.status(400).json({ success: false, message: errorMessage });
        }
        else if (error.name === "ValidationError") {
            res.status(400).json({
                success: false,
                message: "Lỗi xác thực dữ liệu: " + error.message,
            });
        }
        else if (error.kind === "ObjectId") {
            // Bắt lỗi CastError nếu có ID không hợp lệ ở đâu đó
            return res.status(400).json({
                success: false,
                message: "Định dạng ID không hợp lệ.",
            });
            // Note: req.params.id đã check isValid ở trên, lỗi ObjectId ở đây có thể do main_panel_id nếu không bắt InvalidID ở trên.
        }
        else {
            res.status(500).json({
                success: false,
                message: error.message ||
                    "Lỗi khi cập nhật thông tin tủ với ID " + req.params.id,
            });
        }
        // --- Kết thúc Xử lý lỗi ---
    }
});
exports.updatePanel = updatePanel;
/**
 * Delete panel by ID
 */
const deletePanel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const panelIdToDelete = req.params.id;
        // Kiểm tra định dạng ID trong params
        if (!mongoose_1.default.Types.ObjectId.isValid(panelIdToDelete)) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tủ với ID " + panelIdToDelete,
            });
        }
        // --- Bổ sung: Kiểm tra các phụ thuộc trước khi xóa ---
        // 1. Kiểm tra FalcBoards phụ thuộc
        const falcBoardsCount = yield FalcBoardModel_1.default.countDocuments({
            panelId: panelIdToDelete,
        });
        if (falcBoardsCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Không thể xóa tủ vì còn ${falcBoardsCount} Bo mạch FALC đang liên kết. Vui lòng xóa các Bo mạch FALC trước.`,
            });
        }
        // 2. Kiểm tra NacBoards phụ thuộc
        const nacBoardsCount = yield NacBoardModel_1.default.countDocuments({
            panelId: panelIdToDelete,
        });
        if (nacBoardsCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Không thể xóa tủ vì còn ${nacBoardsCount} Bo mạch NAC đang liên kết. Vui lòng xóa các Bo mạch NAC trước.`,
            });
        }
        // 3. Kiểm tra các Panels khác đang xem Panel này là tủ trung tâm của chúng (kiểm tra Panels phụ)
        const subPanelsCount = yield PanelModel_1.default.countDocuments({
            main_panel_id: panelIdToDelete,
        });
        if (subPanelsCount > 0) {
            // Tìm tên của một vài Panels phụ đang liên kết để hiển thị gợi ý
            const subPanels = yield PanelModel_1.default.find({
                main_panel_id: panelIdToDelete,
            })
                .select("name")
                .limit(3);
            const subPanelNames = subPanels.map((p) => p.name).join(", ");
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
        const deletedPanel = yield PanelModel_1.default.findByIdAndDelete(panelIdToDelete);
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
    }
    catch (error) {
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
});
exports.deletePanel = deletePanel;
//# sourceMappingURL=PanelController.js.map