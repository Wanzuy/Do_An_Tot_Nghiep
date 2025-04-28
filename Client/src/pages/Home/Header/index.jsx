import React, { useEffect, useState } from "react";
import {
    ApartmentOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Button, Card, Dropdown, Space } from "antd";
import { Header as AntHeader } from "antd/es/layout/layout";
import { GB, VN } from "country-flag-icons/react/3x2";
import DesktopNavbar from "../DesktopNavbar";

function Header({ t, i18n }) {
    const [currentDate, setCurrentDate] = useState("");
    const [currentTime, setCurrentTime] = useState("");

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    useEffect(() => {
        // Format date as DD-MM-YYYY
        const today = new Date();
        const formattedDate = `${String(today.getDate()).padStart(
            2,
            "0"
        )}-${String(today.getMonth() + 1).padStart(
            2,
            "0"
        )}-${today.getFullYear()}`;
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

    const dropDownItems = [
        {
            key: "vi",
            label: (
                <Space>
                    <VN title="Vietnam" width="16" height="12" />
                    Tiếng Việt
                </Space>
            ),
            onClick: () => changeLanguage("vi"),
        },
        {
            key: "en",
            label: (
                <Space>
                    <GB title="United Kingdom" width="16" height="12" />
                    English
                </Space>
            ),
            onClick: () => changeLanguage("en"),
        },
        {
            key: "logout",
            label: (
                <Space>
                    <LogoutOutlined />
                    {t("logout")}
                </Space>
            ),
            onClick: () => {
                console.log("Logout clicked");
            },
        },
    ];

    return (
        <AntHeader className="bg-gradient-to-r from-[#c62828] to-[#b71c1c] h-auto flex justify-between items-center shadow-md sticky top-0 z-50">
            <div className="flex items-center ">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="xMidYMid meet"
                    width="40"
                    height="40"
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
                        rx="20"
                        ry="20"
                    />
                    <path
                        d="M30 20 L75 20 L72 30 L59 30 L45 80 L33 80 L47 30 L27 30 Z"
                        fill="white"
                    />
                </svg>
            </div>
            <DesktopNavbar t={t} />
            <div className="flex items-center">
                <Space size="small">
                    <Card
                        size="small"
                        className="bg-transparent border-none text-white"
                    >
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 text-[1.2rem] opacity-80">
                                <UserOutlined />
                                <span>Admin</span>
                            </div>
                            <span className="block font-semibold text-center text-[1.4rem]">
                                Admin
                            </span>
                        </div>
                    </Card>

                    <Card
                        size="small"
                        className="bg-transparent border-none text-white text-center"
                    >
                        <span className="block font-medium text-[1.2rem] opacity-80">
                            {currentDate}
                        </span>
                        <span className="block font-semibold text-[1.4rem]">
                            {currentTime || "00:00:00"}
                        </span>
                    </Card>

                    <Card
                        size="small"
                        className="bg-transparent border-none text-white text-center"
                    >
                        <span className="block font-medium text-[1.2rem] opacity-80">
                            <ApartmentOutlined />
                        </span>
                        <span className="block font-semibold text-[1.4rem]">
                            192.168.10.96
                        </span>
                    </Card>
                </Space>

                <Dropdown
                    menu={{ items: dropDownItems }}
                    placement="bottomRight"
                    arrow
                    trigger={["click"]}
                >
                    <Button
                        type="ghost"
                        shape="circle"
                        icon={<MenuFoldOutlined />}
                        className="text-white ml-4 mr-4 bg-black bg-opacity-20 border-0  "
                    />
                </Dropdown>
            </div>
        </AntHeader>
    );
}

export default Header;
