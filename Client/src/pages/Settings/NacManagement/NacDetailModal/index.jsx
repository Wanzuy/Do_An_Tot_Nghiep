import React, { useState, useEffect } from "react";
import { Modal, Descriptions, Button, Space, Spin, Table, Tag } from "antd";
import { SettingOutlined, ReloadOutlined } from "@ant-design/icons";
import handleAPI from "../../../../api/handleAPI";
import { apiEndpoint } from "../../../../constants/apiEndpoint";

const NacDetailModal = ({ visible, onCancel, nacBoard, onConfigure, t }) => {
  const [loading, setLoading] = useState(false);
  const [circuits, setCircuits] = useState([]);
  const fetchCircuits = async () => {
    if (!nacBoard?._id) return;

    setLoading(true);
    try {
      const response = await handleAPI(
        apiEndpoint.nacCircuits.getByNacBoard(nacBoard._id)
      );
      if (response && response.data) {
        setCircuits(response.data);
      }
    } catch (error) {
      console.error("Error fetching circuits:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && nacBoard) {
      fetchCircuits();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, nacBoard]);

  const circuitColumns = [
    {
      title: t("NacManagement.circuitName"),
      dataIndex: "name",
      key: "name",
      render: (text) => text || t("NacManagement.noName"),
    },
    {
      title: t("NacManagement.circuitNumber"),
      dataIndex: "circuit_number",
      key: "circuit_number",
      width: 120,
    },
    {
      title: t("NacManagement.deviceType"),
      dataIndex: "output_type",
      key: " output_type",
      render: (type) => (
        <Tag
          color={
            type === "Horn" ? "red" : type === "Strobe" ? "orange" : "blue"
          }
        >
          {t(`NacManagement.deviceTypes.${type}`) || type}
        </Tag>
      ),
    },
  ];

  return (
    <Modal
      title={t("NacManagement.detailTitle")}
      open={visible}
      onCancel={onCancel}
      width={800}
      className="nac-detail-modal"
      footer={[
        <Button key="close" onClick={onCancel}>
          {t("common.close")}
        </Button>,
        <Button
          key="configure"
          type="primary"
          icon={<SettingOutlined />}
          onClick={() => {
            onConfigure(nacBoard);
            onCancel();
          }}
          className="bg-red-500 hover:!bg-red-600"
        >
          {t("common.config")}
        </Button>,
      ]}
    >
      {" "}
      <style jsx global>{`
        .nac-detail-modal .ant-modal-content {
          background-color: white !important;
          color: black !important;
        }
        .nac-detail-modal .ant-modal-header {
          background-color: white !important;
          border-bottom: 1px solid #d9d9d9 !important;
        }
        .nac-detail-modal .ant-modal-title {
          color: black !important;
        }
        .nac-detail-modal .ant-modal-close-x {
          color: black !important;
        }
        .nac-detail-modal .ant-descriptions-item-label {
          color: #666 !important;
        }
        .nac-detail-modal .ant-descriptions-item-content {
          color: black !important;
        }
        .nac-detail-modal .ant-table {
          background-color: white !important;
        }
        .nac-detail-modal .ant-table-thead > tr > th {
          background-color: #fafafa !important;
          color: black !important;
          border-bottom: 1px solid #d9d9d9 !important;
        }
        .nac-detail-modal .ant-table-tbody > tr > td {
          background-color: white !important;
          color: black !important;
          border-bottom: 1px solid #f0f0f0 !important;
        }
        .nac-detail-modal .ant-table-tbody > tr:hover > td {
          background-color: #f5f5f5 !important;
        }
        .nac-detail-modal .ant-descriptions {
          background-color: white !important;
        }
        .nac-detail-modal
          .ant-descriptions-bordered
          .ant-descriptions-item-label {
          background-color: #fafafa !important;
        }
        .nac-detail-modal
          .ant-descriptions-bordered
          .ant-descriptions-item-content {
          background-color: white !important;
        }
      `}</style>
      {nacBoard && (
        <div>
          <Descriptions
            title={t("NacManagement.basicInfo")}
            bordered
            column={2}
            size="small"
            style={{ marginBottom: 24 }}
          >
            <Descriptions.Item label={t("NacManagement.boardName")}>
              {nacBoard.name}
            </Descriptions.Item>
            <Descriptions.Item label={t("NacManagement.status")}>
              <Tag color={nacBoard.is_active ? "green" : "red"}>
                {nacBoard.is_active ? t("common.active") : t("common.inactive")}
              </Tag>
            </Descriptions.Item>{" "}
            <Descriptions.Item label={t("NacManagement.panel")}>
              {nacBoard.panelId?.name || t("common.noDescription")}
            </Descriptions.Item>
            <Descriptions.Item label={t("NacManagement.numberOfCircuits")}>
              {circuits.length}
            </Descriptions.Item>
            <Descriptions.Item label={t("NacManagement.description")} span={2}>
              {nacBoard.description || t("NacManagement.noDescription")}
            </Descriptions.Item>
          </Descriptions>{" "}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[1.8rem] font-semibold text-black">
              {t("NacManagement.circuitList")}
            </h3>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchCircuits}
              loading={loading}
              size="small"
            >
              {t("common.refresh")}
            </Button>
          </div>
          <Table
            columns={circuitColumns}
            dataSource={circuits}
            rowKey="_id"
            loading={loading}
            size="small"
            pagination={false}
            locale={{
              emptyText: t("NacManagement.noCircuits"),
            }}
            scroll={{ y: 300 }}
          />
        </div>
      )}
    </Modal>
  );
};

export default NacDetailModal;
