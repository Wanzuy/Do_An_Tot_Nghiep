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
import { useTranslation } from "react-i18next";
import handleAPI from "../../../api/handleAPI";
import { apiEndpoint } from "../../../constants/apiEndpoint";
import ConfigureNacModal from "./ConfigureNacModal";
import NacDetailModal from "./NacDetailModal";

function NacManagement() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [nacBoards, setNacBoards] = useState([]);
  const [panels, setPanels] = useState([]);
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedNacBoard, setSelectedNacBoard] = useState(null);

  useEffect(() => {
    getNacBoards();
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

  const getNacBoards = async (panelId = null) => {
    setIsLoading(true);
    try {
      let endpoint = apiEndpoint.nac.getAll;
      if (panelId) {
        endpoint = `${apiEndpoint.nac.getAll}?panelId=${panelId}`;
      }
      const response = await handleAPI(endpoint);
      if (response && response.data) {
        setNacBoards(response.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (checked, boardId) => {
    try {
      await handleAPI(
        apiEndpoint.nac.updateStatus(boardId),
        { is_active: checked },
        "patch"
      );

      // Update local state after successful API call
      setNacBoards(
        nacBoards.map((board) =>
          board._id === boardId ? { ...board, is_active: checked } : board
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handlePanelFilter = (panelId) => {
    setSelectedPanel(panelId);
    getNacBoards(panelId);
  };
  const handleConfigure = (board) => {
    console.log("Selected board for configuration:", board); // Debug log
    setSelectedNacBoard(board);
    setConfigModalVisible(true);
  };
  const handleConfigSuccess = async (updatedBoard) => {
    console.log("Updated board:", updatedBoard); // Debug log

    // Fetch lại toàn bộ danh sách để đảm bảo có đầy đủ thông tin
    // (bao gồm actual_circuit_count được tính toán từ server)
    await getNacBoards(selectedPanel);
  };

  const handleViewDetails = (board) => {
    setSelectedNacBoard(board);
    setDetailModalVisible(true);
  };

  const handleDetailModalConfigure = (board) => {
    setSelectedNacBoard(board);
    setConfigModalVisible(true);
  };

  return (
    <div className="p-4 lg:p-[5rem]">
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
              {t("NacManagement.title")}
            </h1>
          </div>

          {/* Panel Filter */}
          <div className="flex items-center gap-3">
            <FilterOutlined className="text-white text-xl" />
            <Select
              placeholder={
                t("NacManagement.selectPanel") || "Chọn tủ điều khiển"
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

        {/* Danh sách NAC Boards */}
        {isLoading ? (
          <div className="text-white text-center py-8">
            <Spin indicator={<LoadingOutlined spin size={24} />} />
            <p className="mt-2">{t("common.loading")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {nacBoards.length > 0 ? (
              nacBoards.map((board) => (
                <Card
                  key={board._id}
                  className="bg-[#434343] text-white border-white/10 hover:shadow-xl transition-shadow w-full p-0"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Column 1: Switch and Board Name */}
                    <div className="flex flex-col gap-8">
                      <div>
                        <Switch
                          checked={board.is_active}
                          onChange={(checked) =>
                            handleStatusChange(checked, board._id)
                          }
                          className="bg-[#00000073]"
                        />
                      </div>
                      <h3 className="text-2xl text-white">
                        <span>{t("NacManagement.board")}: </span>
                        <span className="font-semibold">{board.name}</span>
                      </h3>
                    </div>{" "}
                    {/* Column 2: Description and Circuit Count */}
                    <div className="flex flex-col justify-center sm:items-center">
                      <div className="text-white">
                        <span>{t("NacManagement.numberOfCircuits")}:</span>
                        <span>
                          {"  "}
                          {board.actual_circuit_count || 0}
                        </span>
                      </div>
                      <p className="text-white mt-1 sm:mt-8">
                        <span>{t("NacManagement.note")}: </span>
                        <span className="font-semibold">
                          {board.description ||
                            t("NacManagement.noDescription")}
                        </span>
                      </p>
                    </div>
                    {/* Column 3: Action Buttons */}
                    <div className="flex flex-col sm:items-end h-full">
                      <Space direction="vertical" size="small">
                        <Button
                          icon={<EyeOutlined />}
                          onClick={() => handleViewDetails(board)}
                          className="!bg-blue-500 hover:opacity-85 flex w-full !text-white border-none"
                        >
                          {t("common.detail")}
                        </Button>
                        <Button
                          type="primary"
                          ghost
                          icon={<SettingOutlined />}
                          onClick={() => handleConfigure(board)}
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
                description={t("NacManagement.noDevices")}
                className="text-white my-8"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        )}
      </div>

      {/* Configure NAC Modal */}
      <ConfigureNacModal
        visible={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        nacBoard={selectedNacBoard}
        onSuccess={handleConfigSuccess}
        t={t}
      />

      {/* Detail NAC Modal */}
      <NacDetailModal
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        nacBoard={selectedNacBoard}
        onConfigure={handleDetailModalConfigure}
        t={t}
      />
    </div>
  );
}

export default NacManagement;
