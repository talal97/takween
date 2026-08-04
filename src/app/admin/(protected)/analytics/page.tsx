import { requireAdmin } from "@/lib/require-admin";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ComponentType } from "react";
import { Eye, MousePointerClick, TrendingUp, Globe } from "lucide-react";
import {
  getTrafficSummary,
  getTopPages,
  getDailyVisits,
  getLocaleBreakdown,
  getClickBreakdown,
  getTotalClicks,
} from "@/lib/analytics";
import { AnalyticsDashboard } from "./analytics-dashboard";
import { ClickEventsChart, LocaleBreakdownChart } from "@/components/admin/analytics-charts";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  await requireAdmin();

  const [summary, topPages, daily, localeData, clickData, totalClicks] = await Promise.all([
    getTrafficSummary(),
    getTopPages(),
    getDailyVisits(),
    getLocaleBreakdown(),
    getClickBreakdown(),
    getTotalClicks(),
  ]);

  return (
    <div>
      <PageHeader title="Analytics" description="Site traffic and user behavior" />
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Eye} accent="bg-brand/10 text-brand" title="Today" value={summary.todayViews} />
          <StatCard icon={TrendingUp} accent="bg-sky-500/10 text-sky-600" title="Yesterday" value={summary.yesterdayViews} />
          <StatCard icon={Globe} accent="bg-violet-500/10 text-violet-600" title="Last 7 Days" value={summary.weekViews} />
          <StatCard icon={MousePointerClick} accent="bg-gold/15 text-gold" title="All Time" value={summary.totalViews} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily Visits (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsDashboard daily={daily} />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPages.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-muted-foreground">No data yet.</TableCell>
                    </TableRow>
                  )}
                  {topPages.map((p) => (
                    <TableRow key={p.path}>
                      <TableCell className="font-mono text-sm">{p.path}</TableCell>
                      <TableCell className="text-right">{p.views}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Click Events ({totalClicks} total)</CardTitle>
            </CardHeader>
            <CardContent>
              <ClickEventsChart data={clickData} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Visits by Locale</CardTitle>
          </CardHeader>
          <CardContent>
            <LocaleBreakdownChart data={localeData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  accent,
}: {
  title: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="text-2xl font-bold tracking-tight text-navy">{value.toLocaleString()}</div>
          <p className="truncate text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}
