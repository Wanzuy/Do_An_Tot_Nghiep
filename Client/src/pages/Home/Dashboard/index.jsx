import React, { useEffect, useState } from "react";
import "./Dashboard.scss";
import SystemStatusBanner from "./SystemStatusBanner";
import { Col, Progress, Row } from "antd";
import { PhoneOutlined, SettingOutlined } from "@ant-design/icons";
import Motherboard from "./Motherboard";
import Sensor from "./Sensor";

function Dashboard() {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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
                        <Row
                            gutter={gutterSize}
                            className="flex items-stretch w-full"
                        >
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
                            {/* Block 1: System Overview */}
                            <div className="bg-[#444444] rounded p-3 border border-solid border-[#FFFFFF0D]">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-white font-medium text-3xl">
                                        Tổng quan hệ thống
                                    </div>
                                    <SettingOutlined
                                        style={{ color: "#e53935" }}
                                    />
                                </div>
                                <div className="mt-3">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-400">
                                            CPU
                                        </span>
                                        <span className="text-white">68%</span>
                                    </div>
                                    <Progress
                                        percent={68}
                                        strokeColor="#e53935"
                                        trailColor="#555"
                                        showInfo={false}
                                    />

                                    <div className="flex justify-between mb-2 mt-3">
                                        <span className="text-gray-400">
                                            RAM
                                        </span>
                                        <span className="text-white">42%</span>
                                    </div>
                                    <Progress
                                        percent={42}
                                        strokeColor="#e53935"
                                        trailColor="#555"
                                        showInfo={false}
                                    />
                                </div>
                            </div>

                            {/* Block 2: Notifications */}
                            <div className="bg-[#444444] rounded p-3 border border-solid border-[#FFFFFF0D]">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-white font-medium text-3xl">
                                        Thông báo mới
                                    </div>
                                    <div className="bg-[#e53935] text-white text-xl rounded-full px-2 py-0.5">
                                        5
                                    </div>
                                </div>
                                <div className="mt-3 space-y-2">
                                    <div className="border-b border-[#FFFFFF0D] pb-2">
                                        <div className="text-white text-xl">
                                            Cảnh báo nhiệt độ cao
                                        </div>
                                        <div className="text-gray-400 text-lg">
                                            10 phút trước
                                        </div>
                                    </div>
                                    <div className="border-b border-[#FFFFFF0D] pb-2">
                                        <div className="text-white text-xl">
                                            Mất kết nối FAC01_008
                                        </div>
                                        <div className="text-gray-400 text-lg">
                                            25 phút trước
                                        </div>
                                    </div>
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
                                        <PhoneOutlined
                                            style={{ fontSize: "18px" }}
                                        />
                                        <span className="text-xl mt-1">
                                            Gọi hỗ trợ
                                        </span>
                                    </button>
                                    <button className="bg-[#555555] hover:bg-[#666666] text-white p-2 rounded transition flex flex-col items-center">
                                        <SettingOutlined
                                            style={{ fontSize: "18px" }}
                                        />
                                        <span className="text-xl mt-1">
                                            Cấu hình
                                        </span>
                                    </button>
                                    <button className="bg-[#555555] hover:bg-[#666666] text-white p-2 rounded transition flex flex-col items-center">
                                        <span className="text-xl">⚠️</span>
                                        <span className="text-xl mt-1">
                                            Báo cáo
                                        </span>
                                    </button>
                                    <button className="bg-[#555555] hover:bg-[#666666] text-white p-2 rounded transition flex flex-col items-center">
                                        <span className="text-xl">🔄</span>
                                        <span className="text-xl mt-1">
                                            Làm mới
                                        </span>
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
                                            <span className="text-gray-300">
                                                Hoạt động
                                            </span>
                                        </div>
                                        <span className="text-white">231</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                                            <span className="text-gray-300">
                                                Cảnh báo
                                            </span>
                                        </div>
                                        <span className="text-white">45</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                            <span className="text-gray-300">
                                                Lỗi
                                            </span>
                                        </div>
                                        <span className="text-white">18</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                                            <span className="text-gray-300">
                                                Không xác định
                                            </span>
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
