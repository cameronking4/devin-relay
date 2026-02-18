import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { env } from "@/env";

const connection = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
});

export const executionQueueName = "relay-execution";

export const executionQueue = new Queue(executionQueueName, {
    connection,
    defaultJobOptions: {
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 500 },
        attempts: 2,
        backoff: { type: "exponential", delay: 5000 },
    },
});

export function createExecutionWorker(
    processor: (job: { id: string; data: { eventId: string; retryCount?: number } }) => Promise<void>,
) {
    return new Worker(
        executionQueueName,
        async (job) => {
            await processor(job as { id: string; data: { eventId: string; retryCount?: number } });
        },
        {
            connection,
            concurrency: 3,
            limiter: {
                max: 10,
                duration: 60_000,
            },
        },
    );
}

export type ExecutionJobData = { eventId: string; retryCount?: number };
