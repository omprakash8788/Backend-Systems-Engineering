import { FlowProducer } from "bullmq";
import { redis } from "../config/redis.js";

const flowProducer = new FlowProducer({
    connection: redis,
});

export class WorkflowService {

    static async createReportWorkflow(
        reportId: string,
        email: string,
        userId: string
    ) {

        return flowProducer.add({
            name: "create-report",

            queueName: "workflow-queue",

            data: {
                reportId,
            },

            children: [

                {
                    name: "generate-pdf",

                    queueName: "pdf-queue",

                    data: {
                        reportId,
                    },
                },

                {
                    name: "send-email",

                    queueName: "email-queue",

                    data: {
                        email,
                    },
                },

                {
                    name: "notify",

                    queueName: "notification-queue",

                    data: {
                        userId,
                        type: "REPORT_READY",
                    },
                },
            ],
        });

    }

}