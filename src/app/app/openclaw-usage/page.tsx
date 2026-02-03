import { getSql } from "@/lib/db";
import { UsageCharts } from "./usage-charts";

export const runtime = "nodejs";

type DailyRow = {
  day: string;
  tokens: number;
  cost: number;
};

type ModelRow = {
  model: string;
  provider: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_total: number;
};

export const dynamic = "force-dynamic";

export default async function OpenClawUsagePage() {
  if (!process.env.DATABASE_URL) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <h1 className="text-2xl font-semibold">OpenClaw usage</h1>
          <p className="mt-2 text-sm text-foreground/70">
            Database isn’t configured yet. Set <code className="rounded border px-1">DATABASE_URL</code> on Vercel (and locally if you want to run it here),
            then run the schema in <code className="rounded border px-1">sql/schema.sql</code>.
          </p>
        </div>
      </main>
    );
  }

  const sql = getSql();

  // Last 30 days daily aggregates
  const daily = (await sql<DailyRow[]>`
    select
      to_char(date_trunc('day', ts), 'YYYY-MM-DD') as day,
      sum(total_tokens)::int as tokens,
      coalesce(sum(cost_total), 0)::float as cost
    from usage_events
    where ts >= now() - interval '30 days'
    group by 1
    order by 1 asc;
  `);

  // Last 30 days per-model aggregates
  const byModel = (await sql<ModelRow[]>`
    select
      model,
      provider,
      sum(input_tokens)::int as input_tokens,
      sum(output_tokens)::int as output_tokens,
      sum(total_tokens)::int as total_tokens,
      coalesce(sum(cost_total), 0)::float as cost_total
    from usage_events
    where ts >= now() - interval '30 days'
    group by model, provider
    order by cost_total desc, total_tokens desc;
  `);

  const today = await sql<{ tokens: number; cost: number }[]>`
    select
      coalesce(sum(total_tokens), 0)::int as tokens,
      coalesce(sum(cost_total), 0)::float as cost
    from usage_events
    where ts >= date_trunc('day', now());
  `;

  const t = today[0] ?? { tokens: 0, cost: 0 };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold">OpenClaw usage</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Last 30 days • auto-updated by your local collector
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Today tokens</div>
            <div className="mt-1 text-2xl font-semibold">{t.tokens.toLocaleString()}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Today cost</div>
            <div className="mt-1 text-2xl font-semibold">£{t.cost.toFixed(2)}</div>
          </div>
        </div>

        <div className="mt-8 rounded-lg border p-4">
          <UsageCharts daily={daily} />
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold">By model (30 days)</h2>
          <div className="mt-3 overflow-x-auto rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-foreground/5 text-left">
                <tr>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Input</th>
                  <th className="px-4 py-3">Output</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Cost</th>
                </tr>
              </thead>
              <tbody>
                {byModel.map((r) => (
                  <tr key={`${r.provider}:${r.model}`} className="border-t">
                    <td className="px-4 py-3 font-medium">{r.model}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.provider}</td>
                    <td className="px-4 py-3">{r.input_tokens.toLocaleString()}</td>
                    <td className="px-4 py-3">{r.output_tokens.toLocaleString()}</td>
                    <td className="px-4 py-3">{r.total_tokens.toLocaleString()}</td>
                    <td className="px-4 py-3">£{Number(r.cost_total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
