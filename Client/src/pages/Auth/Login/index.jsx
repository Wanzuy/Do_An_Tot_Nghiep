import React, { useEffect, useState } from "react";
import { Button, Input, Form } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import logoVN from "../../../assets/imgs/vietnam.png";
import { accountnameRule, passwordRule } from "../../../utils/ rules";
import { useDispatch } from "react-redux";
import { addAuth } from "../../../store/reducers/authReducer";
import handleAPI from "../../../api/handleAPI";
import { apiEndpoint } from "../../../constants/apiEndpoint";
import { toast } from "react-toastify";
import "./Login.scss";
import { localDataNames } from "../../../constants/appInfo";

const Login = () => {
    const [isloading, setIsloading] = useState(false);
    const [form] = Form.useForm();
    const dispatch = useDispatch();

    useEffect(() => {
        createFloatingIcons();
    }, []);

    const createFloatingIcons = () => {
        const icons = ["🔥", "🚨", "🧯", "🔔", "⚠️", "🆘", "🚒", "🔴"];
        for (let i = 0; i < 20; i++) {
            const icon = document.createElement("div");
            icon.className = "fire-icon";
            icon.textContent = icons[Math.floor(Math.random() * icons.length)];
            icon.style.left = Math.random() * 100 + "%";
            icon.style.top = Math.random() * 100 + "%";
            icon.style.fontSize = Math.random() * 20 + 15 + "px";
            icon.style.animationDuration = Math.random() * 20 + 10 + "s";
            document.body.appendChild(icon);
        }
    };

    const onFinish = async (values) => {
        setIsloading(true);
        try {
            const res = await handleAPI(apiEndpoint.auth.login, values, "post");
            console.log(res);

            if (res.data) {
                toast.success(res.message);
                dispatch(addAuth(res.data));
                localStorage.setItem(
                    localDataNames.authData,
                    JSON.stringify(res.data)
                );
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsloading(false);
        }
    };

    return (
        <div className="h-screen flex justify-center items-center relative overflow-hidden px-10">
            {/* Themed Background Elements */}
            <div className="background"></div>
            <div className="grid-overlay"></div>
            <div className="alert-effect"></div>

            {/* Floating Fire Icons - Added via JavaScript */}
            <div className="fire-icon text-3xl left-[10%] top-[80%]">🔥</div>
            <div className="fire-icon text-4xl left-1/4 top-[90%]">🚨</div>
            <div className="fire-icon text-2xl left-3/4 top-[85%]">🧯</div>
            <div className="fire-icon text-3xl left-[90%] top-[70%]">🔔</div>
            <div className="fire-icon text-3xl left-[5%] top-[30%]">🚒</div>
            <div className="fire-icon text-4xl left-[60%] top-[20%]">⚠️</div>
            <div className="fire-icon text-2xl left-[40%] top-[65%]">🆘</div>
            <div className="fire-icon text-3xl left-[75%] top-[40%]">🔴</div>

            <div className="bg-white  rounded-[1.8rem] overflow-hidden">
                {/* Header chồng lên trên */}
                <div className="w-full max-w-[900px] ">
                    <div className="bg-gradient-to-r from-red-800 to-red-600 text-white py-4 px-6 text-center text-xl font-bold  shadow-lg">
                        <div className="header-icon text-2xl sm:text-3xl flex justify-center items-center gap-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 100 100"
                                preserveAspectRatio="xMidYMid meet"
                                width="24"
                                height="24"
                            >
                                <defs>
                                    <filter
                                        id="shadow"
                                        x="-10%"
                                        y="-10%"
                                        width="120%"
                                        height="120%"
                                    >
                                        <feDropShadow
                                            dx="0"
                                            dy="0"
                                            stdDeviation="2"
                                            floodOpacity="0.5"
                                        />
                                    </filter>
                                </defs>
                                <rect
                                    width="100"
                                    height="100"
                                    fill="#cc0000"
                                    filter="url(#shadow)"
                                />
                                <path
                                    d="M30 20 L75 20 L72 30 L59 30 L45 80 L33 80 L47 30 L27 30 Z"
                                    fill="white"
                                />
                            </svg>
                            <p className="mt-[0.3rem]">
                                {" "}
                                HỆ THỐNG QUẢN LÝ BÁO CHÁY
                            </p>
                        </div>
                    </div>
                </div>

                {/* Khối bản đồ và form */}
                <div className="flex justify-between items-center">
                    {/* Bản đồ Việt Nam bên trái */}
                    <div className="hidden p-10 md:block w-[400px] max-w-[40%]">
                        <img
                            src={logoVN}
                            alt="Bản đồ Việt Nam"
                            className="w-full h-auto rounded-lg border border-white border-opacity-40"
                        />
                    </div>

                    {/* Form đăng nhập bên phải */}
                    <div className="login-container w-full max-w-[430px]">
                        <div className="p-8 sm:p-10">
                            <Form
                                form={form}
                                name="login"
                                onFinish={onFinish}
                                layout="vertical"
                            >
                                <Form.Item
                                    label={
                                        <span className="text-gray-600 font-semibold">
                                            Tên đăng nhập:
                                        </span>
                                    }
                                    name="accountname"
                                    rules={accountnameRule}
                                    className="mb-5"
                                >
                                    <Input
                                        placeholder="Nhập tên đăng nhập..."
                                        size="large"
                                        className="px-4 py-3 border border-solid border-gray-200 rounded-2xl"
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={
                                        <span className="text-gray-600 font-semibold">
                                            Mật khẩu:
                                        </span>
                                    }
                                    name="password"
                                    rules={passwordRule}
                                    className="mb-6"
                                >
                                    <Input.Password
                                        placeholder="Nhập mật khẩu..."
                                        size="large"
                                        className="px-4 py-3 border border-solid border-gray-200 rounded-2xl"
                                        iconRender={(visible) =>
                                            visible ? (
                                                <EyeTwoTone />
                                            ) : (
                                                <EyeInvisibleOutlined />
                                            )
                                        }
                                    />
                                </Form.Item>

                                <div className="flex justify-end mt-12">
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        className="login-btn px-6 py-[1rem] h-auto w-full font-medium text-[1.6rem] rounded-2xl flex items-center justify-center"
                                        loading={isloading}
                                    >
                                        Đăng nhập
                                    </Button>
                                </div>
                            </Form>
                        </div>

                        <div className="footer text-center py-4 text-gray-500 text-xl border-t border-gray-200">
                            &copy; 2025 - bản quyền thuộc về Tinventor
                            Electronics
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
