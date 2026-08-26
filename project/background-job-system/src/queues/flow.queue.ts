import {FlowProducer} from 'bullmq';

import { redis } from "../config/redis.js";

export const flowProducer =
    new FlowProducer({

        connection: redis,

    });

    