import React, { useState, useEffect } from "react";
import { Table, Button, Space, Badge, Tag, Card, Spin } from "antd";
import {
    EyeOutlined,
    SettingOutlined,
    LeftCircleFilled,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import "./CabinetManagement.scss";
import handleAPI from "../../../api/handleAPI";
import { apiEndpoint } from "../../../constants/apiEndpoint";
import CabinetDetailModal from "./CabinetDetailModal";
import EditCabinetModal from "./EditCabinetModal";

function CabinetManagement({ t }) {
    const [cabinets, setCabinets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedCabinet, setSelectedCabinet] = useState(null);
    const [cabinetDetailLoading, setCabinetDetailLoading] = useState(false);

    useEffect(() => {
        document.title = "Tinventor - Tủ trung tâm - Tủ địa chỉ";
        fetchCabinets();

        return () => {
            document.title = "Tinventor - Fire Alarm Management System";
        };
    }, []);

    const fetchCabinets = async () => {
        setLoading(true);
        try {
            const response = await handleAPI(apiEndpoint.panels.getAllPanels);

            if (response && response.data) {
                setCabinets(response.data);
            }
        } catch (error) {
            console.error("Error fetching cabinets:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCabinetDetails = async (cabinetId) => {
        setCabinetDetailLoading(true);
        try {
            // Replace with actual API endpoint for getting cabinet details
            const response = await handleAPI(
                apiEndpoint.panels.getPanelsById(cabinetId)
            );

            if (response && response.data) {
                setSelectedCabinet(response.data);
            }
        } catch (error) {
            console.error("Error fetching cabinet details:", error);
        } finally {
            setCabinetDetailLoading(false);
        }
    };

    const handleViewDetails = async (cabinet) => {
        setSelectedCabinet(cabinet);
        setDetailModalVisible(true);

        await fetchCabinetDetails(cabinet._id);
    };

    const handleConfigure = (cabinet) => {
        setSelectedCabinet(cabinet);
        setEditModalVisible(true);
    };

    const handleEditSuccess = (updatedCabinet) => {
        setCabinets(
            cabinets.map((cab) =>
                cab._id === updatedCabinet._id ? updatedCabinet : cab
            )
        );
    };

    const getStatusBadge = (status) => {
        if (status === "Online") {
            return (
                <Badge
                    status="success"
                    text={
                        <span className="text-[1.4rem] text-white">Online</span>
                    }
                />
            );
        } else if (status === "Offline") {
            return (
                <Badge
                    status="error"
                    text={
                        <span className="text-[1.4rem] text-white">
                            Offline
                        </span>
                    }
                />
            );
        } else {
            return (
                <Badge
                    status="warning"
                    text={
                        <span className="text-[1.4rem] text-white">
                            {status}
                        </span>
                    }
                />
            );
        }
    };

    const getPanelTypeTag = (type) => {
        if (type === "Control Panel") {
            return (
                <Tag color="#c62828" className="text-[1.4rem] px-3 py-1">
                    {t("cabinet.MainPanel")}
                </Tag>
            );
        } else if (type === "Sub Panel") {
            return (
                <Tag color="#1890ff" className="text-[1.4rem] px-3 py-1">
                    {t("cabinet.AddressablePanel")}
                </Tag>
            );
        } else {
            return (
                <Tag color="default" className="text-[1.4rem] px-3 py-1">
                    {type}
                </Tag>
            );
        }
    };

    const columns = [
        {
            title: (
                <span className="text-[1.6rem] font-semibold">
                    {t("cabinet.name")}
                </span>
            ),
            dataIndex: "name",
            key: "name",
            render: (text) => (
                <span className="text-[1.5rem] font-medium">{text}</span>
            ),
            ellipsis: true,
            width: 200,
        },
        {
            title: (
                <span className="text-[1.6rem] font-semibold">
                    {t("cabinet.type")}
                </span>
            ),
            dataIndex: "panel_type",
            key: "panel_type",
            render: (type) => getPanelTypeTag(type),
            width: 150,
        },
        {
            title: (
                <span className="text-[1.6rem] font-semibold">
                    {t("cabinet.location")}
                </span>
            ),
            dataIndex: "location",
            key: "location",
            render: (text) => <span className="text-[1.4rem]">{text}</span>,
            ellipsis: true,
            width: 200,
        },
        {
            title: (
                <span className="text-[1.6rem] font-semibold">
                    {t("cabinet.status")}
                </span>
            ),
            dataIndex: "status",
            key: "status",
            render: (status) => getStatusBadge(status),
            width: 120,
        },
        {
            title: (
                <span className="text-[1.6rem] font-semibold">
                    {t("cabinet.options")}
                </span>
            ),
            key: "actionMobile",

            render: (_, record) => (
                <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                >
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(record)}
                        className="bg-blue-500 hover:!bg-blue-400 flex items-center w-full"
                    >
                        <span className="ml-1">{t("common.detail")}</span>
                    </Button>
                    <Button
                        type="primary"
                        icon={<SettingOutlined />}
                        onClick={() => handleConfigure(record)}
                        className="bg-[#c62828] flex items-center w-full"
                    >
                        <span className="ml-1">{t("common.config")}</span>
                    </Button>
                </Space>
            ),
            width: 150,
        },
    ];

    return (
        <div className="p-4 lg:p-[5rem]">
            <div>
                <div className="md:bg-[#434343] md:p-4 md:rounded-xl md:shadow-lg flex flex-col md:flex-row md:justify-between md:items-center mb-8">
                    <div className="flex items-center gap-4 md:mb-0 mb-4">
                        <Link to="/cai-dat">
                            <LeftCircleFilled className="text-[2.5rem] text-white" />
                        </Link>
                        <h1 className="text-3xl font-bold text-white ">
                            {t("cabinet.title")}
                        </h1>
                    </div>
                </div>

                <Card className="cabinet-table-card bg-[#434343] border border-white/10">
                    {loading ? (
                        <div className="text-center py-16">
                            <Spin size="large" />
                            <p className="text-white mt-4 text-[1.6rem]">
                                Đang tải dữ liệu...
                            </p>
                        </div>
                    ) : (
                        <Table
                            dataSource={cabinets}
                            columns={columns}
                            rowKey="_id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                pageSizeOptions: ["10", "20", "50"],
                                showTotal: (total) =>
                                    `${t("common.total")}: ${total} ${t(
                                        "common.record"
                                    )}`,
                            }}
                            className="custom-cabinet-table"
                        />
                    )}
                </Card>
            </div>
            <CabinetDetailModal
                visible={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                cabinet={selectedCabinet}
                loading={cabinetDetailLoading}
                t={t}
                getPanelTypeTag={getPanelTypeTag}
            />

            <EditCabinetModal
                visible={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                cabinet={selectedCabinet}
                onSuccess={handleEditSuccess}
                t={t}
            />
        </div>
    );
}

export default CabinetManagement;
