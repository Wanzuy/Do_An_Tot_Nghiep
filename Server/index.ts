import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/database/connect";
import userRouter from "./src/routers/userRouter";
import zoneRouter from "./src/routers/zoneRouter";
import falcBoardRouter from "./src/routers/FalcBoardRouter";
import detectorRouter from "./src/routers/DetectorRouter";
import nacBoardRouter from "./src/routers/NacBoardRouter";
import nacCircuitRouter from "./src/routers/NacCircuitRouter";
import panelRouter from "./src/routers/PanelRouter";
import timeRouter from "./src/routers/TimeRouter";
import EventLogRouter from "./src/routers/EventLogRouter";
import chatbotRouter from "./src/routers/ChatbotRouter";
import volumeRouter from "./src/routers/VolumeRouter";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use("/auth", userRouter);
app.use("/zones", zoneRouter);
app.use("/falcboards", falcBoardRouter);
app.use("/detectors", detectorRouter);
app.use("/nacboards", nacBoardRouter);
app.use("/naccircuits", nacCircuitRouter);
app.use("/panels", panelRouter);
app.use("/times", timeRouter);
app.use("/volumes", volumeRouter);
app.use("/eventlogs", EventLogRouter);
app.use("/api/chatbot", chatbotRouter);

connectDB()
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
