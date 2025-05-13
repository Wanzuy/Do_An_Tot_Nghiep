import React, { useState } from "react";
import { Modal, Button } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { apiEndpoint } from "../../../../constants/apiEndpoint";
import handleAPI from "../../../../api/handleAPI";
import { errorToast, successToast } from "../../../../utils/toastConfig";

const DeleteUserModal = ({ t, userId, isOpen, onClose, onSuccess }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);

            const response = await handleAPI(
                apiEndpoint.auth.deleteAccount(userId),
                null,
                "delete"
            );

            if (response) {
                successToast(t("common.deleteSuccess"));
                onSuccess(userId);
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            errorToast(t("common.deleteError"));
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
                    {t("common.confirmDelete")}
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            footer={null}
            centered
        >
            <p className="my-6">{t("common.deleteWarning")}</p>

            <div className="flex justify-end gap-2">
                <Button onClick={onClose}>{t("common.cancel")}</Button>
                <Button
                    type="primary"
                    danger
                    loading={isDeleting}
                    onClick={handleDelete}
                >
                    {t("common.delete")}
                </Button>
            </div>
        </Modal>
    );
};

export default DeleteUserModal;
