import React, { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Button, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import handleAPI from "../../../../api/handleAPI";
import { apiEndpoint } from "../../../../constants/apiEndpoint";
import { successToast, errorToast } from "../../../../utils/toastConfig";

function ConfigureFalcModal({ visible, onCancel, falcDevice, onSuccess, t }) {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible && falcDevice) {
      // Đặt giá trị mặc định cho form khi modal mở
      form.setFieldsValue({
        description: falcDevice.description || "",
        number_of_detectors: falcDevice.number_of_detectors || 1,
      });
    }
  }, [visible, falcDevice, form]);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      const response = await handleAPI(
        apiEndpoint.falc.update(falcDevice._id),
        {
          description: values.description,
          number_of_detectors: values.number_of_detectors,
        },
        "put"
      );

      if (response.success) {
        successToast(
          t?.("FalcManagement.configSuccess") || "Cấu hình FALC thành công!"
        );
        onSuccess && onSuccess(response.data);
        handleCancel();
      }
    } catch (error) {
      console.error("Error updating FALC:", error);
      errorToast(
        error?.response?.data?.message ||
          t?.("FalcManagement.configError") ||
          "Có lỗi xảy ra khi cấu hình FALC"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <span className="text-[2.4rem] font-bold">
          {t?.("FalcManagement.configTitle") || "Cấu hình FALC"}
        </span>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      className="falc-config-modal"
    >
      <div className="text-gray-800">
        {/* Thông tin FALC hiện tại */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-[1.8rem] font-semibold mb-2 text-gray-800">
            {t?.("FalcManagement.currentInfo") || "Thông tin hiện tại"}
          </h3>
          <p className="mb-1 text-gray-700">
            <span className="font-medium">
              {t?.("FalcManagement.board") || "Bo mạch"}:
            </span>{" "}
            {falcDevice?.name}
          </p>
          <p className="mb-1 text-gray-700">
            <span className="font-medium">
              {t?.("FalcManagement.panel") || "Tủ điều khiển"}:
            </span>{" "}
            {falcDevice?.panelId?.name}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">
              {t?.("FalcManagement.currentDetectors") || "Số đầu báo hiện có"}:
            </span>{" "}
            {falcDevice?.current_detector_count || 0}
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-4"
        >
          <Form.Item
            label={t?.("FalcManagement.note") || "Ghi chú"}
            name="description"
            rules={[
              {
                max: 255,
                message:
                  t?.("FalcManagement.descriptionMaxLength") ||
                  "Ghi chú không được vượt quá 255 ký tự",
              },
            ]}
          >
            <Input.TextArea
              placeholder={
                t?.("FalcManagement.descriptionPlaceholder") ||
                "Nhập ghi chú về vị trí hoặc mục đích sử dụng"
              }
              rows={3}
              showCount
              maxLength={255}
            />
          </Form.Item>

          <Form.Item
            label={
              t?.("FalcManagement.maxDetectors") || "Số lượng đầu báo tối đa"
            }
            name="number_of_detectors"
            rules={[
              {
                required: true,
                message:
                  t?.("FalcManagement.detectorCountRequired") ||
                  "Số lượng đầu báo là bắt buộc",
              },
              {
                type: "number",
                min: 1,
                max: 200,
                message:
                  t?.("FalcManagement.detectorCountRange") ||
                  "Số lượng đầu báo phải từ 1 đến 200",
              },
            ]}
            extra={
              <span className="text-gray-500 text-[1.4rem]">
                {t?.("FalcManagement.detectorCountNote") ||
                  "Lưu ý: Không thể giảm số lượng xuống dưới số đầu báo hiện có"}
              </span>
            }
          >
            <InputNumber
              placeholder="Nhập số lượng đầu báo tối đa"
              min={Math.max(1, falcDevice?.current_detector_count || 1)}
              max={200}
              precision={0}
              controls={true}
            />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={handleCancel} className="min-w-[100px]">
              {t?.("common.cancel") || "Hủy"}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              className="min-w-[100px] !bg-blue-500 hover:!bg-blue-600"
              icon={isLoading ? <LoadingOutlined spin /> : null}
            >
              {t?.("common.save") || "Lưu"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}

export default ConfigureFalcModal;
