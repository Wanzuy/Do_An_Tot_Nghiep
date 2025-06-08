import React, { useState } from "react";
import { Modal, Button } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { apiEndpoint } from "../../../../constants/apiEndpoint";
import handleAPI from "../../../../api/handleAPI";
import { errorToast, successToast } from "../../../../utils/toastConfig";

const DeleteTimerModal = ({
    t,
    timerId,
    isOpen,
    onClose,
    onSuccess,
    timer,
}) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);

            const response = await handleAPI(
                apiEndpoint.times.deleteTime(timerId),
                null,
                "delete"
            );

            if (response && response.success) {
                successToast(t("TimerManagement.deleteSuccess"));
                onSuccess(timerId);
            }
        } catch (error) {
            console.error("Error deleting timer:", error);
            errorToast(error.message || t("TimerManagement.deleteError"));
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
            <div className="my-6">
                <p className="text-gray-700">
                    {t("TimerManagement.deleteWarning") ||
                        "Bạn có chắc chắn muốn xóa timer này không?"}
                </p>
                {timer && (
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                        <p className="font-semibold text-gray-800">
                            <span className="text-gray-600">
                                {t("TimerManagement.name")}:{" "}
                            </span>
                            {timer.name}
                        </p>
                        <p className="text-gray-600">
                            <span className="text-gray-600">
                                {" "}
                                {t("TimerManagement.time")}:{" "}
                            </span>
                            {new Date(timer.time).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>
                        {timer.description && (
                            <p className="text-gray-600">
                                <span className="text-gray-600">Mô tả: </span>
                                {timer.description}
                            </p>
                        )}
                    </div>
                )}
                <p className="mt-3 text-red-600 text-[1.4rem]">
                    {t("common.deleteAction") ||
                        "Hành động này không thể hoàn tác."}
                </p>
            </div>

            <div className="flex justify-end gap-2">
                <Button onClick={onClose} disabled={isDeleting}>
                    {t("common.cancel") || "Hủy"}
                </Button>
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

export default DeleteTimerModal;
