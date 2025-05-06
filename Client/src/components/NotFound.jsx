import React from "react";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import RobotLogo from "./RobotLogo";

function NotFound({ t }) {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center h-full">
            <Result
                icon={<RobotLogo />}
                subTitle={
                    <p className="text-[1.6rem] text-white">
                        {t("404.message")}
                    </p>
                }
                extra={
                    <Button
                        type="primary"
                        onClick={() => navigate("/")}
                        className="bg-[#c62828] hover:bg-[#b71c1c] border-0"
                    >
                        {t("404.back")}
                    </Button>
                }
            />
        </div>
    );
}

export default NotFound;
