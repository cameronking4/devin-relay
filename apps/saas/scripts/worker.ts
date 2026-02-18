/**
 * Relay orchestration worker. Run with: pnpm worker
 * Connects to Redis/BullMQ and processes execution jobs (render prompt, call Devin, store result).
 * Deploy as a Background Worker on Render.
 */
import "dotenv/config";
import { processExecutionJob } from "../src/server/relay/processor";
import { createExecutionWorker } from "../src/server/relay/queue";

const worker = createExecutionWorker(async (job) => {
    const { eventId } = job.data;
    console.log(`[worker] Processing event ${eventId}`);
    await processExecutionJob(eventId);
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
