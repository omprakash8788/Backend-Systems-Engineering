import dotenv from "dotenv";
import app from "./app.js";
import { redis } from "./config/redis.js";
import { prisma } from "./config/database.js";
import { logger } from "./logger/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {

        await prisma.$connect();
        const pong = await redis.ping()
        console.log(pong)

        const server = app.listen(PORT, () => {
            logger.info(`Server running on ${PORT}`);
        });

        async function shutdown(signal: string) {

            logger.warn({ signal }, "API shutting down");

            server.close(() => {
                logger.info("HTTP server closed");
            });

            process.exit(0);
        }

        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));

    } catch (error) {

        console.error("Startup Failed", error);

        process.exit(1);
    }
}

startServer();
