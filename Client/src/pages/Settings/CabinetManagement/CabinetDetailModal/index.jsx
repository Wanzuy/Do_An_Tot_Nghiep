import React from "react";
import {
  Modal,
  Spin,
  Typography,
  Descriptions,
  Divider,
  Badge,
  Empty,
} from "antd";

const { Title } = Typography;

function CabinetDetailModal({
  visible,
  onCancel,
  cabinet,
  loading,
  t,
  getPanelTypeTag,
}) {
  const getStatusBadge = (status) => {
    if (status === "Online") {
      return (
        <Badge
          status="success"
          text={<span className="text-[1.4rem] font-semibold">Online</span>}
        />
      );
    } else if (status === "Offline") {
      return (
        <Badge
          status="error"
          text={<span className="text-[1.4rem] font-semibold">Offline</span>}
        />
      );
    } else {
      return (
        <Badge
          status="warning"
          text={<span className="text-[1.4rem] ">{status}</span>}
        />
      );
    }
  };

  return (
    <Modal
      title={
        <div className="text-[2.5rem] font-bold">
          {t("cabinet.detailTitle")}
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={[]}
      width={850}
      centered={true}
      className="cabinet-detail-modal"
    >
      {loading ? (
        <div className="text-center py-16">
          <Spin size="large" />
          <p className="mt-4 text-[1.6rem]">Đang tải thông tin chi tiết...</p>
        </div>
      ) : cabinet ? (
        <div>
          <div className="mb-6">
            <Title level={4} className="text-[1rem] mb-1">
              {cabinet.name}
            </Title>
            <div className="flex items-center gap-3 mb-2">
              {getPanelTypeTag(cabinet.panel_type)}
              {getStatusBadge(cabinet.status)}
            </div>
          </div>

          <Divider className="my-4" />

          <Descriptions
            bordered
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
            className="cabinet-details-descriptions"
          >
            <Descriptions.Item
              label={
                <span className="text-[1.4rem] font-medium">
                  {t("cabinet.location")}
                </span>
              }
              className="text-[1.4rem]"
            >
              {cabinet.location || "-"}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span className="text-[1.4rem] font-medium">IP Address</span>
              }
              className="text-[1.4rem]"
            >
              {cabinet.ip_address || "-"}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span className="text-[1.4rem] font-medium">Subnet Mask</span>
              }
              className="text-[1.4rem]"
            >
              {cabinet.subnet_mask || "-"}
            </Descriptions.Item>{" "}
            <Descriptions.Item
              label={
                <span className="text-[1.4rem] font-medium">
                  Default Gateway
                </span>
              }
              className="text-[1.4rem]"
            >
              {cabinet.default_gateway || "-"}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span className="text-[1.4rem] font-medium">
                  {t("cabinet.loopsSupported")}
                </span>
              }
              className="text-[1.4rem]"
            >
              {cabinet.loops_supported || 0} loops
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span className="text-[1.4rem] font-medium">
                  {t("cabinet.ramUsage")}
                </span>
              }
              className="text-[1.4rem]"
            >
              <span
                className={`font-semibold ${
                  cabinet.ram_usage > 80
                    ? "text-red-500"
                    : cabinet.ram_usage > 60
                    ? "text-yellow-500"
                    : "text-green-500"
                }`}
              >
                {cabinet.ram_usage || 0}%
              </span>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span className="text-[1.4rem] font-medium">
                  {t("cabinet.cpuUsage")}
                </span>
              }
              className="text-[1.4rem]"
            >
              <span
                className={`font-semibold ${
                  cabinet.cpu_usage > 80
                    ? "text-red-500"
                    : cabinet.cpu_usage > 60
                    ? "text-yellow-500"
                    : "text-green-500"
                }`}
              >
                {cabinet.cpu_usage || 0}%
              </span>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span className="text-[1.4rem] font-medium">
                  {t("cabinet.mainPanelName")}
                </span>
              }
              className="text-[1.4rem]"
              span={2}
            >
              {cabinet.main_panel_id
                ? cabinet.main_panel_id.name
                : cabinet.panel_type === "Control Panel"
                ? ""
                : ""}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ) : (
        <div className="text-center py-8">
          <Empty />
        </div>
      )}
    </Modal>
  );
}

export default CabinetDetailModal;
