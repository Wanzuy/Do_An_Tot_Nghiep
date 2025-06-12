import React, { useEffect, useState } from "react";
import {
  LeftCircleFilled,
  SettingOutlined,
  EyeOutlined,
  LoadingOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Spin, Switch, Card, Button, Empty, Space, Select } from "antd";
import handleAPI from "../../../api/handleAPI";
import { apiEndpoint } from "../../../constants/apiEndpoint";
import ConfigureFalcModal from "./ConfigureFalcModal";
import FalcDetailModal from "./FalcDetailModal";

function Falcmanagement({ t }) {
  const [isLoading, setIsLoading] = useState(false);
  const [falcDevices, setFalcDevices] = useState([]);
  const [panels, setPanels] = useState([]);
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedFalcDevice, setSelectedFalcDevice] = useState(null);

  useEffect(() => {
    getFalcDevices();
    getPanels();
  }, []);

  const getPanels = async () => {
    try {
      const response = await handleAPI(apiEndpoint.panels.getAllPanels);
      if (response && response.data) {
        setPanels(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getFalcDevices = async (panelId = null) => {
    setIsLoading(true);
    try {
      let endpoint = apiEndpoint.falc.getAll;
      if (panelId) {
        endpoint = `${apiEndpoint.falc.getAll}?panelId=${panelId}`;
      }
      const response = await handleAPI(endpoint);
      if (response && response.data) {
        setFalcDevices(response.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleStatusChange = async (checked, deviceId) => {
    try {
      await handleAPI(
        apiEndpoint.falc.updateStatus(deviceId),
        { is_active: checked },
        "patch"
      );

      // Update local state after successful API call
      setFalcDevices(
        falcDevices.map((device) =>
          device._id === deviceId ? { ...device, is_active: checked } : device
        )
      );
    } catch (error) {
      console.log(error);
    }
  };
  const handlePanelFilter = (panelId) => {
    setSelectedPanel(panelId);
    getFalcDevices(panelId);
  };

  const handleConfigure = (device) => {
    setSelectedFalcDevice(device);
    setConfigModalVisible(true);
  };
  const handleConfigSuccess = (updatedDevice) => {
    // Cập nhật lại danh sách FALC devices sau khi cấu hình thành công
    setFalcDevices(
      falcDevices.map((device) =>
        device._id === updatedDevice._id ? updatedDevice : device
      )
    );
  };
  const handleViewDetails = (device) => {
    setSelectedFalcDevice(device);
    setDetailModalVisible(true);
  };

  const handleDetailModalConfigure = (device) => {
    setSelectedFalcDevice(device);
    setConfigModalVisible(true);
  };
  return (
    <div className="p-4 lg:p-[5rem]">
      {" "}
      <style jsx global>{`
        .panel-filter-select .ant-select-selector {
          background-color: #434343 !important;
          border-color: #666 !important;
          color: white !important;
        }
        .panel-filter-select .ant-select-selection-placeholder {
          color: #ccc !important;
        }
        .panel-filter-select .ant-select-arrow {
          color: white !important;
        }
        .panel-filter-select .ant-select-selection-item {
          color: white !important;
        }

        /* Global styles for dropdown */
        .ant-select-dropdown {
          background-color: #434343 !important;
        }
        .ant-select-item {
          color: white !important;
          background-color: #434343 !important;
        }
        .ant-select-item:hover {
          background-color: #555 !important;
          color: white !important;
        }
        .ant-select-item-option-selected {
          background-color: #1890ff !important;
          color: white !important;
        }
        .ant-select-item-option-active {
          background-color: #555 !important;
          color: white !important;
        }
      `}</style>
      <div>
        <div className="md:bg-[#434343] md:p-4 md:rounded-xl md:shadow-lg flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <div className="flex items-center gap-4 md:mb-0 mb-4">
            <Link to="/cai-dat">
              <LeftCircleFilled className="text-[2.5rem] text-white" />
            </Link>
            <h1 className="text-3xl font-bold text-white">
              {t("FalcManagement.title")}
            </h1>
          </div>

          {/* Panel Filter */}
          <div className="flex items-center gap-3">
            <FilterOutlined className="text-white text-xl" />{" "}
            <Select
              placeholder={
                t("FalcManagement.selectPanel") || "Chọn tủ điều khiển"
              }
              style={{ width: 250 }}
              allowClear
              value={selectedPanel}
              onChange={handlePanelFilter}
              className="panel-filter-select"
              dropdownStyle={{
                backgroundColor: "#434343",
                border: "1px solid #666",
                borderRadius: "6px",
              }}
              dropdownRender={(menu) => (
                <div style={{ backgroundColor: "#434343" }}>{menu}</div>
              )}
            >
              {panels.map((panel) => (
                <Select.Option key={panel._id} value={panel._id}>
                  {panel.name} - {panel.panel_type}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
        {/* Danh sách thiết bị FALC */}
        {isLoading ? (
          <div className="text-white text-center py-8">
            <Spin indicator={<LoadingOutlined spin size={24} />} />
            <p className="mt-2"> {t("common.loading")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {falcDevices.length > 0 ? (
              falcDevices.map((device) => (
                <Card
                  key={device._id}
                  className="bg-[#434343] text-white border-white/10 hover:shadow-xl transition-shadow w-full p-0"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Column 1: Switch and Device Name */}
                    <div className="flex flex-col gap-8">
                      <div>
                        <Switch
                          checked={device.is_active}
                          onChange={(checked) =>
                            handleStatusChange(checked, device._id)
                          }
                          className="bg-[#00000073]"
                        />
                      </div>
                      <h3 className="text-2xl text-white">
                        <span>{t("FalcManagement.board")}: </span>
                        <span className="font-semibold">{device.name}</span>
                      </h3>
                    </div>{" "}
                    {/* Column 2: Description and Detector Count */}
                    <div className="flex flex-col justify-center sm:items-center">
                      <div className=" text-white">
                        <span>{t("FalcManagement.numberdetectors")}:</span>
                        <span>
                          {"  "}
                          {device.current_detector_count || 0}
                        </span>
                      </div>
                      <p className="text-white mt-1 sm:mt-8">
                        <span>{t("FalcManagement.note")}: </span>
                        <span className="font-semibold">
                          {device.description}
                        </span>
                      </p>
                    </div>
                    {/* Column 3: Action Buttons */}
                    <div className="flex flex-col sm:items-end h-full">
                      <Space direction="vertical" size="small">
                        {" "}
                        <Button
                          icon={<EyeOutlined />}
                          onClick={() => handleViewDetails(device)}
                          className="!bg-blue-500 hover:opacity-85 flex w-full !text-white border-none"
                        >
                          {t("common.detail")}
                        </Button>
                        <Button
                          type="primary"
                          ghost
                          icon={<SettingOutlined />}
                          onClick={() => handleConfigure(device)}
                          className="!bg-[#c62828] hover:opacity-85 w-full !text-white border-none"
                        >
                          {t("common.config")}
                        </Button>
                      </Space>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Empty
                description="Không có thiết bị nào"
                className="text-white my-8"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        )}{" "}
      </div>
      {/* Configure FALC Modal */}
      <ConfigureFalcModal
        visible={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        falcDevice={selectedFalcDevice}
        onSuccess={handleConfigSuccess}
        t={t}
      />
      {/* Detail FALC Modal */}
      <FalcDetailModal
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        falcDevice={selectedFalcDevice}
        onConfigure={handleDetailModalConfigure}
        t={t}
      />
    </div>
  );
}

export default Falcmanagement;
