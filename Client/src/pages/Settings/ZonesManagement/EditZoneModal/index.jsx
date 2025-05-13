import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import handleAPI from "../../../../api/handleAPI";
import { errorToast, successToast } from "../../../../utils/toastConfig";
import { getRules } from "../../../../utils/rules";
import { apiEndpoint } from "../../../../constants/apiEndpoint";

const { Option } = Select;
const { TextArea } = Input;

const EditZoneModal = ({ t, isOpen, onClose, onSuccess, zone, zones }) => {
    const { requiredRule } = getRules(t);
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && zone) {
            form.setFieldsValue({
                name: zone.name,
                parentId: zone.parentId || undefined,
                description: zone.description,
            });
        }
    }, [isOpen, zone, form]);

    const handleSubmit = async (values) => {
        try {
            setIsSubmitting(true);

            const submitValues = { ...values };
            if (values.parentId === undefined) {
                submitValues.parentId = null;
            }
            const response = await handleAPI(
                apiEndpoint.zones.updateZone(zone._id),
                submitValues,
                "put"
            );

            if (response && response.data) {
                successToast(
                    t("common.editSuccess") || "Chỉnh sửa thành công!"
                );
                onSuccess(response.data);
                onClose();
            }
        } catch (error) {
            console.error("Lỗi khi chỉnh sửa vùng:", error);
            errorToast(
                error.message ||
                    t("common.editError") ||
                    "Đã xảy ra lỗi khi chỉnh sửa vùng."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center text-[#c62828]">
                    <EditOutlined className="mr-2 text-xl" />
                    {t("ZonesManagement.edit") || "Chỉnh sửa vùng"}
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            footer={null}
            centered
            width={500}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="mt-4"
            >
                <Form.Item
                    name="name"
                    label={
                        <span className="text-gray-700">
                            {t("ZonesManagement.zoneName") || "Tên vùng"}
                        </span>
                    }
                    rules={[requiredRule]}
                >
                    <Input
                        placeholder={t("ZonesManagement.zoneNamePlaceholder")}
                    />
                </Form.Item>

                <Form.Item
                    name="parentId"
                    label={
                        <span className="text-gray-700">
                            {t("ZonesManagement.parentZone") || "Vùng cha"}
                        </span>
                    }
                >
                    <Select
                        placeholder={t("ZonesManagement.parentZonePlaceholder")}
                        allowClear
                    >
                        {zones.map((zoneItem) => (
                            <Option key={zoneItem._id} value={zoneItem._id}>
                                {zoneItem.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="description"
                    label={
                        <span className="text-gray-700">
                            {t("ZonesManagement.description") || "Mô tả"}
                        </span>
                    }
                >
                    <TextArea
                        placeholder={t(
                            "ZonesManagement.descriptionPlaceholder"
                        )}
                        rows={4}
                    />
                </Form.Item>

                <div className="flex justify-end gap-2 mt-6">
                    <Button onClick={onClose}>
                        {t("common.cancel") || "Hủy"}
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isSubmitting}
                        className="bg-[#c62828]"
                    >
                        {t("common.save") || "Lưu"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default EditZoneModal;
