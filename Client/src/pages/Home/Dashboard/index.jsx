import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./Dashboard.scss";
import SystemStatusBanner from "./SystemStatusBanner";
import { Col, Progress, Row, Spin } from "antd";
import {
  PhoneOutlined,
  SettingOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import Motherboard from "./Motherboard";
import Sensor from "./Sensor";
import handleAPI from "../../../api/handleAPI";
import { apiEndpoint } from "../../../constants/apiEndpoint";
import { Link } from "react-router-dom";

function Dashboard() {
  const { t } = useTranslation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [dashboardData, setDashboardData] = useState({
    detectors: { total: 0, disconnected: 0, normal: 0, faultyList: [] },
    boards: { total: 0, disconnected: 0, faultyList: [] },
    events: { active: 0, total: 0 },
    statusStats: { operating: 0, warning: 0, error: 0, undefined: 0 },
    systemStatus: { hasError: false, message: "" },
    loading: true,
  });
  const [systemStats, setSystemStats] = useState({
    cpu_usage: 0,
    ram_usage: 0,
    loading: true,
  });
  const [eventLogs, setEventLogs] = useState({
    data: [],
    loading: true,
    activeCount: 0,
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    fetchDashboardData();
    fetchSystemStats();
    fetchEventLogs();
    // Cập nhật dữ liệu mỗi 2 phút
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchSystemStats();
      fetchEventLogs();
    }, 120000);
    return () => clearInterval(interval);
  }, []);
  const fetchDashboardData = async () => {
    try {
      setDashboardData((prev) => ({ ...prev, loading: true }));
      const response = await handleAPI(apiEndpoint.statistics.dashboard);

      if (response && response.data) {
        setDashboardData({
          ...response.data,
          loading: false,
        });
      } else {
        setDashboardData((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDashboardData((prev) => ({ ...prev, loading: false }));
    }
  };

  const fetchSystemStats = async () => {
    try {
      setSystemStats((prev) => ({ ...prev, loading: true }));
      // Lấy tất cả panels và tìm Control Panel
      const response = await handleAPI(
        apiEndpoint.panels.getAllPanels + "?panel_type=Control Panel"
      );

      if (response && response.data && response.data.length > 0) {
        // Lấy Control Panel đầu tiên (thường chỉ có 1 Control Panel chính)
        const controlPanel = response.data[0];
        setSystemStats({
          cpu_usage: controlPanel.cpu_usage || 0,
          ram_usage: controlPanel.ram_usage || 0,
          loading: false,
        });
      } else {
        setSystemStats({
          cpu_usage: 0,
          ram_usage: 0,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching system stats:", error);
      setSystemStats({
        cpu_usage: 0,
        ram_usage: 0,
        loading: false,
      });
    }
  };

  const fetchEventLogs = async () => {
    try {
      setEventLogs((prev) => ({ ...prev, loading: true }));
      const response = await handleAPI(apiEndpoint.eventlogs.getAllEventLogs);
      if (response && response.data) {
        // Lọc các sự cố có trạng thái Active (cần xử lý)
        const activeEvents = response.data.filter(
          (event) => event.status === "Active"
        );

        setEventLogs({
          data: activeEvents.slice(0, 5), // Chỉ hiển thị 5 sự cố ACTIVE gần nhất
          loading: false,
          activeCount: activeEvents.length,
        });
      } else {
        setEventLogs({
          data: [],
          loading: false,
          activeCount: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching event logs:", error);
      setEventLogs({
        data: [],
        loading: false,
        activeCount: 0,
      });
    }
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Gutter sẽ là [16, 16] khi màn hình >= 1024px, ngược lại là [0, 0]
  const gutterSize = windowWidth >= 1024 ? [16, 16] : [0, 16];
  return (
    <>
      <SystemStatusBanner systemStatus={dashboardData.systemStatus} />
      <div className="px-4 lg:px-[5rem] py-8">
        <Row gutter={[0, 16]} className="flex items-stretch">
          {/* Cột đầu tiên: Bo mạch và Đầu báo */}
          <Col xs={24} md={18} className="flex">
            <Row gutter={gutterSize} className="flex items-stretch w-full">
              <Col xs={24} md={12} className="flex">
                <div className="w-full">
                  <Motherboard
                    boardStats={dashboardData.boards}
                    loading={dashboardData.loading}
                  />
                </div>
              </Col>
              <Col xs={24} md={12} className="flex">
                <div className="w-full">
                  <Sensor
                    detectorStats={dashboardData.detectors}
                    loading={dashboardData.loading}
                  />
                </div>
              </Col>
            </Row>
          </Col>

          {/* Cột thứ hai: Các khối thông tin */}
          <Col xs={24} md={6}>
            <div className="min-h-[80vh] bg-[#333333] rounded-lg shadow-lg border border-solid border-[#FFFFFF0D] p-4 flex flex-col gap-4">
              {" "}
              {/* Block 1: Notifications */}
              <div className="bg-[#444444] rounded p-3 border border-solid border-[#FFFFFF0D]">
                {" "}
                <div className="flex items-center justify-between mb-2">
                  {" "}
                  <div className="text-white font-medium text-3xl">
                    {t("Dashboard.newNotifications")}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-[#e53935] text-white text-xl rounded-full w-10 h-10 flex items-center justify-center">
                      {eventLogs.loading ? "..." : eventLogs.activeCount}
                    </div>
                    {eventLogs.loading ? (
                      <Spin size="small" />
                    ) : (
                      <ReloadOutlined
                        style={{ color: "#e53935", cursor: "pointer" }}
                        onClick={fetchEventLogs}
                        title={t("Dashboard.refreshNotifications")}
                      />
                    )}
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {eventLogs.loading ? (
                    <div className="flex justify-center py-4">
                      <Spin size="small" />
                    </div>
                  ) : eventLogs.data.length > 0 ? (
                    eventLogs.data.map((event, index) => (
                      <div
                        key={event._id || index}
                        className="border-b border-[#FFFFFF0D] pb-2"
                      >
                        <div className="text-[#ccc] text-[1.4rem] truncate">
                          {event.description || t("Dashboard.noDescription")}
                        </div>{" "}
                        <div className="flex justify-between items-center">
                          <div className="text-gray-400 text-lg">
                            {event.timestamp
                              ? new Date(event.timestamp).toLocaleString(
                                  "vi-VN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    day: "2-digit",
                                    month: "2-digit",
                                  }
                                )
                              : t("Dashboard.undefined")}
                          </div>
                          <div className="px-2 py-1 rounded text-xs bg-red-600 text-white">
                            {t("Dashboard.needsProcessing")}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-center py-4">
                      {t("Dashboard.noIncidentsToProcess")}
                    </div>
                  )}
                </div>
              </div>{" "}
              {/* Block 2: System Overview */}
              <div className="bg-[#444444] rounded p-3 border border-solid border-[#FFFFFF0D]">
                <div className="flex items-center justify-between mb-2">
                  {" "}
                  <div className="text-white font-medium text-3xl">
                    {t("Dashboard.systemOverview")}
                  </div>
                  <div className="flex items-center gap-2">
                    {systemStats.loading ? (
                      <Spin size="small" />
                    ) : (
                      <ReloadOutlined
                        style={{ color: "#e53935", cursor: "pointer" }}
                        onClick={fetchSystemStats}
                        title={t("Dashboard.refreshData")}
                      />
                    )}
                    <SettingOutlined style={{ color: "#e53935" }} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">CPU</span>
                    <span className="text-white">
                      {systemStats.loading
                        ? "..."
                        : `${systemStats.cpu_usage}%`}
                    </span>
                  </div>
                  <Progress
                    percent={systemStats.cpu_usage}
                    strokeColor={
                      systemStats.cpu_usage > 80
                        ? "#ff4d4f"
                        : systemStats.cpu_usage > 60
                        ? "#faad14"
                        : "#52c41a"
                    }
                    trailColor="#555"
                    showInfo={false}
                  />

                  <div className="flex justify-between mb-2 mt-3">
                    <span className="text-gray-400">RAM</span>
                    <span className="text-white">
                      {systemStats.loading
                        ? "..."
                        : `${systemStats.ram_usage}%`}
                    </span>
                  </div>
                  <Progress
                    percent={systemStats.ram_usage}
                    strokeColor={
                      systemStats.ram_usage > 80
                        ? "#ff4d4f"
                        : systemStats.ram_usage > 60
                        ? "#faad14"
                        : "#52c41a"
                    }
                    trailColor="#555"
                    showInfo={false}
                  />
                </div>
              </div>
              {/* Block 3: Quick Actions */}
              <div className="bg-[#444444] rounded p-3 border border-solid border-[#FFFFFF0D]">
                <div className="flex items-center justify-between mb-3">
                  {" "}
                  <div className="text-white font-medium text-3xl">
                    {t("Dashboard.quickActions")}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="bg-[#555555] hover:bg-[#666666] text-white p-2 rounded transition flex flex-col items-center">
                    <PhoneOutlined style={{ fontSize: "18px" }} />
                    <span className="text-xl mt-1">
                      {t("Dashboard.callSupport")}
                    </span>
                  </button>
                  <button className="bg-[#555555] hover:bg-[#666666] text-white p-2 rounded transition flex flex-col items-center">
                    <SettingOutlined style={{ fontSize: "18px" }} />
                    <Link to="/cai-dat" className="text-xl mt-1">
                      {t("Dashboard.configuration")}
                    </Link>
                  </button>{" "}
                  <button className="bg-[#555555] hover:bg-[#666666] text-white p-2 rounded transition flex flex-col items-center">
                    <span className="text-xl">⚠️</span>
                    <span className="text-xl mt-1">
                      {t("Dashboard.report")}
                    </span>
                  </button>{" "}
                  <button
                    className="bg-[#555555] hover:bg-[#666666] text-white p-2 rounded transition flex flex-col items-center"
                    onClick={() => {
                      fetchDashboardData();
                      fetchSystemStats();
                      fetchEventLogs();
                    }}
                    disabled={
                      dashboardData.loading ||
                      systemStats.loading ||
                      eventLogs.loading
                    }
                  >
                    <span className="text-xl">🔄</span>
                    <span className="text-xl mt-1">
                      {t("Dashboard.refresh")}
                    </span>
                  </button>
                </div>
              </div>
              {/* Block 4: Status Statistics */}
              <div className="bg-[#444444] rounded p-3 border border-solid border-[#FFFFFF0D] flex-grow">
                {" "}
                <div className="flex items-center justify-between mb-3">
                  <div className="text-white font-medium text-3xl">
                    {t("Dashboard.statusStatistics")}
                  </div>
                </div>{" "}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-gray-300">
                        {t("Dashboard.operating")}
                      </span>
                    </div>{" "}
                    <span className="text-white">
                      {dashboardData.loading
                        ? "..."
                        : dashboardData.statusStats.operating}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <span className="text-gray-300">
                        {t("Dashboard.warning")}
                      </span>
                    </div>
                    <span className="text-white">
                      {dashboardData.loading
                        ? "..."
                        : dashboardData.statusStats.warning}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-gray-300">
                        {t("Dashboard.error")}
                      </span>
                    </div>
                    <span className="text-white">
                      {dashboardData.loading
                        ? "..."
                        : dashboardData.statusStats.error}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                      <span className="text-gray-300">
                        {t("Dashboard.undefined")}
                      </span>
                    </div>
                    <span className="text-white">
                      {dashboardData.loading
                        ? "..."
                        : dashboardData.statusStats.undefined}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Dashboard;
