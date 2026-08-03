"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#1e3a5f", "#c9a84c", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function DailyVisitsChart({ data }: { data: Array<{ date: string; count: number }> }) {
  if (data.length === 0) return <p className="text-sm text-muted-foreground">No data yet.</p>;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 12 }} />
        <YAxis className="text-xs" tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#1e3a5f" strokeWidth={2} name="Visits" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ClickEventsChart({ data }: { data: Array<{ element: string; count: number }> }) {
  if (data.length === 0) return <p className="text-sm text-muted-foreground">No click data yet.</p>;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="element" className="text-xs" tick={{ fontSize: 12 }} />
        <YAxis className="text-xs" tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="count" fill="#1e3a5f" name="Clicks" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LocaleBreakdownChart({ data }: { data: Array<{ locale: string; count: number }> }) {
  if (data.length === 0) return <p className="text-sm text-muted-foreground">No data yet.</p>;
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="locale" cx="50%" cy="50%" outerRadius={80} label>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
