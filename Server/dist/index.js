"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const connect_1 = __importDefault(require("./src/database/connect"));
const userRouter_1 = __importDefault(require("./src/routers/userRouter"));
const zoneRouter_1 = __importDefault(require("./src/routers/zoneRouter"));
const FalcBoardRouter_1 = __importDefault(require("./src/routers/FalcBoardRouter"));
const DetectorRouter_1 = __importDefault(require("./src/routers/DetectorRouter"));
const NacBoardRouter_1 = __importDefault(require("./src/routers/NacBoardRouter"));
const NacCircuitRouter_1 = __importDefault(require("./src/routers/NacCircuitRouter"));
const PanelRouter_1 = __importDefault(require("./src/routers/PanelRouter"));
const TimeRouter_1 = __importDefault(require("./src/routers/TimeRouter"));
const EventLogRouter_1 = __importDefault(require("./src/routers/EventLogRouter"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/auth", userRouter_1.default);
app.use("/zones", zoneRouter_1.default);
app.use("/falcboards", FalcBoardRouter_1.default);
app.use("/detectors", DetectorRouter_1.default);
app.use("/nacboards", NacBoardRouter_1.default);
app.use("/naccircuits", NacCircuitRouter_1.default);
app.use("/panels", PanelRouter_1.default);
app.use("/times", TimeRouter_1.default);
app.use("/eventlogs", EventLogRouter_1.default);
(0, connect_1.default)()
    .then(() => {
    app.listen(port, (err) => {
        if (err) {
            throw new Error(err.message);
        }
        console.log(`Server is listening on http://localhost:${port}`);
    });
})
    .catch((error) => {
    console.log(error);
});
//# sourceMappingURL=index.js.map