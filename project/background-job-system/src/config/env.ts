import dotenv from "dotenv";

dotenv.config();

export const env = {
    PORT: Number(process.env.PORT) || 5000,
    NODE_ENV: process.env.NODE_ENV || "development",
    DATABASE_URL: process.env.DATABASE_URL!,
    REDIS_HOST:process.env.REDIS_HOST || "localhost",
    REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,


};

