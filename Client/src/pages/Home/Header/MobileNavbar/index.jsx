import React from "react";

import {
    ApartmentOutlined,
    DashboardOutlined,
    InfoCircleOutlined,
    LogoutOutlined,
    RightOutlined,
    SettingOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { GB, VN } from "country-flag-icons/react/3x2";
import { Link, useLocation } from "react-router-dom";
import { Card, Drawer } from "antd";
import { localDataNames } from "../../../../constants/appInfo";

function MobileNavbar({
    setIsDrawerOpen,
    isMobile,
    isDrawerOpen,
    t,
    changeLanguage,
    logout,
}) {
    const userInfo = JSON.parse(localStorage.getItem(localDataNames.authData));
    const location = useLocation();
    const pathname = location.pathname;

    const isActive = (path) => {
        if (path === "/cai-dat") {
            // Kiểm tra xem đường dẫn hiện tại có bắt đầu bằng "/cai-dat" không
            return pathname === path || pathname.startsWith(`${path}/`);
        }
        // Đối với các đường dẫn khác, vẫn giữ kiểm tra chính xác
        return pathname === path;
    };

    return (
        <Drawer
            title={
                <div className="flex items-center gap-1 text-[1.6rem] text-white">
                    <UserOutlined />
                    <span
                        title={userInfo?.accountname}
                        className="mt-1 w-32 truncate inline-block"
                    >
                        {userInfo?.accountname}
                    </span>
                </div>
            }
            theme="dark"
            placement="right"
            onClose={() => setIsDrawerOpen(false)}
            open={isMobile && isDrawerOpen}
            width={300}
            styles={{ body: { padding: 0 } }}
            closeIcon={<RightOutlined className="text-[1.4rem] text-white" />}
            extra={
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
            }
        >
            <div className="bg-[#2c2c2c] h-full">
                <div className="border-b border-[#444444] bg-[#333333]">
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
                </div>
                <div className="p-4">
                    <Link
                        to="/bang-dieu-khien"
                        className={`flex items-center cursor-pointer p-4 hover:text-[#b22222] ${
                            isActive("/bang-dieu-khien")
                                ? "text-[#b22222] font-semibold"
                                : "text-white"
                        }`}
                        onClick={() => setIsDrawerOpen(false)}
                    >
                        <DashboardOutlined />
                        <span className="ml-2">{t("dashboard")}</span>
                    </Link>
                    <Link
                        to="/cai-dat"
                        className={`flex items-center cursor-pointer p-4 hover:text-[#b22222] ${
                            isActive("/cai-dat")
                                ? "text-[#b22222] font-semibold"
                                : "text-white"
                        }`}
                        onClick={() => setIsDrawerOpen(false)}
                    >
                        <SettingOutlined />
                        <span className="ml-2">{t("settings.title")}</span>
                    </Link>
                    <Link
                        to="/thong-tin-he-thong"
                        className={`flex items-center cursor-pointer p-4 hover:text-[#b22222] ${
                            isActive("/thong-tin-he-thong")
                                ? "text-[#b22222] font-semibold"
                                : "text-white"
                        }`}
                        onClick={() => setIsDrawerOpen(false)}
                    >
                        <InfoCircleOutlined />
                        <span className="ml-2">{t("information")}</span>
                    </Link>
                    <div
                        onClick={logout}
                        className="flex items-center cursor-pointer p-4  text-white"
                    >
                        <LogoutOutlined />
                        <span className="ml-2">{t("logout")}</span>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-10 p-4 border-t">
                    <div
                        onClick={() => {
                            changeLanguage("vi");
                        }}
                        className="min-w-[117px] flex items-center justify-center border-2 border-[#b22222] text-white rounded-full cursor-pointer py-1 px-4"
                    >
                        <VN title="Vietnam" width="16" height="12" />
                        <span className="ml-2">Tiếng Việt</span>
                    </div>
                    <div
                        onClick={() => {
                            changeLanguage("en");
                        }}
                        className="min-w-[117px] flex items-center justify-center border-2 border-[#b22222] text-white rounded-full cursor-pointer py-1 px-4"
                    >
                        <GB title="United Kingdom" width="16" height="12" />
                        <span className="ml-2">English</span>
                    </div>
                </div>
            </div>
        </Drawer>
    );
}

export default MobileNavbar;
