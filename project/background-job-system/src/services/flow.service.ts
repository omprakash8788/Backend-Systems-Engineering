import { flowProducer } from "../queues/flow.queue.js";

export class FlowService {

    static async process(file: string) {

        await flowProducer.add({

            name: "publish-image",

            queueName: "aggregation-queue",

            data: {

                file,

            },

            children: [

                {

                    name: "thumbnail",

                    queueName: "thumbnail-queue",

                    data: { file },

                },

                {

                    name: "compression",

                    queueName: "compression-queue",

                    data: { file },

                },

                {

                    name: "metadata",

                    queueName: "metadata-queue",

                    data: { file },

                },

                // {

                //     name: "ai-tagging",

                //     queueName: "ai-queue",

                //     data: { file },

                // },

                      {

                    name: "ai-processing",

                    queueName: "ai-queue",

                    data: { file },
                    children:[
                         {
                            name: "generate-caption",
                            queueName: "ai-queue",
                            data: { file },
                        },
                           {
                            name: "detect-objects",
                            queueName: "ai-queue",
                            data: { file },
                        },

                        {
                            name: "generate-embeddings",
                            queueName: "ai-queue",
                            data: { file },
                        }
                    ]

                },

            ],

        });

    }

}