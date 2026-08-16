export interface QueueEventRecord {
    jobId: string;
    type: string;
    timestamp: string;
}

export const queueEventHistory: QueueEventRecord[] = [];