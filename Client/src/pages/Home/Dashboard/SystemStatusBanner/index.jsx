import React from "react";
import { WarningFilled, CheckCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import "./SystemStatusBanner.scss";

function SystemStatusBanner({ systemStatus }) {
  const { t } = useTranslation();

  const hasError = systemStatus?.hasError;

  return (
    <>
      <div
        className={`text-center p-[1.5rem] font-bold text-[1.8rem] flex items-center justify-center shadow-md ${
          hasError
            ? "bg-gradient-to-r from-red-800 to-red-600 text-[#FBBD24]"
            : "bg-gradient-to-r from-green-800 to-green-600 text-white"
        }`}
      >
        <span className="inline-block mr-3 text-2xl warning-icon">
          {hasError ? (
            <WarningFilled className="text-[2.2rem]" />
          ) : (
            <CheckCircleOutlined className="text-[2.2rem]" />
          )}
        </span>
        <p>
          {hasError
            ? t("Dashboard.systemError") || "HỆ THỐNG ĐANG CÓ LỖI"
            : t("Dashboard.systemNormal") || "HỆ THỐNG HOẠT ĐỘNG BÌNH THƯỜNG"}
        </p>
      </div>
    </>
  );
}

export default SystemStatusBanner;
