"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function UsageCharts({
  daily,
}: {
  daily: { day: string; tokens: number; cost: number }[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <div className="mb-2 text-sm font-medium">Tokens / day</div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={daily} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" hide />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="tokens" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-medium">Cost / day (£)</div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={daily} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" hide />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="cost" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
