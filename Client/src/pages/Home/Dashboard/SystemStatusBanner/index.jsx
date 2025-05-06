import React from "react";
import { WarningFilled } from "@ant-design/icons";
import "./SystemStatusBanner.scss";

function SystemStatusBanner() {
    return (
        <>
            <div className="bg-gradient-to-r from-red-800 to-red-600 text-[#FBBD24] text-center p-[1.5rem] font-bold text-[1.8rem] flex items-center justify-center shadow-md ">
                <span className="inline-block mr-3 text-2xl warning-icon">
                    <WarningFilled className="text-[2.2rem]" />
                </span>
                <p>HỆ THỐNG ĐANG CÓ LỖI</p>
            </div>
        </>
    );
}

export default SystemStatusBanner;
