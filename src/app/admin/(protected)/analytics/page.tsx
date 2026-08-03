import { requireAdmin } from "@/lib/require-admin";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  getTrafficSummary,
  getTopPages,
  getDailyVisits,
  getLocaleBreakdown,
  getClickBreakdown,
  getTotalClicks,
} from "@/lib/analytics";
import { AnalyticsDashboard } from "./analytics-dashboard";

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
          <StatCard title="Today" value={summary.todayViews} />
          <StatCard title="Yesterday" value={summary.yesterdayViews} />
          <StatCard title="Last 7 Days" value={summary.weekViews} />
          <StatCard title="All Time" value={summary.totalViews} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Visits (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsDashboard daily={daily} />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Pages</CardTitle>
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
              <CardTitle className="text-lg">Click Events ({totalClicks} total)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Element</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clickData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-muted-foreground">No click data yet.</TableCell>
                    </TableRow>
                  )}
                  {clickData.map((c) => (
                    <TableRow key={c.element}>
                      <TableCell>{c.element}</TableCell>
                      <TableCell className="text-right">{c.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Visits by Locale</CardTitle>
          </CardHeader>
          <CardContent>
            {localeData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <div className="flex gap-8 items-center">
                {localeData.map((l) => (
                  <div key={l.locale} className="text-center">
                    <div className="text-2xl font-bold text-navy">{l.count}</div>
                    <div className="text-sm text-muted-foreground">{l.locale.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-2xl font-bold text-navy">{value.toLocaleString()}</div>
        <p className="text-sm text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  );
}
