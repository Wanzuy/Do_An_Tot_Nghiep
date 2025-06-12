import React, { useState, useEffect } from "react";
import { Modal, Spin, Card, Tag, Descriptions, Button } from "antd";
import {
  LoadingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  SettingOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import handleAPI from "../../../../api/handleAPI";
import { apiEndpoint } from "../../../../constants/apiEndpoint";

function FalcDetailModal({ visible, onCancel, falcDevice, t, onConfigure }) {
  const [isLoading, setIsLoading] = useState(false);
  const [deviceDetails, setDeviceDetails] = useState(null);
  const [detectors, setDetectors] = useState([]);

  useEffect(() => {
    if (visible && falcDevice) {
      fetchDeviceDetails();
      fetchDetectors();
    }
  }, [visible, falcDevice]);

  const fetchDeviceDetails = async () => {
    if (!falcDevice?._id) return;

    setIsLoading(true);
    try {
      const response = await handleAPI(
        apiEndpoint.falc.getById
          ? apiEndpoint.falc.getById(falcDevice._id)
          : `/falcboards/${falcDevice._id}`
      );
      if (response && response.data) {
        setDeviceDetails(response.data);
      }
    } catch (error) {
      console.error("Error fetching device details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetectors = async () => {
    if (!falcDevice?._id) return;

    try {
      const response = await handleAPI(
        `/detectors?falcBoardId=${falcDevice._id}`
      );
      if (response && response.data) {
        setDetectors(response.data);
      }
    } catch (error) {
      console.error("Error fetching detectors:", error);
      setDetectors([]);
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "Normal":
        return (
          <Tag
            icon={<CheckCircleOutlined />}
            color="success"
            className="text-[1.4rem] py-1 px-3"
          >
            {t?.("common.normal") || "Bình thường"}
          </Tag>
        );
      case "Fault":
        return (
          <Tag
            icon={<ExclamationCircleOutlined />}
            color="error"
            className="text-[1.4rem] py-1 px-3"
          >
            {t?.("common.fault") || "Lỗi"}
          </Tag>
        );
      case "Offline":
        return (
          <Tag
            icon={<StopOutlined />}
            color="default"
            className="text-[1.4rem] py-1 px-3"
          >
            {t?.("common.offline") || "Ngoại tuyến"}
          </Tag>
        );
      default:
        return <Tag className="text-[1.4rem] py-1 px-3">{status}</Tag>;
    }
  };

  const getActiveTag = (isActive) => {
    return isActive ? (
      <Tag color="green" className="text-[1.4rem] py-1 px-3">
        {t?.("common.active") || "Hoạt động"}
      </Tag>
    ) : (
      <Tag color="red" className="text-[1.4rem] py-1 px-3">
        {t?.("common.inactive") || "Không hoạt động"}
      </Tag>
    );
  };

  const handleConfigure = () => {
    onConfigure && onConfigure(deviceDetails || falcDevice);
    onCancel();
  };

  const displayDevice = deviceDetails || falcDevice;

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <EyeOutlined className="text-blue-500 text-2xl" />
          <span className="text-[2.4rem] font-bold text-gray-800">
            {t?.("FalcManagement.detailTitle") || "Chi tiết FALC"}
          </span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} className="min-w-[100px]">
          {t?.("common.close") || "Đóng"}
        </Button>,
        <Button
          key="configure"
          type="primary"
          icon={<SettingOutlined />}
          onClick={handleConfigure}
          className="min-w-[120px] !bg-[#c62828] hover:!bg-[#a21818]"
        >
          {t?.("common.config") || "Cấu hình"}
        </Button>,
      ]}
      width={900}
      centered
      className="falc-detail-modal"
      destroyOnClose
      style={{ top: 20 }}
    >
      {" "}
      <style jsx global>{`
        .falc-detail-modal .ant-modal-content {
          background-color: white !important;
          border-radius: 12px;
          max-height: 90vh;
          overflow: hidden;
        }
        .falc-detail-modal .ant-modal-header {
          background-color: white !important;
          border-bottom: 1px solid #e8e8e8;
          padding: 20px 24px;
          border-radius: 12px 12px 0 0;
          flex-shrink: 0;
        }
        .falc-detail-modal .ant-modal-body {
          background-color: white !important;
          overflow-y: auto;
          overflow-x: hidden;
          max-height: calc(90vh - 200px);
          padding: 20px 24px;
        }
        .falc-detail-modal .ant-modal-footer {
          border-top: 1px solid #e8e8e8;
          padding: 16px 24px;
          background-color: white !important;
          border-radius: 0 0 12px 12px;
          flex-shrink: 0;
        }
        .falc-detail-modal .ant-descriptions-item-label {
          font-weight: 600 !important;
          color: #333 !important;
          font-size: 1.5rem !important;
        }
        .falc-detail-modal .ant-descriptions-item-content {
          color: #666 !important;
          font-size: 1.4rem !important;
        }
      `}</style>
      {isLoading ? (
        <div className="text-center py-8">
          <Spin indicator={<LoadingOutlined spin size={24} />} />
          <p className="mt-2 text-gray-600">
            {t?.("common.loading") || "Đang tải..."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Thông tin cơ bản */}
          <Card
            title={
              <span className="text-[1.8rem] font-semibold text-gray-800">
                {t?.("FalcManagement.basicInfo") || "Thông tin cơ bản"}
              </span>
            }
            className="border border-gray-200 rounded-lg"
          >
            <Descriptions column={2} bordered size="middle">
              <Descriptions.Item
                label={t?.("FalcManagement.board") || "Bo mạch"}
                span={2}
              >
                <span className="font-semibold text-[1.6rem]">
                  {displayDevice?.name}
                </span>
              </Descriptions.Item>

              <Descriptions.Item
                label={t?.("FalcManagement.panel") || "Tủ điều khiển"}
              >
                {displayDevice?.panelId?.name} -{" "}
                {displayDevice?.panelId?.panel_type}
              </Descriptions.Item>

              <Descriptions.Item label={t?.("common.status") || "Trạng thái"}>
                {getStatusTag(displayDevice?.status)}
              </Descriptions.Item>

              <Descriptions.Item label={t?.("common.active") || "Hoạt động"}>
                {getActiveTag(displayDevice?.is_active)}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  t?.("FalcManagement.maxDetectors") || "Số đầu báo tối đa"
                }
              >
                <span className="font-medium">
                  {displayDevice?.number_of_detectors}
                </span>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  t?.("FalcManagement.currentDetectors") || "Số đầu báo hiện có"
                }
              >
                <span className="font-medium text-blue-600">
                  {displayDevice?.current_detector_count || 0}
                </span>
              </Descriptions.Item>

              <Descriptions.Item
                label={t?.("FalcManagement.note") || "Ghi chú"}
                span={2}
              >
                {displayDevice?.description || (
                  <span className="text-gray-400 italic">
                    {t?.("common.noDescription") || "Chưa có mô tả"}
                  </span>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Danh sách đầu báo */}
          <Card
            title={
              <div className="flex items-center justify-between">
                <span className="text-[1.8rem] font-semibold text-gray-800">
                  {t?.("FalcManagement.detectorList") || "Danh sách đầu báo"}
                  <span className="ml-2 text-blue-600">
                    ({detectors.length})
                  </span>
                </span>
              </div>
            }
            className="border border-gray-200 rounded-lg"
          >
            {" "}
            {detectors.length > 0 ? (
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {detectors.map((detector, index) => (
                  <div
                    key={detector._id || index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-[1.4rem]">
                          {t?.("detector.address") || "Địa chỉ"}:{" "}
                          {detector.detector_address}
                        </span>
                        <Tag
                          color={
                            detector.status === "Normal"
                              ? "green"
                              : detector.status === "Alarm"
                              ? "red"
                              : "orange"
                          }
                        >
                          {detector.status}
                        </Tag>
                      </div>
                      {detector.name && (
                        <p className="text-gray-600 text-[1.3rem] mt-1">
                          {t?.("detector.name") || "Tên"}: {detector.name}
                        </p>
                      )}
                      {detector.zoneId && (
                        <p className="text-gray-600 text-[1.3rem]">
                          {t?.("detector.zone") || "Khu vực"}:{" "}
                          {detector.zoneId.name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[1.3rem] text-gray-500">
                        {t?.("detector.type") || "Loại"}:{" "}
                        {detector.detector_type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-[1.5rem]">
                  {t?.("FalcManagement.noDetectors") ||
                    "Chưa có đầu báo nào được cấu hình"}
                </p>
              </div>
            )}
          </Card>
        </div>
      )}
    </Modal>
  );
}

export default FalcDetailModal;
