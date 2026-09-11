// import { flowProducer } from "../queues/flow.queue.js";



// export class FlowService {

//     static async process(file: string) {

//         await flowProducer.add({

//             name: "publish-image",

//             queueName: "aggregation-queue",

//             data: {

//                 file,

//             },

//             children: [

//                 {

//                     name: "thumbnail",

//                     queueName: "thumbnail-queue",

//                     data: { file },

//                 },

//                 {

//                     name: "compression",

//                     queueName: "compression-queue",

//                     data: { file },

//                 },

//                 {

//                     name: "metadata",

//                     queueName: "metadata-queue",

//                     data: { file },

//                 },

//                 // {

//                 //     name: "ai-tagging",

//                 //     queueName: "ai-queue",

//                 //     data: { file },

//                 // },

//                       {

//                     name: "ai-processing",

//                     queueName: "ai-queue",

//                     data: { file },
//                     children:[
//                          {
//                             name: "generate-caption",
//                             queueName: "ai-queue",
//                             data: { file },
//                         },
//                            {
//                             name: "detect-objects",
//                             queueName: "ai-queue",
//                             data: { file },
//                         },

//                         {
//                             name: "generate-embeddings",
//                             queueName: "ai-queue",
//                             data: { file },
//                         }
//                     ]

//                 },

//             ],

//         });

//     }

// }


import { flowProducer } from "../queues/flow.queue.js";

type FlowOptions = {
    enableAI?: boolean;
    enableCaption?: boolean;
    enableObjects?: boolean;
    enableEmbeddings?: boolean;
};

export class FlowService {

    static async process(
        file: string,
        options: FlowOptions = {}
    ) {

        const {
            enableAI = false,
            enableCaption = false,
            enableObjects = false,
            enableEmbeddings = false,
        } = options;

        const children: any[] = [];

        // --------------------------------
        // Basic image processing
        // --------------------------------

        children.push({

            name: "thumbnail",

            queueName: "thumbnail-queue",

            data: {
                file,
            },

        });

        children.push({

            name: "compression",

            queueName: "compression-queue",

            data: {
                file,
            },

        });

        children.push({

            name: "metadata",

            queueName: "metadata-queue",

            data: {
                file,
            },

        });

        // --------------------------------
        // Dynamic AI processing
        // --------------------------------

        if (enableAI) {

            const aiChildren: any[] = [];

            if (enableCaption) {

                aiChildren.push({

                    name: "generate-caption",

                    queueName: "ai-queue",

                    data: {
                        file,
                    },

                });

            }

            if (enableObjects) {

                aiChildren.push({

                    name: "detect-objects",

                    queueName: "ai-queue",

                    data: {
                        file,
                    },

                });

            }

            if (enableEmbeddings) {

                aiChildren.push({

                    name: "generate-embeddings",

                    queueName: "ai-queue",

                    data: {
                        file,
                    },

                });

            }

            // Only create AI parent
            // if there is AI work.

            if (aiChildren.length > 0) {

                children.push({

                    name: "ai-processing",

                    queueName: "ai-queue",

                    data: {
                        file,
                    },

                    children: aiChildren,

                });

            }

        }

        // --------------------------------
        // Create complete flow
        // --------------------------------

        const flow = await flowProducer.add({

            name: "publish-image",

            queueName: "aggregation-queue",

            data: {
                file,
            },

            children,

        });

        return flow;
    }

}