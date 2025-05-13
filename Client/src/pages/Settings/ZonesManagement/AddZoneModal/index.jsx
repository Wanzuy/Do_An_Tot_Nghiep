import React, { useState } from "react";
import { Modal, Form, Input, Select, Button } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import handleAPI from "../../../../api/handleAPI";
import { errorToast, successToast } from "../../../../utils/toastConfig";
import { apiEndpoint } from "../../../../constants/apiEndpoint";
import { getRules } from "../../../../utils/rules";

const { Option } = Select;
const { TextArea } = Input;

const AddZoneModal = ({ t, isOpen, onClose, onSuccess, zones }) => {
    const { requiredRule } = getRules(t);
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (values) => {
        try {
            setIsSubmitting(true);

            const response = await handleAPI(
                apiEndpoint.zones.addZone,
                values,
                "post"
            );

            if (response && response.data) {
                successToast(t("common.addSuccess") || "Thêm vùng thành công!");
                form.resetFields();
                onSuccess(response.data);
                onClose();
            }
        } catch (error) {
            console.error("Lỗi khi thêm vùng:", error);
            errorToast(
                error.message ||
                    t("common.addError") ||
                    "Đã xảy ra lỗi khi thêm vùng."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center text-[#c62828]">
                    <PlusCircleOutlined className="mr-2 text-xl" />
                    {t("ZonesManagement.add") || "Thêm vùng mới"}
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
                        {zones.map((zone) => (
                            <Option key={zone._id} value={zone._id}>
                                {zone.name}
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
                        {t("common.add") || "Thêm"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default AddZoneModal;
