/* eslint-disable no-constant-condition */
import React from "react";
import { BrowserRouter } from "react-router-dom";
import MainRouter from "./MainRouter";
import AuthRouter from "./AuthRouter";
const Routers = () => {
    return (
        <BrowserRouter>
            {1 <= 2 ? <MainRouter /> : <AuthRouter />}
        </BrowserRouter>
    );
};

export default Routers;
