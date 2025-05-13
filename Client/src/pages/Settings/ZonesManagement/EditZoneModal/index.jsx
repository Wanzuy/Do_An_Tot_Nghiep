import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, TreeSelect } from "antd";
import { EditOutlined } from "@ant-design/icons";
import handleAPI from "../../../../api/handleAPI";
import { errorToast, successToast } from "../../../../utils/toastConfig";
import { getRules } from "../../../../utils/rules";
import { apiEndpoint } from "../../../../constants/apiEndpoint";

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

    // Chuyển đổi dữ liệu zones thành dạng treeSelect
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

    // Tìm tất cả các ID con của một zone để vô hiệu hóa
    const getChildrenIds = (zones, zoneId) => {
        const childrenIds = new Set([zoneId]);

        const findChildren = (id) => {
            zones.forEach((z) => {
                if (z.parentId === id) {
                    childrenIds.add(z._id);
                    findChildren(z._id);
                }
            });
        };

        findChildren(zoneId);
        return childrenIds;
    };

    // Lấy danh sách các node không được phép chọn (bao gồm chính nó và các con của nó)
    const disabledIds = zone ? getChildrenIds(zones, zone._id) : new Set();

    // Tạo dữ liệu dạng cây cho TreeSelect
    const treeData = convertZonesToTreeData(zones);

    // Hàm kiểm tra nếu một node cần bị vô hiệu hóa
    const isNodeDisabled = (nodeData) => {
        return disabledIds.has(nodeData.value);
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
                        disabled={false}
                        treeNodeRender={(nodeData) => ({
                            ...nodeData,
                            disabled: isNodeDisabled(nodeData),
                        })}
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
                        {t("common.save") || "Lưu"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default EditZoneModal;
