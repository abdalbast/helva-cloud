import { NextResponse } from "next/server";
import { z } from "zod";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";

const EventSchema = z.object({
  ts: z.string(),
  provider: z.string(),
  model: z.string(),
  input_tokens: z.number().int().nonnegative(),
  output_tokens: z.number().int().nonnegative(),
  total_tokens: z.number().int().nonnegative(),
  cost_total: z.number().nullable(),
  session_id: z.string(),
  message_id: z.string(),
  latency_ms: z.number().int().nullable(),
});

const BodySchema = z.object({
  events: z.array(EventSchema).min(1).max(2000),
});

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!process.env.HELVA_COLLECTOR_TOKEN) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
  if (!token || token !== process.env.HELVA_COLLECTOR_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const rows = parsed.data.events;

  // Insert with upsert to avoid duplicates.
  // (Simple loop; payloads are small and this keeps type-checking painless.)
  const sql = getSql();

  for (const r of rows) {
    await sql`
      insert into usage_events (
        ts, provider, model, input_tokens, output_tokens, total_tokens,
        cost_total, session_id, message_id, latency_ms
      ) values (
        ${r.ts}::timestamptz,
        ${r.provider},
        ${r.model},
        ${r.input_tokens},
        ${r.output_tokens},
        ${r.total_tokens},
        ${r.cost_total},
        ${r.session_id},
        ${r.message_id},
        ${r.latency_ms}
      )
      on conflict (session_id, message_id) do update set
        ts = excluded.ts,
        provider = excluded.provider,
        model = excluded.model,
        input_tokens = excluded.input_tokens,
        output_tokens = excluded.output_tokens,
        total_tokens = excluded.total_tokens,
        cost_total = excluded.cost_total,
        latency_ms = excluded.latency_ms;
    `;
  }

  return NextResponse.json({ ok: true, inserted: rows.length });
}
