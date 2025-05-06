import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";

function Settings() {
    useEffect(() => {
        document.title = "Tinventor - Cài đặt hệ thống";

        // Clean up when component unmounts
        return () => {
            document.title = "Tinventor - Fire Alarm Management System";
        };
    }, []);

    return (
        <>
            <Helmet>
                <title>Tinventor - Cài đặt hệ thống</title>
            </Helmet>
            <div>aaaaa</div>
        </>
    );
}

export default Settings;
