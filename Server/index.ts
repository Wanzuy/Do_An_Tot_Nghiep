import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/database/connect";
import userRouter from "./src/routers/userRouter";
import zoneRouter from "./src/routers/zoneRouter";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use("/auth", userRouter);
app.use("/zones", zoneRouter);

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
