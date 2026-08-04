"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const NAVY = "#0e2a45";
const BRAND = "#026481";
const BRAND_LIGHT = "#e6f0f4";
const COLORS = ["#026481", "#f5a623", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444", "#ec4899"];

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number | string; color?: string }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      {label !== undefined && (
        <p className="mb-1 font-semibold text-navy">{label}</p>
      )}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2 text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export function DailyVisitsChart({ data }: { data: Array<{ date: string; count: number }> }) {
  if (data.length === 0) return <p className="py-12 text-center text-sm text-muted-foreground">No data yet.</p>;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="visitFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND} stopOpacity={0.25} />
            <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} />
        <Line
          type="monotone"
          dataKey="count"
          name="Visits"
          stroke={BRAND}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
          fill="url(#visitFill)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ClickEventsChart({ data }: { data: Array<{ element: string; count: number }> }) {
  if (data.length === 0) return <p className="py-12 text-center text-sm text-muted-foreground">No click data yet.</p>;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="element" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: BRAND_LIGHT }} />
        <Bar dataKey="count" name="Clicks" fill={NAVY} radius={[6, 6, 0, 0]} maxBarSize={42} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LocaleBreakdownChart({ data }: { data: Array<{ locale: string; count: number }> }) {
  if (data.length === 0) return <p className="py-12 text-center text-sm text-muted-foreground">No data yet.</p>;
  const total = data.reduce((sum, d) => sum + d.count, 0);
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="locale"
            cx="50%"
            cy="50%"
            innerRadius={56}
            outerRadius={90}
            paddingAngle={3}
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="w-full space-y-2.5">
        {data.map((l, i) => (
          <div key={l.locale} className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="w-8 text-sm font-medium uppercase text-foreground">{l.locale}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{ width: `${total ? Math.round((l.count / total) * 100) : 0}%`, background: COLORS[i % COLORS.length] }}
              />
            </div>
            <span className="text-sm font-semibold text-navy">{l.count.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
