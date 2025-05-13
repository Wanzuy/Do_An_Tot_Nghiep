import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Switch, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import handleAPI from "../../../../api/handleAPI";
import { getRules } from "../../../../utils/rules";
import { apiEndpoint } from "../../../../constants/apiEndpoint";
import { errorToast, successToast } from "../../../../utils/toastConfig";

function EditUserModal({ t, isOpen, onClose, userId, onSuccess, users }) {
    const { requiredRule, passwordComplexity } = getRules(t);

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            const currentUser = users.find((user) => user._id === userId);
            if (currentUser) {
                form.setFieldsValue({
                    accountname: currentUser.accountname,
                    showname: currentUser.showname,
                    role: currentUser.role,
                    status: currentUser.status === true,
                });
            }
        }
    }, [isOpen, userId, users, form]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const updateData = {
                showname: values.showname,
                role: values.role,
                status: values.status,
            };

            if (values.password && values.password.trim() !== "") {
                updateData.password = values.password;
            }

            const response = await handleAPI(
                apiEndpoint.auth.updateAccount(userId),
                updateData,
                "put"
            );

            if (response && response.data) {
                successToast(t("common.editSuccess"));
                onSuccess({
                    _id: userId,
                    ...updateData,
                    accountname: values.accountname,
                });
                onClose();
            }
        } catch (error) {
            console.error("Error updating user:", error);
            errorToast(error.message || t("common.editError"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={t("AccountManagement.editAccount")}
            open={isOpen}
            onCancel={onClose}
            footer={null}
            maskClosable={false}
            destroyOnClose={true}
            className="edit-user-modal"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                preserve={false}
            >
                {/* Account Name (Read-only) */}
                <Form.Item
                    name="accountname"
                    label={t("AccountManagement.accountname")}
                >
                    <Input disabled />
                </Form.Item>

                {/* Display Name */}
                <Form.Item
                    name="showname"
                    label={t("AccountManagement.showname")}
                    rules={[requiredRule]}
                >
                    <Input />
                </Form.Item>

                {/* Role */}
                <Form.Item name="role" label={t("AccountManagement.role")}>
                    <Select>
                        <Select.Option value={1}>
                            {t("AccountManagement.admin")}
                        </Select.Option>
                        <Select.Option value={2}>
                            {t("AccountManagement.operate")}
                        </Select.Option>
                        <Select.Option value={3}>
                            {t("AccountManagement.Technician")}
                        </Select.Option>
                        <Select.Option value={4} disabled={true}>
                            {t("AccountManagement.unprivileged")}
                        </Select.Option>
                    </Select>
                </Form.Item>

                {/* Status */}
                <Form.Item
                    name="status"
                    label={t("AccountManagement.status") || "Status"}
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>

                {/* Password (Optional) */}
                <Form.Item
                    name="password"
                    label={t("AccountManagement.passwordNew")}
                    rules={[passwordComplexity]}
                >
                    <Input.Password
                        placeholder={t(
                            "AccountManagement.passwordNewPlaceholder"
                        )}
                    />
                </Form.Item>

                {/* Form Actions */}
                <div className="flex justify-end space-x-2 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        {t("common.cancel") || "Cancel"}
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
                    >
                        {loading ? (
                            <Spin
                                indicator={
                                    <LoadingOutlined spin className="mr-2" />
                                }
                            />
                        ) : null}
                        {t("common.save")}
                    </button>
                </div>
            </Form>
        </Modal>
    );
}

export default EditUserModal;
