import React from "react";
import "./Dashboard.scss";
import SystemStatusBanner from "./SystemStatusBanner";
import { Card, Col, Progress, Row, Typography } from "antd";
import { Space } from "lucide-react";
import { PhoneOutlined, SettingOutlined } from "@ant-design/icons";
import Motherboard from "./Motherboard";
import Sensor from "./Sensor";

const { Text } = Typography;

function Dashboard() {
    return (
        <>
            <SystemStatusBanner />
            <div className="p-10">
                <Row gutter={[16, 16]}>
                    {/* Cột đầu tiên: Bo mạch và Đầu báo */}
                    <Col xs={24} md={18}>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={12}>
                                <Motherboard />
                            </Col>
                            <Col xs={24} md={12}>
                                <Sensor />
                            </Col>
                        </Row>
                    </Col>

                    {/* Cột thứ hai: Các khối thông tin */}
                    <Col xs={24} md={6}>
                        <div>aaaa</div>
                    </Col>
                </Row>
            </div>
        </>
    );
}

export default Dashboard;
