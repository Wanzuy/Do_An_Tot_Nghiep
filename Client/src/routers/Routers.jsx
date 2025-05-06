import React, { useEffect } from "react";
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

const Routers = () => {
    const auth = useSelector(authSelector);
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        getDatas();
    }, []);

    const getDatas = () => {
        const data = localStorage.getItem(localDataNames.authData);
        if (data) {
            dispatch(addAuth(JSON.parse(data)));
        }
    };

    return (
        <HelmetProvider>
            <BrowserRouter>
                {auth.token ? (
                    <Layout className="header-main min-h-screen">
                        <Header t={t} i18n={i18n} />
                        <Content
                            className="custom-scrollbar overflow-y-auto bg-[#333333]"
                            style={{ height: "calc(100vh - 63px)" }}
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
                                <Route path="/cai-dat" element={<Settings />} />
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
                        <Route path="/" element={<Login />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                )}
            </BrowserRouter>
        </HelmetProvider>
    );
};

export default Routers;
