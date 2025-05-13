import React, { useState } from "react";
import { Modal, Form, Input, Select, Button } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import { errorToast, successToast } from "../../../../utils/toastConfig";
import { apiEndpoint } from "../../../../constants/apiEndpoint";
import handleAPI from "../../../../api/handleAPI";
import { getRules } from "../../../../utils/rules";

const { Option } = Select;

const AddUserModal = ({ t, isOpen, onClose, onSuccess }) => {
    const { accountnameRule, passwordRule, requiredRule } = getRules(t);
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (values) => {
        try {
            setIsSubmitting(true);

            const response = await handleAPI(
                apiEndpoint.auth.createAccount,
                values,
                "post"
            );

            if (response && response.data) {
                successToast(t("common.addSuccess"));
                form.resetFields();
                onSuccess(response.data);
                onClose();
            }
        } catch (error) {
            console.error("Error creating user:", error);
            errorToast(error.message || t("common.addError"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center text-[#c62828]">
                    <UserAddOutlined className="mr-2 text-xl" />
                    {t("AccountManagement.add")}
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
                    name="accountname"
                    label={
                        <span className="text-gray-700">
                            {t("AccountManagement.accountname")}
                        </span>
                    }
                    rules={accountnameRule}
                >
                    <Input
                        placeholder={t(
                            "AccountManagement.accountnamePlaceholder"
                        )}
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    label={
                        <span className="text-gray-700">
                            {t("AccountManagement.password")}
                        </span>
                    }
                    rules={passwordRule}
                    validateTrigger="onBlur"
                >
                    <Input.Password
                        placeholder={t("AccountManagement.passwordPlaceholder")}
                    />
                </Form.Item>

                <Form.Item
                    name="showname"
                    label={
                        <span className="text-gray-700">
                            {t("AccountManagement.showname")}
                        </span>
                    }
                    rules={[requiredRule]}
                >
                    <Input
                        placeholder={t("AccountManagement.shownamePlaceholder")}
                    />
                </Form.Item>

                <Form.Item
                    name="role"
                    label={
                        <span className="text-gray-700">
                            {t("AccountManagement.role")}
                        </span>
                    }
                >
                    <Select
                        placeholder={t("AccountManagement.rolePlaceholder")}
                    >
                        <Option value={1}>
                            {t("AccountManagement.admin")}
                        </Option>
                        <Option value={2}>
                            {t("AccountManagement.operate")}
                        </Option>
                        <Option value={3}>
                            {t("AccountManagement.Technician")}
                        </Option>
                    </Select>
                </Form.Item>

                <div className="flex justify-end gap-2 mt-6">
                    <Button onClick={onClose}>{t("common.cancel")}</Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isSubmitting}
                        className="bg-[#c62828]"
                    >
                        {t("common.add")}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default AddUserModal;
