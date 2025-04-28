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

    const pathToKey = {
        "/": "1",
        "/cai-dat": "2",
        "/thong-tin-he-thong": "3",
    };

    useEffect(() => {
        const path = location.pathname;
        const key = pathToKey[path] || "1";
        setSelectedKey(key);
    }, [location.pathname]);

    const handleMenuClick = (key) => {
        switch (key) {
            case "1":
                navigate("/");
                break;
            case "2":
                navigate("/cai-dat");
                break;
            case "3":
                navigate("/thong-tin-he-thong");
                break;
            default:
                navigate("/");
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
                    label: t("settings"),
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
