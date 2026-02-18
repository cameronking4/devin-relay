import { NextResponse } from "next/server";
import { sendWebhook } from "../../../lib/sender";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { webhookUrl, service, eventType } = body;

    if (!webhookUrl || !service || !eventType) {
      return NextResponse.json(
        { error: "Missing required fields: webhookUrl, service, eventType" },
        { status: 400 },
      );
    }

    // Validate URL
    try {
      new URL(webhookUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid webhook URL" },
        { status: 400 },
      );
    }

    const result = await sendWebhook(webhookUrl, service, eventType);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        status: 500,
        statusText: error instanceof Error ? error.message : "Unknown error",
        body: null,
      },
      { status: 500 },
    );
  }
}
