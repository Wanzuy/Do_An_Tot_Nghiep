import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, TimePicker, Button } from "antd";
import dayjs from "dayjs";
import { EditOutlined } from "@ant-design/icons";
import { getRules } from "../../../../utils/rules";
import { errorToast, successToast } from "../../../../utils/toastConfig";
import handleAPI from "../../../../api/handleAPI";
import { apiEndpoint } from "../../../../constants/apiEndpoint";

const { Option } = Select;
const { TextArea } = Input;

function EditTimerModal({ t, isOpen, onClose, onSuccess, timer }) {
    const { requiredRule } = getRules(t);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const weekdays = [
        { value: "monday", label: t("TimerManagement.monday") },
        { value: "tuesday", label: t("TimerManagement.tuesday") },
        { value: "wednesday", label: t("TimerManagement.wednesday") },
        { value: "thursday", label: t("TimerManagement.thursday") },
        { value: "friday", label: t("TimerManagement.friday") },
        { value: "saturday", label: t("TimerManagement.saturday") },
        { value: "sunday", label: t("TimerManagement.sunday") },
    ];

    // Load timer data when modal opens
    useEffect(() => {
        if (isOpen && timer) {
            form.setFieldsValue({
                name: timer.name,
                time: dayjs(timer.time),
                repeat: timer.repeat || [],
                audioFile: timer.audioFile,
                description: timer.description || "",
            });
        }
    }, [isOpen, timer, form]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            // Create a proper Date object from the time picker value
            const timeDate = dayjs(values.time).toDate();

            const timerData = {
                name: values.name,
                time: timeDate,
                repeat: values.repeat || [],
                audioFile: values.audioFile,
                description: values.description || "",
            };

            const response = await handleAPI(
                apiEndpoint.times.updateTime(timer._id),
                timerData,
                "PUT"
            );

            if (response && response.success) {
                successToast(t("common.editSuccess"));
                onSuccess(response.data);
                handleClose();
            }
        } catch (error) {
            console.error("Error updating timer:", error);
            errorToast("Lỗi khi cập nhật hẹn giờ");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title={
                <div className="flex items-center text-[#c62828]">
                    <EditOutlined className="mr-2 text-xl" />
                    {t("TimerManagement.edit") || "Chỉnh sửa hẹn giờ"}
                </div>
            }
            open={isOpen}
            onCancel={handleClose}
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
                            {t("TimerManagement.name")}
                        </span>
                    }
                    rules={[requiredRule]}
                >
                    <Input
                        placeholder={t("TimerManagement.namePlaceholder")}
                        className="w-full"
                    />
                </Form.Item>

                <Form.Item
                    name="time"
                    label={
                        <span className="text-gray-700">
                            {t("TimerManagement.time")}
                        </span>
                    }
                    rules={[requiredRule]}
                >
                    <TimePicker
                        format="HH:mm"
                        placeholder={t("TimerManagement.timePlaceholder")}
                        className="w-full"
                    />
                </Form.Item>

                <Form.Item
                    name="repeat"
                    label={
                        <span className="text-gray-700">
                            {t("TimerManagement.repeat")}
                        </span>
                    }
                >
                    <Select
                        mode="multiple"
                        placeholder={t("TimerManagement.repeatPlaceholder")}
                        className="w-full"
                        allowClear
                    >
                        {weekdays.map((day) => (
                            <Option key={day.value} value={day.value}>
                                {day.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="audioFile"
                    label={
                        <span className="text-gray-700">
                            {t("TimerManagement.audioFile")}
                        </span>
                    }
                    rules={[requiredRule]}
                >
                    <Input
                        placeholder={t("TimerManagement.audioFilePlaceholder")}
                        className="w-full"
                    />
                </Form.Item>

                <Form.Item
                    name="description"
                    label={
                        <span className="text-gray-700">
                            {t("TimerManagement.description")}
                        </span>
                    }
                >
                    <TextArea
                        rows={3}
                        placeholder={t(
                            "TimerManagement.descriptionPlaceholder"
                        )}
                        maxLength={500}
                    />
                </Form.Item>

                <Form.Item className="flex justify-end gap-2 mb-0">
                    <Button onClick={handleClose} className="mr-2">
                        {t("common.cancel")}
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className="bg-[#c62828]"
                    >
                        {t("common.edit")}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default EditTimerModal;
