import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Dashboard from "../pages/Home/Dashboard";
import Information from "../pages/Information";
import Settings from "../pages/Settings";
import Header from "../pages/Home/Header";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import NotFound from "../components/NotFound";
import Login from "../pages/Auth/Login";
import { useDispatch, useSelector } from "react-redux";
import { addAuth, authSelector } from "../store/reducers/authReducer";
import { localDataNames } from "../constants/appInfo";
import { useTranslation } from "react-i18next";
import "../styles/mainRouter.scss";
import AccountManagement from "../pages/Settings/AccountManagement";
import { errorToast } from "../utils/toastConfig";
import ZonesManagement from "../pages/Settings/ZonesManagement";
import CabinetManagement from "../pages/Settings/CabinetManagement";
import Falcmanagement from "../pages/Settings/Falcmanagement";
import NacManagement from "../pages/Settings/NacManagement";
import TimeManagement from "../pages/Settings/TimeManagement";
import VolumnManagement from "../pages/Settings/VolumnManagement";

const ProtectedRoute = ({ element, requiredRole }) => {
    const auth = useSelector(authSelector);

    if (!auth || !auth.token) {
        errorToast("Bạn cần đăng nhập để truy cập trang này!");
        return <Navigate to="/" replace />;
    }

    const requiredRoles = Array.isArray(requiredRole)
        ? requiredRole
        : [requiredRole];

    if (!requiredRoles.includes(Number(auth.role))) {
        return <Navigate to="/cai-dat" replace />;
    }

    return element;
};

const Routers = () => {
    const auth = useSelector(authSelector);
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getDatas();
    }, []);

    const getDatas = () => {
        const data = localStorage.getItem(localDataNames.authData);
        if (data) {
            dispatch(addAuth(JSON.parse(data)));
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#333333]">
                {/* Hiệu ứng loading tùy chọn */}
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
            </div>
        );
    }

    return (
        <HelmetProvider>
            <BrowserRouter>
                {auth.token ? (
                    <Layout className="min-h-screen">
                        <Header t={t} i18n={i18n} />
                        <Content
                            className="custom-scrollbar overflow-y-auto bg-[#333333]"
                            style={{ height: "calc(100vh - 64px)" }}
                        >
                            <Routes>
                                <Route
                                    path="/"
                                    element={<Navigate to="/bang-dieu-khien" />}
                                />
                                <Route
                                    path="/bang-dieu-khien"
                                    element={<Dashboard />}
                                />
                                <Route
                                    path="/cai-dat"
                                    element={<Settings t={t} />}
                                />
                                <Route
                                    path="/cai-dat/khoi-giam-sat-dau-bao-falc"
                                    element={
                                        <ProtectedRoute
                                            element={<Falcmanagement t={t} />}
                                            requiredRole={[1, 2]}
                                        />
                                    }
                                />
                                <Route
                                    path="/cai-dat/khoi-dieu-khien-chuong-den-nac"
                                    element={
                                        <ProtectedRoute
                                            element={<NacManagement t={t} />}
                                            requiredRole={[1, 2]}
                                        />
                                    }
                                />
                                <Route
                                    path="/cai-dat/quan-ly-tai-khoan"
                                    element={
                                        <ProtectedRoute
                                            element={
                                                <AccountManagement t={t} />
                                            }
                                            requiredRole={1}
                                        />
                                    }
                                />
                                <Route
                                    path="/cai-dat/quan-ly-phan-vung"
                                    element={
                                        <ProtectedRoute
                                            element={<ZonesManagement t={t} />}
                                            requiredRole={[1, 2]}
                                        />
                                    }
                                />
                                <Route
                                    path="/cai-dat/quan-ly-dong-ho-hen-gio"
                                    element={
                                        <ProtectedRoute
                                            element={<TimeManagement t={t} />}
                                            requiredRole={[1, 2]}
                                        />
                                    }
                                />
                                <Route
                                    path="/cai-dat/dieu-chinh-am-luong"
                                    element={
                                        <ProtectedRoute
                                            element={<VolumnManagement t={t} />}
                                            requiredRole={[1, 2]}
                                        />
                                    }
                                />
                                <Route
                                    path="/cai-dat/tu-trung-tam-tu-dia-chi"
                                    element={
                                        <ProtectedRoute
                                            element={
                                                <CabinetManagement t={t} />
                                            }
                                            requiredRole={[1, 2]}
                                        />
                                    }
                                />
                                <Route
                                    path="/thong-tin-he-thong"
                                    element={<Information t={t} />}
                                />
                                <Route
                                    path="/404"
                                    element={<NotFound t={t} />}
                                />
                                <Route
                                    path="*"
                                    element={<Navigate to="/404" replace />}
                                />
                            </Routes>
                        </Content>
                    </Layout>
                ) : (
                    <Routes>
                        <Route path="/" element={<Login t={t} />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                )}
            </BrowserRouter>
        </HelmetProvider>
    );
};

export default Routers;
