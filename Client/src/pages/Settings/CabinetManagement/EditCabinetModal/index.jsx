import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Radio, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { getRules } from "../../../../utils/rules";
import handleAPI from "../../../../api/handleAPI";
import { apiEndpoint } from "../../../../constants/apiEndpoint";
import { errorToast, successToast } from "../../../../utils/toastConfig";

const EditCabinetModal = ({ t, visible, onCancel, cabinet, onSuccess }) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [panelType, setPanelType] = useState("Control Panel");
    const { requiredRule } = getRules(t);

    const ipAddressRule = {
        pattern:
            /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
        message: t("common.invalidIPAddress") || "Địa chỉ IP không hợp lệ",
    };

    useEffect(() => {
        if (visible && cabinet) {
            const values = {
                name: cabinet.name,
                panel_type: cabinet.panel_type,
                location: cabinet.location || "",
            };

            if (cabinet.panel_type === "Sub Panel") {
                values.main_panel_ip = cabinet.main_panel_id.ip_address || "";
            }

            form.setFieldsValue(values);
            setPanelType(cabinet.panel_type);
        }
    }, [visible, cabinet, form]);

    const handlePanelTypeChange = (e) => {
        setPanelType(e.target.value);

        if (e.target.value === "Control Panel") {
            form.setFieldValue("ip_address", undefined);
        }
    };

    const handleSubmit = async (values) => {
        if (!cabinet || !cabinet._id) return;

        if (values.panel_type === "Control Panel") {
            values.ip_address = undefined;
        }

        setSubmitting(true);
        try {
            const response = await handleAPI(
                apiEndpoint.panels.updatePanel(cabinet._id),
                values,
                "put"
            );

            if (response && response.data) {
                successToast(t("common.editSuccess") || "Cập nhật thành công!");
                onSuccess(response.data);
                onCancel();
            }
        } catch (error) {
            console.error("Error updating cabinet:", error);
            errorToast(
                error.message || t("common.editError") || "Lỗi khi cập nhật tủ"
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center text-[#c62828]">
                    <EditOutlined className="mr-2 text-xl" />
                    <span className="text-[2.5rem] font-medium">
                        {t("cabinet.editTitle") || "Cấu hình tủ"}
                    </span>
                </div>
            }
            open={visible}
            onCancel={onCancel}
            footer={null}
            destroyOnClose
            maskClosable={false}
            centered
            width={600}
            className="edit-cabinet-modal"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="mt-4"
                initialValues={{
                    panel_type: "Control Panel",
                }}
            >
                <Form.Item
                    name="name"
                    label={
                        <span className="text-[1.5rem]">
                            {t("cabinet.name")}
                        </span>
                    }
                    rules={[requiredRule]}
                >
                    <Input
                        placeholder={t("cabinet.namePlaceholder")}
                        className="py-2 text-[1.4rem]"
                    />
                </Form.Item>

                <Form.Item
                    name="panel_type"
                    label={
                        <span className="text-[1.5rem]">
                            {t("cabinet.type")}
                        </span>
                    }
                    rules={[requiredRule]}
                >
                    <Radio.Group
                        className="flex gap-6"
                        onChange={handlePanelTypeChange}
                    >
                        <Radio value="Control Panel" className="text-[1.4rem]">
                            {t("cabinet.MainPanel")}
                        </Radio>
                        <Radio value="Sub Panel" className="text-[1.4rem]">
                            {t("cabinet.AddressablePanel")}
                        </Radio>
                    </Radio.Group>
                </Form.Item>

                {panelType === "Sub Panel" && (
                    <Form.Item
                        name="main_panel_ip"
                        label={
                            <span className="text-[1.5rem]">
                                {t("cabinet.ipAddress")}
                            </span>
                        }
                        rules={[ipAddressRule]}
                    >
                        <Input
                            placeholder={t("cabinet.ipAddressPlaceholder")}
                            className="py-2 text-[1.4rem]"
                        />
                    </Form.Item>
                )}

                <Form.Item
                    name="location"
                    label={
                        <span className="text-[1.5rem]">
                            {t("cabinet.location")}
                        </span>
                    }
                >
                    <Input
                        placeholder={t("cabinet.locationPlaceholder")}
                        className="py-2 text-[1.4rem]"
                    />
                </Form.Item>

                <div className="flex justify-end gap-4 mt-6">
                    <Button
                        onClick={onCancel}
                        className="min-w-[100px] h-auto py-2 text-[1.4rem]"
                    >
                        {t("common.cancel")}
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={submitting}
                        className="min-w-[100px] h-auto py-2 text-[1.4rem] bg-[#c62828]"
                    >
                        {t("common.save")}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default EditCabinetModal;
