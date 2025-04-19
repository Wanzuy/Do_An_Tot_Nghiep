import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../pages/Auth/Login";

const AuthRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
        </Routes>
    );
};
export default AuthRouter;
