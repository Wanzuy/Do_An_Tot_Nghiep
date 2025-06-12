import React, { useEffect, useState } from "react";
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

function Dashboard() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [systemStats, setSystemStats] = useState({
    cpu_usage: 0,
    ram_usage: 0,
    loading: true,
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchSystemStats();
    // Cập nhật dữ liệu mỗi 30 giây
    const interval = setInterval(fetchSystemStats, 30000);
    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Gutter sẽ là [16, 16] khi màn hình >= 1024px, ngược lại là [0, 0]
  const gutterSize = windowWidth >= 1024 ? [16, 16] : [0, 16];

  return (
    <>
      <SystemStatusBanner />
      <div className="px-4 lg:px-[5rem] py-8">
        <Row gutter={[0, 16]} className="flex items-stretch">
          {/* Cột đầu tiên: Bo mạch và Đầu báo */}
          <Col xs={24} md={18} className="flex">
            <Row gutter={gutterSize} className="flex items-stretch w-full">
              <Col xs={24} md={12} className="flex">
                <div className="w-full">
                  <Motherboard />
                </div>
              </Col>
              <Col xs={24} md={12} className="flex">
                <div className="w-full">
                  <Sensor />
                </div>
              </Col>
            </Row>
          </Col>

          {/* Cột thứ hai: Các khối thông tin */}
          <Col xs={24} md={6}>
            <div className="min-h-[80vh] bg-[#333333] rounded-lg shadow-lg border border-solid border-[#FFFFFF0D] p-4 flex flex-col gap-4">
              {/* Block 1: Notifications */}
              <div className="bg-[#444444] rounded p-3 border border-solid border-[#FFFFFF0D]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-medium text-3xl">
                    Thông báo mới
                  </div>
                  <div className="bg-[#e53935] text-white text-xl rounded-full w-10 h-10 flex items-center justify-center">
                    5
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="border-b border-[#FFFFFF0D] pb-2">
                    <div className="text-[#ccc] text-[1.4rem]">
                      Cảnh báo nhiệt độ cao
                    </div>
                    <div className="text-gray-400 text-lg">10 phút trước</div>
                  </div>
                  <div className="border-b border-[#FFFFFF0D] pb-2">
                    <div className="text-[#ccc] text-xl">
                      Mất kết nối FAC01_008
                    </div>
                    <div className="text-gray-400 text-lg">25 phút trước</div>
                  </div>
                </div>
              </div>{" "}
              {/* Block 2: System Overview */}
              <div className="bg-[#444444] rounded p-3 border border-solid border-[#FFFFFF0D]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-medium text-3xl">
                    Tổng quan hệ thống
                  </div>
                  <div className="flex items-center gap-2">
                    {systemStats.loading ? (
                      <Spin size="small" />
                    ) : (
                      <ReloadOutlined
                        style={{ color: "#e53935", cursor: "pointer" }}
                        onClick={fetchSystemStats}
                        title="Làm mới dữ liệu"
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
                  <div className="text-white font-medium text-3xl">
                    Thao tác nhanh
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="bg-[#555555] hover:bg-[#666666] text-white p-2 rounded transition flex flex-col items-center">
                    <PhoneOutlined style={{ fontSize: "18px" }} />
                    <span className="text-xl mt-1">Gọi hỗ trợ</span>
                  </button>
                  <button className="bg-[#555555] hover:bg-[#666666] text-white p-2 rounded transition flex flex-col items-center">
                    <SettingOutlined style={{ fontSize: "18px" }} />
                    <span className="text-xl mt-1">Cấu hình</span>
                  </button>
                  <button className="bg-[#555555] hover:bg-[#666666] text-white p-2 rounded transition flex flex-col items-center">
                    <span className="text-xl">⚠️</span>
                    <span className="text-xl mt-1">Báo cáo</span>
                  </button>{" "}
                  <button
                    className="bg-[#555555] hover:bg-[#666666] text-white p-2 rounded transition flex flex-col items-center"
                    onClick={fetchSystemStats}
                    disabled={systemStats.loading}
                  >
                    <span className="text-xl">🔄</span>
                    <span className="text-xl mt-1">Làm mới</span>
                  </button>
                </div>
              </div>
              {/* Block 4: Status Statistics */}
              <div className="bg-[#444444] rounded p-3 border border-solid border-[#FFFFFF0D] flex-grow">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-white font-medium text-3xl">
                    Thống kê trạng thái
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-gray-300">Hoạt động</span>
                    </div>
                    <span className="text-white">231</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <span className="text-gray-300">Cảnh báo</span>
                    </div>
                    <span className="text-white">45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-gray-300">Lỗi</span>
                    </div>
                    <span className="text-white">18</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                      <span className="text-gray-300">Không xác định</span>
                    </div>
                    <span className="text-white">7</span>
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
