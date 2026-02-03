import postgres, { type Sql } from "postgres";

const databaseUrl = process.env.DATABASE_URL;
let _sql: Sql | null = null;

export function getSql(): Sql {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }
  if (_sql) return _sql;

  _sql = postgres(databaseUrl, {
    ssl: databaseUrl.includes("sslmode=") ? undefined : "require",
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return _sql;
}

export type UsageEventInsert = {
  ts: string; // ISO
  provider: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_total: number | null;
  session_id: string;
  message_id: string;
  latency_ms: number | null;
};
