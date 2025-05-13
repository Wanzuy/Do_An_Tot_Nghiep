import React, { useState } from "react";
import { Modal, Form, Input, Button, TreeSelect } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import handleAPI from "../../../../api/handleAPI";
import { errorToast, successToast } from "../../../../utils/toastConfig";
import { apiEndpoint } from "../../../../constants/apiEndpoint";
import { getRules } from "../../../../utils/rules";

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

    // Chuyển đổi dữ liệu zones thành dạng cây cho TreeSelect
    const convertZonesToTreeData = (items, parentId = null) => {
        return items
            .filter(
                (item) =>
                    (parentId === null && !item.parentId) ||
                    item.parentId === parentId
            )
            .map((item) => ({
                title: item.name,
                value: item._id,
                key: item._id,
                children: convertZonesToTreeData(items, item._id),
            }));
    };

    // Tạo dữ liệu dạng cây cho TreeSelect
    const treeData = convertZonesToTreeData(zones);

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
                    <TreeSelect
                        treeData={treeData}
                        placeholder={t("ZonesManagement.parentZonePlaceholder")}
                        allowClear
                        treeDefaultExpandAll
                        showSearch
                        filterTreeNode={(inputValue, treeNode) =>
                            treeNode.title
                                .toLowerCase()
                                .includes(inputValue.toLowerCase())
                        }
                        treeNodeLabelProp="title"
                        treeLine={{ showLeafIcon: false }}
                        treeNodeFilterProp="title"
                    />
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
