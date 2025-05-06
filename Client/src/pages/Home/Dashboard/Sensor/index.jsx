import { ExclamationCircleOutlined, SoundFilled } from "@ant-design/icons";
import { Card, List, Progress, Typography } from "antd";
import React from "react";

const { Text } = Typography;

function Sensor() {
    return (
        <Card
            title={
                <>
                    <SoundFilled /> Đầu báo
                </>
            }
            variant="borderless"
            styles={{
                header: {
                    color: "white",
                    background: "linear-gradient(90deg, #b71c1c, #e53935)",
                    borderBottom: "none",
                },
            }}
            style={{
                border: "1px solid rgba(255, 255, 255, 0.05)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            }}
            className="bg-[#333333] "
        >
            <div className="flex flex-col items-center justify-center mb-4">
                <div className="relative flex items-center justify-center w-[180px] h-[180px] bg-[#0000004d] border-[10px] border-[#e53935] rounded-full shadow-[0_0_30px_rgba(183,28,28,0.3)]">
                    <div className="flex flex-col items-center">
                        <div className="text-[35px] font-bold text-white">
                            356
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                            NGẮT KẾT NỐI
                        </div>
                    </div>
                </div>
            </div>
            <List
                itemLayout="horizontal"
                dataSource={[
                    "Detector disconnect in loop FAC01_001",
                    "Detector disconnect in loop FAC01_002",
                    "Detector disconnect in loop FAC01_003",
                    "Detector disconnect in loop FAC01_004",
                    "Detector disconnect in loop FAC01_005",
                    "Detector disconnect in loop FAC01_006",
                    "Detector disconnect in loop FAC01_007",
                ]}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={
                                <ExclamationCircleOutlined
                                    style={{ color: "red" }}
                                />
                            }
                            title={<Text className="text-white">{item}</Text>}
                        />
                    </List.Item>
                )}
            />
        </Card>
    );
}

export default Sensor;
