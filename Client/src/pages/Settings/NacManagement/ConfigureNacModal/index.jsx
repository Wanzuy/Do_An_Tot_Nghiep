import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message, Spin } from "antd";
import handleAPI from "../../../../api/handleAPI";
import { apiEndpoint } from "../../../../constants/apiEndpoint";

const ConfigureNacModal = ({ visible, onCancel, nacBoard, onSuccess, t }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (nacBoard) {
        form.setFieldsValue({
          name: nacBoard.name || "",
          description: nacBoard.description || "",
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, nacBoard, form]);
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      let response;
      if (nacBoard) {
        // Update existing NAC board
        response = await handleAPI(
          apiEndpoint.nac.update(nacBoard._id),
          values,
          "put"
        );
        console.log("Update response:", response); // Debug log
        message.success(t("NacManagement.configSuccess"));
      } else {
        // Create new NAC board - không cho phép tạo mới, chỉ cập nhật
        message.error(t("NacManagement.createNotAllowed"));
        return;
      }

      if (response && response.data) {
        onSuccess(response.data);
        onCancel();
      }
    } catch (error) {
      console.error("Error configuring NAC board:", error);
      message.error(
        nacBoard
          ? t("NacManagement.configError")
          : t("NacManagement.createError")
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal
      title={t("NacManagement.configTitle")}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      className="nac-config-modal"
    >
      {" "}
      <style jsx global>{`
        .nac-config-modal .ant-modal-content {
          background-color: white !important;
          color: black !important;
        }
        .nac-config-modal .ant-modal-header {
          background-color: white !important;
          border-bottom: 1px solid #d9d9d9 !important;
        }
        .nac-config-modal .ant-modal-title {
          color: black !important;
        }
        .nac-config-modal .ant-modal-close-x {
          color: black !important;
        }
        .nac-config-modal .ant-form-item-label > label {
          color: black !important;
        }
        .nac-config-modal .ant-input,
        .nac-config-modal .ant-input-number,
        .nac-config-modal .ant-select-selector {
          background-color: white !important;
          border-color: #d9d9d9 !important;
          color: black !important;
        }
        .nac-config-modal .ant-input::placeholder,
        .nac-config-modal .ant-input-number-input::placeholder {
          color: #999 !important;
        }
        .nac-config-modal .ant-select-arrow {
          color: black !important;
        }
      `}</style>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label={t("NacManagement.boardName")}
          rules={[
            {
              required: true,
              message: t("NacManagement.boardNameRequired"),
            },
          ]}
        >
          <Input placeholder={t("NacManagement.boardNamePlaceholder")} />
        </Form.Item>

        <Form.Item
          name="description"
          label={t("NacManagement.description")}
          rules={[
            {
              max: 255,
              message: t("NacManagement.descriptionMaxLength"),
            },
          ]}
        >
          <Input.TextArea
            rows={3}
            placeholder={t("NacManagement.descriptionPlaceholder")}
          />
        </Form.Item>

        <Form.Item className="mb-0 flex justify-end gap-2">
          <Button onClick={onCancel} className="mr-2">
            {t("common.cancel")}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={loading}
            className="min-w-[100px] bg-red-500 hover:!bg-red-600"
          >
            {loading ? <Spin size="small" /> : t("common.update")}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConfigureNacModal;
