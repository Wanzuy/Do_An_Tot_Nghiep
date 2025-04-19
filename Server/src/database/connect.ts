import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
    try {
        if (!process.env.DB_URL) {
            throw new Error(
                "Database URL (DB_URL) is not defined in environment variables"
            );
        }
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error(error);
    }
};
export default connectDB;
