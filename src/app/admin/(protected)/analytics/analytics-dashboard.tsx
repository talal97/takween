"use client";

import { DailyVisitsChart } from "@/components/admin/analytics-charts";

export function AnalyticsDashboard({ daily }: { daily: Array<{ date: string; count: number }> }) {
  return <DailyVisitsChart data={daily} />;
}
