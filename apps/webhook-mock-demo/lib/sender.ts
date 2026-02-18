import { randomUUID } from "crypto";
import { generatePayload } from "./payloads";

export async function sendWebhook(
  webhookUrl: string,
  service: string,
  eventType: string,
): Promise<{ ok: boolean; status: number; statusText: string; body: unknown }> {
  const { payload, headers } = generatePayload(service, eventType);

  const deliveryId = randomUUID();

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Relay-Delivery-Id": deliveryId,
        ...headers,
      },
      body: JSON.stringify(payload),
    });

    let body: unknown;
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      body = await response.json();
    } else {
      body = await response.text();
    }

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      body,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      statusText: error instanceof Error ? error.message : "Network error",
      body: null,
    };
  }
}
