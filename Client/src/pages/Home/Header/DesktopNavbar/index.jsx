import React, { useEffect, useState } from "react";
import {
    DashboardOutlined,
    InfoCircleOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

function DesktopNavbar({ t }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedKey, setSelectedKey] = useState("1");

    useEffect(() => {
        // Get current path
        const path = location.pathname;

        // Determine which key to select based on path prefix
        if (path === "/" || path.startsWith("/bang-dieu-khien")) {
            setSelectedKey("1");
        } else if (path.startsWith("/cai-dat")) {
            setSelectedKey("2");
        } else if (path.startsWith("/thong-tin-he-thong")) {
            setSelectedKey("3");
        } else {
            // Default to dashboard for any other route
            setSelectedKey("1");
        }
    }, [location.pathname]);

    const handleMenuClick = (key) => {
        switch (key) {
            case "1":
                navigate("/bang-dieu-khien");
                break;
            case "2":
                navigate("/cai-dat");
                break;
            case "3":
                navigate("/thong-tin-he-thong");
                break;
            default:
                navigate("/bang-dieu-khien");
        }
    };

    return (
        <Menu
            theme="dark"
            mode="horizontal"
            className="hidden lg:block ml-10 bg-transparent flex-1"
            style={{ height: "40px", lineHeight: "40px" }}
            selectedKeys={[selectedKey]}
            onClick={({ key }) => handleMenuClick(key)}
            items={[
                {
                    key: "1",
                    icon: <DashboardOutlined />,
                    label: t("dashboard"),
                    style: {
                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                        margin: "0 5px",
                        borderRadius: "10px 10px 0 0",
                    },
                },
                {
                    key: "2",
                    icon: <SettingOutlined />,
                    label: t("settings.title"),
                    style: {
                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                        margin: "0 5px",
                        borderRadius: "10px 10px 0 0",
                    },
                },
                {
                    key: "3",
                    icon: <InfoCircleOutlined />,
                    label: t("information"),
                    style: {
                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                        margin: "0 5px",
                        borderRadius: "10px 10px 0 0",
                    },
                },
            ]}
        />
    );
}

export default DesktopNavbar;
