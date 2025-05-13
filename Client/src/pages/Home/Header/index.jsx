import React, { useEffect, useState } from "react";
import {
    ApartmentOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Button, Card, Dropdown, Space, Drawer } from "antd";
import { Header as AntHeader } from "antd/es/layout/layout";
import { GB, VN } from "country-flag-icons/react/3x2";
import DesktopNavbar from "./DesktopNavbar";
import "./Header.scss";
import MobileNavbar from "./MobileNavbar";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeAuth } from "../../../store/reducers/authReducer";
import { localDataNames } from "../../../constants/appInfo";

function Header({ t, i18n }) {
    const userInfo = JSON.parse(localStorage.getItem(localDataNames.authData));
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [currentDate, setCurrentDate] = useState("");
    const [currentTime, setCurrentTime] = useState("");

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    // useEffect này là để cập nhật thời gian và ngày tháng hiện tại
    useEffect(() => {
        const today = new Date();
        const formattedDate = `${String(today.getDate()).padStart(
            2,
            "0"
        )}-${String(today.getMonth() + 1).padStart(
            2,
            "0"
        )}-${today.getFullYear()}`;
        setCurrentDate(formattedDate);

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

    // useEffect này là để kiểm tra kích thước
    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkIsMobile();

        window.addEventListener("resize", checkIsMobile);

        return () => window.removeEventListener("resize", checkIsMobile);
    }, []);

    const logout = () => {
        dispatch(removeAuth());
        localStorage.removeItem("authData");
        navigate("/");
    };

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
            onClick: logout,
        },
    ];

    return (
        <AntHeader
            className={`Header bg-gradient-to-r from-[#c62828] to-[#b71c1c] h-auto flex justify-between items-center shadow-md sticky top-0 z-50 ${
                isMobile ? "px-[10px]" : ""
            }`}
        >
            {/* Logo và tên ứng dụng */}
            <div className="flex items-center ">
                <Link to="/bang-dieu-khien">
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
                </Link>
                {isMobile && (
                    <span className="text-[2rem] font-bold text-white ml-4">
                        FireGo
                    </span>
                )}
            </div>
            {/* từ kích thước màn hình 1024 trở lên */}
            <DesktopNavbar t={t} />

            <div className="flex items-center">
                <Space size="small">
                    {!isMobile && (
                        <Card
                            size="small"
                            className="bg-transparent border-none text-white"
                        >
                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1 text-[1.2rem] opacity-80">
                                    <UserOutlined />
                                    <span className="mt-1 w-24 truncate inline-block">
                                        {userInfo?.accountname}
                                    </span>
                                </div>
                                <span className="block font-semibold text-center text-[1.4rem]">
                                    {userInfo?.showname}
                                </span>
                            </div>
                        </Card>
                    )}

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

                    {!isMobile && (
                        <Card
                            size="small"
                            className="bg-transparent border-none text-white text-center p-0"
                        >
                            <span className="block font-medium text-[1.2rem] opacity-80">
                                <ApartmentOutlined />
                            </span>
                            <span className="block font-semibold text-[1.4rem]">
                                192.168.10.96
                            </span>
                        </Card>
                    )}
                </Space>

                {/* Hiển thị Dropdown hoặc nút mở Drawer tùy thuộc kích thước màn hình */}
                {!isMobile ? (
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
                            className="text-white ml-4  bg-black bg-opacity-20 border-0"
                        />
                    </Dropdown>
                ) : (
                    <Button
                        type="ghost"
                        shape="circle"
                        icon={<MenuFoldOutlined />}
                        onClick={() => setIsDrawerOpen(true)}
                        className="text-white ml-4  bg-black bg-opacity-20 border-0"
                    />
                )}
            </div>

            {/* Drawer cho màn hình mobile */}
            <MobileNavbar
                setIsDrawerOpen={setIsDrawerOpen}
                isMobile={isMobile}
                isDrawerOpen={isDrawerOpen}
                t={t}
                changeLanguage={changeLanguage}
                logout={logout}
            />
        </AntHeader>
    );
}

export default Header;
