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
    processor: (
        job: { id: string; data: ExecutionJobData },
    ) => Promise<void>,
) {
    return new Worker(
        executionQueueName,
        async (job) => {
            await processor(job as { id: string; data: ExecutionJobData });
        },
        {
            connection,
            concurrency: 2,
        },
    );
}

export type ExecutionJobData =
    | {
          kind: "single";
          eventId: string;
          /** Incremented each time we retry after a 429; stops retrying after MAX_429_RETRIES */
          retryAfter429?: number;
      }
    | {
          kind: "batch";
          triggerId: string;
          windowStart: string;
          windowEnd: string;
      }
    | {
          kind: "workflow";
          workflowId: string;
          eventIds: string[];
          windowStart: string;
          windowEnd: string;
      };
