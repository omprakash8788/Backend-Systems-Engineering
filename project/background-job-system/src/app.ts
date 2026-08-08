import express from "express";
import healthRoutes from './routes/health.routes.js';
import pinoHttp from "pino-http";
import { logger } from "./logger/index.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import emailRoutes from "./routes/email.routes.js";

const app = express();

app.use(express.json());

app.use(pinoHttp({logger}))

app.use("/health", healthRoutes)

app.use(emailRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});


app.use(errorMiddleware);

export default app; 