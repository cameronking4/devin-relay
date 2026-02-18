/**
 * Relay orchestration worker. Run with: pnpm worker
 * Connects to Redis/BullMQ and processes execution jobs (render prompt, call Devin, store result).
 * Deploy as a Background Worker on Render.
 */
import "dotenv/config";
import {
    processBatchExecutionJob,
    processExecutionJob,
    processWorkflowExecutionJob,
} from "../src/server/relay/processor";
import {
    type ExecutionJobData,
    createExecutionWorker,
} from "../src/server/relay/queue";

const worker = createExecutionWorker(async (job) => {
    const data = job.data as ExecutionJobData;
    if (data.kind === "batch") {
        console.log(
            `[worker] Processing batch for trigger ${data.triggerId} (${data.windowStart} – ${data.windowEnd})`,
        );
        await processBatchExecutionJob(data);
    } else if (data.kind === "single") {
        console.log(
            `[worker] Processing event ${data.eventId}${data.retryAfter429 ? ` (429 retry #${data.retryAfter429})` : ""}`,
        );
        await processExecutionJob(data);
    } else if (data.kind === "workflow") {
        console.log(
            `[worker] Processing workflow ${data.workflowId} (${data.eventIds.length} events)`,
        );
        await processWorkflowExecutionJob(data);
    } else {
        throw new Error("Unknown job data shape");
    }
});

worker.on("completed", (job) => {
    console.log(`[worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.error(`[worker] Job ${job?.id} failed:`, err?.message);
});

worker.on("error", (err) => {
    console.error("[worker] Worker error:", err);
});

console.log("[worker] Relay worker started, waiting for jobs...");
