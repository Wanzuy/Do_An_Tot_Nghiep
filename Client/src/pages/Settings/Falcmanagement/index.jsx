import React, { useEffect, useState } from "react";
import {
    LeftCircleFilled,
    SettingOutlined,
    EyeOutlined,
    LoadingOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Spin, Switch, Card, Button, Empty, Space } from "antd";
import handleAPI from "../../../api/handleAPI";
import { apiEndpoint } from "../../../constants/apiEndpoint";

function Falcmanagement({ t }) {
    const [isLoading, setIsLoading] = useState(false);
    const [falcDevices, setFalcDevices] = useState([]);

    useEffect(() => {
        getFalcDevices();
    }, []);

    const getFalcDevices = async () => {
        setIsLoading(true);
        try {
            const response = await handleAPI(apiEndpoint.falc.getAll);
            if (response && response.data) {
                setFalcDevices(response.data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (checked, deviceId) => {
        try {
            await handleAPI(
                apiEndpoint.falc.updateStatus(deviceId),
                { is_active: checked },
                "patch"
            );

            // Update local state after successful API call
            setFalcDevices(
                falcDevices.map((device) =>
                    device._id === deviceId
                        ? { ...device, is_active: checked }
                        : device
                )
            );
        } catch (error) {
            console.log(error);
        }
    };

    const handleConfigure = (id) => {
        console.log(`Configure FALC device with ID: ${id}`);
        // Implement navigation to configuration page
    };

    const handleViewDetails = (id) => {
        console.log(`View details for FALC device with ID: ${id}`);
        // Implement navigation to details page
    };

    return (
        <div className="p-4 lg:p-[5rem]">
            <div>
                <div className="md:bg-[#434343] md:p-4 md:rounded-xl md:shadow-lg flex flex-col md:flex-row md:justify-between md:items-center mb-8">
                    <div className="flex items-center gap-4 md:mb-0 mb-4">
                        <Link to="/cai-dat">
                            <LeftCircleFilled className="text-[2.5rem] text-white" />
                        </Link>
                        <h1 className="text-3xl font-bold text-white">
                            {t("FalcManagement.title")}
                        </h1>
                    </div>
                </div>

                {/* Danh sách thiết bị FALC */}
                {isLoading ? (
                    <div className="text-white text-center py-8">
                        <Spin indicator={<LoadingOutlined spin size={24} />} />
                        <p className="mt-2"> {t("common.loading")}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {falcDevices.length > 0 ? (
                            falcDevices.map((device) => (
                                <Card
                                    key={device._id}
                                    className="bg-[#434343] text-white border-white/10 hover:shadow-xl transition-shadow w-full p-0"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Column 1: Switch and Device Name */}
                                        <div className="flex flex-col gap-8">
                                            <div>
                                                <Switch
                                                    checked={device.is_active}
                                                    onChange={(checked) =>
                                                        handleStatusChange(
                                                            checked,
                                                            device._id
                                                        )
                                                    }
                                                />
                                            </div>
                                            <h3 className="text-2xl text-white">
                                                <span>
                                                    {t("FalcManagement.board")}:{" "}
                                                </span>
                                                <span className="font-semibold">
                                                    {device.name}
                                                </span>
                                            </h3>
                                        </div>

                                        {/* Column 2: Description and Detector Count */}
                                        <div className="flex flex-col justify-center sm:items-center">
                                            <div className=" text-white">
                                                <span>
                                                    {t(
                                                        "FalcManagement.numberdetectors"
                                                    )}
                                                    :
                                                </span>
                                                <span>
                                                    {"  "}
                                                    {device.number_of_detectors}
                                                </span>
                                            </div>
                                            <p className="text-white mt-1 sm:mt-8">
                                                <span>
                                                    {t("FalcManagement.note")}:{" "}
                                                </span>
                                                <span className="font-semibold">
                                                    {device.description}
                                                </span>
                                            </p>
                                        </div>

                                        {/* Column 3: Action Buttons */}
                                        <div className="flex flex-col sm:items-end h-full">
                                            <Space
                                                direction="vertical"
                                                size="small"
                                            >
                                                <Button
                                                    icon={<EyeOutlined />}
                                                    onClick={() =>
                                                        handleViewDetails(
                                                            device._id
                                                        )
                                                    }
                                                    className="!bg-blue-500 hover:opacity-85 flex w-full !text-white border-none"
                                                >
                                                    {t("common.detail")}
                                                </Button>
                                                <Button
                                                    type="primary"
                                                    ghost
                                                    icon={<SettingOutlined />}
                                                    onClick={() =>
                                                        handleConfigure(
                                                            device._id
                                                        )
                                                    }
                                                    className="!bg-[#c62828] hover:opacity-85 w-full !text-white border-none"
                                                >
                                                    {t("common.config")}
                                                </Button>
                                            </Space>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <Empty
                                description="Không có thiết bị nào"
                                className="text-white my-8"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Falcmanagement;
