import {
    BellOutlined,
    DashboardOutlined,
    MenuFoldOutlined,
    SafetyOutlined,
    SettingOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Button, Card, Layout, Menu, Space } from "antd";
import { Header } from "antd/es/layout/layout";
import React, { useEffect, useState } from "react";

const MainRouter = () => {
    const [currentDate, setCurrentDate] = useState("");
    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {
        // Format date as YYYY-MM-DD
        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${String(
            today.getMonth() + 1
        ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        setCurrentDate(formattedDate);

        // Update time every second
        const timeInterval = setInterval(() => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");
            const seconds = String(now.getSeconds()).padStart(2, "0");
            const formattedTime = `${hours}:${minutes}:${seconds}`;
            setCurrentTime(formattedTime);
        }, 1000);

        return () => clearInterval(timeInterval);
    }, []);
    return (
        <Layout className="min-h-screen">
            <Header className="py-5 bg-gradient-to-r from-red-800 to-red-600 h-auto flex justify-between items-center shadow-md sticky top-0 z-50">
                <div className="flex items-center font-bold text-[1.8rem] text-white">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="xMidYMid meet"
                        width="25"
                        height="25"
                    >
                        <defs>
                            <filter
                                id="shadow"
                                x="-10%"
                                y="-10%"
                                width="120%"
                                height="120%"
                            >
                                <feDropShadow
                                    dx="0"
                                    dy="0"
                                    stdDeviation="2"
                                    floodOpacity="0.5"
                                />
                            </filter>
                        </defs>
                        <rect
                            width="100"
                            height="100"
                            fill="#cc0000"
                            filter="url(#shadow)"
                        />
                        <path
                            d="M30 20 L75 20 L72 30 L59 30 L45 80 L33 80 L47 30 L27 30 Z"
                            fill="white"
                        />
                    </svg>
                    <p className="ml-2 mt-1"> HỆ THỐNG GIÁM SÁT</p>
                </div>

                <Menu
                    theme="dark"
                    mode="horizontal"
                    className="bg-transparent border-0 flex-1 justify-center"
                    items={[
                        {
                            key: "1",
                            icon: <DashboardOutlined />,
                            label: "Bảng điều khiển",
                        },
                        {
                            key: "2",
                            icon: <SettingOutlined />,
                            label: "Cài đặt",
                        },
                        {
                            key: "3",
                            icon: <BellOutlined />,
                            label: "Thông báo",
                        },
                    ]}
                />

                <div className="flex items-center">
                    <Space size="small">
                        <Card
                            size="small"
                            className="bg-black bg-opacity-20 border border-white border-opacity-10"
                        >
                            <div className="text-xs opacity-80 uppercase">
                                Người dùng
                            </div>
                            <div className="font-semibold flex items-center">
                                <UserOutlined /> Admin
                            </div>
                        </Card>

                        <Card
                            size="small"
                            className="bg-black bg-opacity-20 border border-white border-opacity-10"
                        >
                            <div className="text-xs opacity-80 uppercase">
                                Ngày
                            </div>
                            <div className="font-semibold">{currentDate}</div>
                        </Card>

                        <Card
                            size="small"
                            className="bg-black bg-opacity-20 border border-white border-opacity-10"
                        >
                            <div className="text-xs opacity-80 uppercase">
                                Thời gian
                            </div>
                            <div className="font-semibold">{currentTime}</div>
                        </Card>

                        <Card
                            size="small"
                            className="bg-black bg-opacity-20 border border-white border-opacity-10"
                        >
                            <div className="text-xs opacity-80 uppercase">
                                TRỊ TMR
                            </div>
                            <div className="font-semibold">10-195-95</div>
                        </Card>
                    </Space>

                    <Button
                        type="ghost"
                        shape="circle"
                        icon={<MenuFoldOutlined />}
                        className="ml-4 mr-4 bg-black bg-opacity-20 border-0 hover:bg-black hover:bg-opacity-30 hover:rotate-90 transition-all duration-300"
                    />
                </div>
            </Header>
        </Layout>
    );
};

export default MainRouter;
