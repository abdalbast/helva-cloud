import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "node:crypto";

export const runtime = "nodejs";

const EventSchema = z.object({
  ts: z.string().max(64),
  provider: z.string().max(128),
  model: z.string().max(256),
  input_tokens: z.number().int().nonnegative(),
  output_tokens: z.number().int().nonnegative(),
  total_tokens: z.number().int().nonnegative(),
  cost_total: z.number().nullable(),
  session_id: z.string().max(128),
  message_id: z.string().max(128),
  latency_ms: z.number().int().nullable(),
});

const BodySchema = z.object({
  events: z.array(EventSchema).min(1).max(2000),
});

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const expected = process.env.HELVA_COLLECTOR_TOKEN || "";
  if (!expected) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  // Constant-time compare (avoid token oracle timing).
  const tokenOk =
    token.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));

  if (!tokenOk) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Usage events are no longer stored — acknowledge only.
  return NextResponse.json({ ok: true, acknowledged: parsed.data.events.length });
}
