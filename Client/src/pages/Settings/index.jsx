import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { getMenuIcon, getSettingsMenu } from "../../constants/settingsMenu";
import { useNavigate } from "react-router-dom";
import { errorToast } from "../../utils/toastConfig";
import { localDataNames } from "../../constants/appInfo";

function Settings({ t }) {
    const navigate = useNavigate();
    const translatedMenu = getSettingsMenu(t);

    useEffect(() => {
        document.title = "Tinventor - Cài đặt hệ thống";

        return () => {
            document.title = "Tinventor - Fire Alarm Management System";
        };
    }, []);

    const handleNavigate = (url) => {
        const userInfo = JSON.parse(
            localStorage.getItem(localDataNames.authData)
        );

        if (url === "/cai-dat/quan-ly-tai-khoan") {
            // Chỉ role 1 (admin) có quyền truy cập quản lý tài khoản
            if (userInfo && Number(userInfo.role) === 1) {
                navigate(url);
            } else {
                errorToast(t("common.noAccess"));
            }
        } else if (url === "/cai-dat/quan-ly-phan-vung") {
            // Role 1 hoặc 2 có quyền truy cập quản lý phân vùng
            if (
                userInfo &&
                (Number(userInfo.role) === 1 || Number(userInfo.role) === 2)
            ) {
                navigate(url);
            } else {
                errorToast(t("common.noAccess"));
            }
        } else if (url === "/cai-dat/tu-trung-tam-tu-dia-chi") {
            // Role 1 hoặc 2 có quyền truy cập quản lý tủ trung tâm
            if (
                userInfo &&
                (Number(userInfo.role) === 1 || Number(userInfo.role) === 2)
            ) {
                navigate(url);
            } else {
                errorToast(t("common.noAccess"));
            }
        } else if (url === "/cai-dat/khoi-giam-sat-dau-bao-falc") {
            // Role 1 hoặc 2 có quyền truy cập quản lý FALC
            if (
                userInfo &&
                (Number(userInfo.role) === 1 || Number(userInfo.role) === 2)
            ) {
                navigate(url);
            } else {
                errorToast(t("common.noAccess"));
            }
        } else if (url === "/cai-dat/khoi-dieu-khien-chuong-den-nac") {
            // Role 1 hoặc 2 có quyền truy cập quản lý NAC
            if (
                userInfo &&
                (Number(userInfo.role) === 1 || Number(userInfo.role) === 2)
            ) {
                navigate(url);
            } else {
                errorToast(t("common.noAccess"));
            }
        } else {
            navigate(url);
        }
    };

    return (
        <>
            <Helmet>
                <title>Tinventor - Cài đặt hệ thống</title>
            </Helmet>
            <div className="p-4 lg:p-[5rem]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px]">
                    {translatedMenu.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleNavigate(item.url)}
                            className="flex items-center justify-center w-full h-[6.4rem] px-[1.6rem] py-4 bg-gradient-to-r from-red-800 to-red-600 text-white font-medium text-base rounded-lg shadow-md border-l-4 border-[#b33939] hover:from-[#9a3333] hover:to-[#6e0000] hover:shadow-lg hover:shadow-red-900/20 hover:translate-y-[-2px] transition-all duration-300"
                        >
                            <span className="text-[2rem] mr-3 text-white opacity-90">
                                {getMenuIcon(item.titleKey)}
                            </span>
                            <span className="text-[1.8rem] leading-tight">
                                {item.title}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Settings;
