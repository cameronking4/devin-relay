import { validateApiKey } from "@/server/relay/devin-adapter";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
    apiKey: z.string().min(1),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { apiKey } = bodySchema.parse(body);
        const valid = await validateApiKey(apiKey);
        return NextResponse.json({ valid });
    } catch (e) {
        if (e instanceof z.ZodError) {
            return NextResponse.json(
                { valid: false, error: "apiKey is required" },
                { status: 400 },
            );
        }
        return NextResponse.json(
            { valid: false, error: "Validation request failed" },
            { status: 500 },
        );
    }
}
