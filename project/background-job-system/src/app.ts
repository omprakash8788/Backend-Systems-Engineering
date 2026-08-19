import express from "express";
import healthRoutes from './routes/health.routes.js';
import pinoHttp from "pino-http";
import { logger } from "./logger/index.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import emailRoutes from "./routes/email.routes.js";
import jobsRoutes from "./routes/jobs.routes.js"
import eventsRoutes from "./routes/events.routes.js";
import pdfRoutes from "./routes/pdf.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import workflowRoutes from "./routes/workflow.routes.js";
import bulkRoutes from "./routes/bulk.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import pipelineRoutes from "./routes/pipeline.routes.js";
import queueRoutes from "./routes/queue.routes.js";

import demoRoutes from "./routes/demo.routes.js";
import uploadRoutes from "./routes/upload.routes.js";



const app = express();

app.use(express.json());

app.use(pinoHttp({ logger }))

app.use("/health", healthRoutes)


app.use("/api/v1", uploadRoutes);
app.use("/api/v1" ,emailRoutes);
app.use("/api/v1", pdfRoutes);
app.use("/api/v1", notificationRoutes);
app.use("/api/v1", demoRoutes);
app.use("/api/v1", workflowRoutes);
app.use("/api/v1", bulkRoutes);
app.use("/api/v1", adminRoutes);
app.use("/api/v1",pipelineRoutes);
app.use("/api/v1",queueRoutes);
app.use("/api/v1/jobs", jobsRoutes);
app.use("/api/v1/events",eventsRoutes);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});


app.use(errorMiddleware);

export default app; 