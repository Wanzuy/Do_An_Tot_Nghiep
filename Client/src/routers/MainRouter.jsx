import React from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "antd";
import Header from "../pages/Home/Header";
import { Content } from "antd/es/layout/layout";
import "../styles/mainRouter.scss";
import Dashboard from "../pages/Home/Dashboard";
import Information from "../pages/Information";
import Settings from "../pages/Settings";
import { useTranslation } from "react-i18next";

const MainRouter = () => {
    const { t, i18n } = useTranslation();

    return (
        <Layout className="header-main min-h-screen">
            <Header t={t} i18n={i18n} />
            <Content
                className="custom-scrollbar overflow-y-auto px-[50px] bg-[#212121]"
                style={{ height: "calc(100vh - 63px)" }}
            >
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/cai-dat" element={<Settings />} />
                    <Route
                        path="/thong-tin-he-thong"
                        element={<Information t={t} />}
                    />
                </Routes>
            </Content>
        </Layout>
    );
};

export default MainRouter;
