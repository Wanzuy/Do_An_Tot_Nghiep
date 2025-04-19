import { ConfigProvider } from "antd";
import "@ant-design/v5-patch-for-react-19";
import Routers from "./routers/Routers";

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
            <Routers />
        </ConfigProvider>
    );
}

export default App;
