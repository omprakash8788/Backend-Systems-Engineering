import dotenv from "dotenv";
import app from "./app.js";
import { redis } from "./config/redis.js";
import { prisma } from "./config/database.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {

        await prisma.$connect();
        const pong = await redis.ping()
        console.log(pong)

        app.listen(PORT, () => {
            console.log(`Server running on ${PORT}`);
        });

    } catch (error) {

        console.error("Startup Failed", error);

        process.exit(1);
    }
}

startServer();
