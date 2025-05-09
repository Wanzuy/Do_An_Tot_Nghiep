import { ConfigProvider } from "antd";
import "@ant-design/v5-patch-for-react-19";
import Routers from "./routers/Routers";
import StoreProvider from "./store/StoreProvider";
import { ToastContainer } from "react-toastify";

function App() {
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: "#b22222",
                    fontFamily: "Noto Sans, sans-serif",
                    fontSize: 16,
                },
            }}
        >
            <StoreProvider>
                <Routers />
                <ToastContainer />
            </StoreProvider>
        </ConfigProvider>
    );
}

export default App;
