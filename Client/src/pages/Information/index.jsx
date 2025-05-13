import React, { useEffect } from "react";
import { Info, Code, Copyright } from "lucide-react";
import logoTinventor from "../../assets/imgs/logo-tinventor.png";
import { Helmet } from "react-helmet-async";

function Information({ t }) {
    useEffect(() => {
        document.title = "Tinventor - Thông tin hệ thống";

        // Clean up when component unmounts
        return () => {
            document.title = "Tinventor - Fire Alarm Management System";
        };
    }, []);

    return (
        <>
            <Helmet>
                <title>Tinventor - Thông tin hệ thống</title>
            </Helmet>
            <div className="flex flex-col items-center justify-center min-h-[100%] px-4 md:px-0">
                <div className="max-w-[650px] w-full rounded-md bg-[#434343] shadow-lg border-4 border-[#c53838] p-6 relative">
                    {/* Background gradient accent */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-600/5 rounded-full blur-3xl"></div>

                    {/* Header with icon */}
                    <div className="flex items-center gap-3 mb-8 relative">
                        <div className="bg-red-600/20 p-2 rounded-lg">
                            <Info size={20} className="text-red-500" />
                        </div>
                        <h1 className="text-[2rem] font-semibold text-white tracking-wide">
                            {t("info.title")}
                        </h1>
                    </div>

                    {/* Logo container with subtle effects */}
                    <div className="relative mb-16 mt-4">
                        <div className="relative bg-[#BDBDBD ]/90 backdrop-blur-sm bg-gradient-to-b from-gray-400/50 to-gray-500/50 rounded-lg p-6 border border-red-900/10">
                            <img
                                src={logoTinventor}
                                alt="logo-tinventor"
                                className="w-full object-contain h-auto max-h-36  mx-auto"
                            />
                        </div>
                    </div>

                    {/* Info sections with improved styling */}
                    <div className="space-y-5">
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-[#BDBDBD ]/90 backdrop-blur-sm bg-gradient-to-b from-gray-400/50 to-gray-500/50 border-l-2 border-red-700">
                            <Copyright
                                size={18}
                                className="text-red-700 flex-shrink-0 mt-[2px]"
                            />
                            <p className="text-[1.4rem] text-white">
                                {t("info.copyright")}
                            </p>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-lg bg-[#BDBDBD ]/90 backdrop-blur-sm bg-gradient-to-b from-gray-400/50 to-gray-500/50">
                            <Code
                                size={18}
                                className="text-red-700 flex-shrink-0"
                            />
                            <div className="flex items-center gap-3">
                                <span className="text-[1.4rem] text-white">
                                    {t("info.version")}
                                </span>
                                <span className="bg-red-900/30 text-red-500 text-[1.2rem] px-3 py-1 rounded-full font-mono">
                                    0.0.1
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-gray-500 text-[1.2rem] text-center sm:text-left">
                    {t("info.reserve")}
                </p>
            </div>
        </>
    );
}

export default Information;
