import React, { useState } from "react";
import { Modal, Button } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { apiEndpoint } from "../../../../constants/apiEndpoint";
import handleAPI from "../../../../api/handleAPI";
import { errorToast, successToast } from "../../../../utils/toastConfig";

const DeleteZoneModal = ({ t, isOpen, onClose, onSuccess, zone }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);

            const response = await handleAPI(
                apiEndpoint.zones.deleteZone(zone._id),
                null,
                "delete"
            );

            if (response) {
                successToast(t("common.deleteSuccess") || "Xóa thành công!");
                onSuccess(zone._id);
            }
        } catch (error) {
            console.error("Lỗi khi xóa vùng:", error);
            if (error.childrenCount > 0) {
                errorToast(error.message);
            } else {
                errorToast(
                    error.message ||
                        t("common.deleteError") ||
                        "Đã xảy ra lỗi khi xóa vùng."
                );
            }
        } finally {
            setIsDeleting(false);
            onClose();
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center text-red-500">
                    <ExclamationCircleOutlined className="mr-2 text-xl" />
                    {t("common.confirmDelete") || "Xác nhận xóa"}
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            footer={null}
            centered
        >
            <p className="my-6">
                {t("ZonesManagement.deleteWarning") ||
                    `Bạn có chắc chắn muốn xóa vùng "${zone?.name}" không? Hành động này không thể hoàn tác.`}
            </p>

            <div className="flex justify-end gap-2">
                <Button onClick={onClose}>{t("common.cancel") || "Hủy"}</Button>
                <Button
                    type="primary"
                    danger
                    loading={isDeleting}
                    onClick={handleDelete}
                >
                    {t("common.delete") || "Xóa"}
                </Button>
            </div>
        </Modal>
    );
};

export default DeleteZoneModal;
