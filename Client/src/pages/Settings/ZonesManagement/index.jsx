import React, { useEffect, useState } from "react";
import {
    LeftCircleFilled,
    LoadingOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { Spin } from "antd";
import { Link } from "react-router-dom";
import handleAPI from "../../../api/handleAPI";
import { apiEndpoint } from "../../../constants/apiEndpoint";
import { errorToast } from "../../../utils/toastConfig";
import ZoneTree from "./ZoneTree";
import AddZoneModal from "./AddZoneModal";
import EditZoneModal from "./EditZoneModal";
import DeleteZoneModal from "./DeleteZoneModal";

function ZonesManagement({ t }) {
    const [zones, setZones] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // State cho modal thêm vùng
    const [addModalVisible, setAddModalVisible] = useState(false);

    // State cho modal chỉnh sửa vùng
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [zoneToEdit, setZoneToEdit] = useState(null);

    // State cho modal xóa vùng
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [zoneToDelete, setZoneToDelete] = useState(null);

    useEffect(() => {
        const fetchZones = async () => {
            setIsLoading(true);
            try {
                const response = await handleAPI(apiEndpoint.zones.getAllZones);
                if (response && response.data) {
                    setZones(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu vùng:", error);
                errorToast(error.message || "Không thể tải dữ liệu vùng");
            } finally {
                setIsLoading(false);
            }
        };
        fetchZones();
    }, []);

    const handleAddZone = () => {
        setAddModalVisible(true);
    };

    const handleEditZone = (zone) => {
        setZoneToEdit(zone);
        setEditModalVisible(true);
    };

    const handleEditModalClose = () => {
        setEditModalVisible(false);
        setZoneToEdit(null);
    };

    const handleDeleteZone = (zone) => {
        setZoneToDelete(zone);
        setDeleteModalVisible(true);
    };

    const handleDeleteModalClose = () => {
        setDeleteModalVisible(false);
        setZoneToDelete(null);
    };

    const onAddSuccess = (newZone) => {
        setZones([...zones, newZone]);
    };

    const onEditSuccess = (updatedZone) => {
        setZones(
            zones.map((zone) =>
                zone._id === updatedZone._id
                    ? { ...zone, ...updatedZone }
                    : zone
            )
        );
    };

    const onDeleteSuccess = (deletedId) => {
        setZones(zones.filter((zone) => zone._id !== deletedId));
    };

    // Hàm này chuyển đổi mảng phẳng thành cấu trúc cây
    const buildZoneTree = (items, parentId = null) => {
        return items
            .filter(
                (item) =>
                    (parentId === null && !item.parentId) ||
                    item.parentId === parentId
            )
            .map((item) => ({
                ...item,
                children: buildZoneTree(items, item._id),
            }));
    };

    const zoneTree = buildZoneTree(zones);

    return (
        <div className="p-4 lg:p-[5rem]">
            <div>
                <div className="md:bg-[#434343] md:p-4 md:rounded-xl md:shadow-lg flex flex-col md:flex-row md:justify-between md:items-center mb-8">
                    <div className="flex items-center gap-4 md:mb-0 mb-4">
                        <Link to="/cai-dat">
                            <LeftCircleFilled className="text-[2.5rem] text-white" />
                        </Link>
                        <h1 className="text-3xl font-bold text-white">
                            {t("ZonesManagement.title")}
                        </h1>
                    </div>

                    <button
                        onClick={handleAddZone}
                        className="flex gap-2 items-center justify-center bg-gradient-to-r from-[#c62828] to-[#8f0202] text-white px-4 py-2 rounded-md hover:from-[#d32f2f] hover:to-[#9a0007] hover:shadow-lg hover:shadow-red-900/20 transition-all duration-300"
                    >
                        <PlusOutlined />
                        {t("ZonesManagement.add")}
                    </button>
                </div>
                {/* Danh sách vùng */}
                {isLoading ? (
                    <div className="text-white text-center py-8">
                        <Spin indicator={<LoadingOutlined spin />} /> Đang tải
                        dữ liệu...
                    </div>
                ) : (
                    <div className="bg-[#434343] p-6 rounded-xl text-white shadow-lg border border-white/10">
                        {zoneTree.length > 0 ? (
                            <ZoneTree
                                t={t}
                                zones={zoneTree}
                                onEdit={handleEditZone}
                                onDelete={handleDeleteZone}
                            />
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                Không có dữ liệu vùng. Vui lòng thêm vùng mới.
                            </div>
                        )}
                    </div>
                )}
            </div>
            <AddZoneModal
                t={t}
                isOpen={addModalVisible}
                onClose={() => setAddModalVisible(false)}
                onSuccess={onAddSuccess}
                zones={zones}
            />

            {zoneToEdit && (
                <EditZoneModal
                    t={t}
                    isOpen={editModalVisible}
                    onClose={handleEditModalClose}
                    onSuccess={onEditSuccess}
                    zone={zoneToEdit}
                    zones={zones.filter((z) => z._id !== zoneToEdit._id)}
                />
            )}

            {zoneToDelete && (
                <DeleteZoneModal
                    t={t}
                    isOpen={deleteModalVisible}
                    onClose={handleDeleteModalClose}
                    onSuccess={onDeleteSuccess}
                    zone={zoneToDelete}
                />
            )}
        </div>
    );
}

export default ZonesManagement;
