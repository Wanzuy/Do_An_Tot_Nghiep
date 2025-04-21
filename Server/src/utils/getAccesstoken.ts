import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Types } from "mongoose";

dotenv.config();

export const getAccesstoken = async (payload: {
    _id: Types.ObjectId;
    accountname: String;
    role: number;
}) => {
    const token = await jwt.sign(payload, process.env.SECRET_KEY as string, {
        expiresIn: "7d",
    });

    return token;
};
