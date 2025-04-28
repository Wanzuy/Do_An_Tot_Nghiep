import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import MainRouter from "./MainRouter";
import AuthRouter from "./AuthRouter";
import { useDispatch, useSelector } from "react-redux";
import { addAuth, authSelector } from "../store/reducers/authReducer";
import { localDataNames } from "../constants/appInfo";
const Routers = () => {
    const auth = useSelector(authSelector);
    const dispatch = useDispatch();

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
                {auth.token ? <MainRouter /> : <AuthRouter />}
            </BrowserRouter>
        </HelmetProvider>
    );
};

export default Routers;
