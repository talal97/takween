import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { clearStaleSessionCookie } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  FolderTree,
  MapPin,
  Mail,
  Star,
  FileText,
  Users,
  ArrowUpRight,
  Plus,
  ListFilter,
  Settings2,
  PenLine,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function AdminDashboardPage() {
  let session = null;
  try {
    session = await auth();
  } catch {
    await clearStaleSessionCookie();
    redirect("/admin/login");
  }
  if (!session?.user) redirect("/admin/login");

  const [courses, schedules, categories, venues, registrations, newRegistrations, testimonials, articles, users, recentRegistrations] =
    await prisma.$transaction([
      prisma.course.count(),
      prisma.schedule.count(),
      prisma.category.count(),
      prisma.venue.count(),
      prisma.registration.count(),
      prisma.registration.count({ where: { status: "new" } }),
      prisma.testimonial.count(),
      prisma.article.count(),
      prisma.user.count(),
      prisma.registration.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          fullName: true,
          email: true,
          courseTitle: true,
          status: true,
          locale: true,
          createdAt: true,
        },
      }),
    ]);

  const stats = [
    { label: "Courses", value: courses, icon: BookOpen, accent: "bg-brand/10 text-brand" },
    { label: "Schedule Sessions", value: schedules, icon: CalendarDays, accent: "bg-indigo-500/10 text-indigo-600" },
    { label: "Registrations", value: registrations, icon: Mail, accent: "bg-emerald-500/10 text-emerald-600", badge: newRegistrations > 0 ? `${newRegistrations} new` : undefined },
    { label: "Categories", value: categories, icon: FolderTree, accent: "bg-amber-500/10 text-amber-600" },
    { label: "Venues / Cities", value: venues, icon: MapPin, accent: "bg-rose-500/10 text-rose-600" },
    { label: "Testimonials", value: testimonials, icon: Star, accent: "bg-violet-500/10 text-violet-600" },
    { label: "Articles", value: articles, icon: FileText, accent: "bg-sky-500/10 text-sky-600" },
    { label: "Users", value: users, icon: Users, accent: "bg-slate-500/10 text-slate-600" },
  ];

  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const quickActions = [
    { label: "Add a course", href: "/admin/courses/new", icon: Plus },
    { label: "Review registrations", href: "/admin/submissions", icon: ListFilter },
    { label: "Write an article", href: "/admin/articles", icon: PenLine },
    { label: "Open settings", href: "/admin/settings", icon: Settings2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand">{dateLabel}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-navy">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {session.user.name || session.user.email}. Here is what is happening across your site.
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-dark"
        >
          <Plus className="h-4 w-4" /> New Course
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", s.accent)}>
                    <Icon className="h-5 w-5" />
                  </span>
                  {s.badge && (
                    <Badge className="bg-gold text-white">{s.badge}</Badge>
                  )}
                </div>
                <div className="mt-4 text-3xl font-bold tracking-tight text-navy">
                  {s.value.toLocaleString()}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent Registrations</CardTitle>
            <Link
              href="/admin/submissions"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-dark"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentRegistrations.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No registrations yet. They will appear here as visitors sign up.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRegistrations.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{r.fullName}</div>
                        <div className="text-xs text-muted-foreground">{r.email}</div>
                      </TableCell>
                      <TableCell className="max-w-[16rem] truncate text-sm">{r.courseTitle}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={r.status === "new" ? "default" : "secondary"}>
                          {r.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {quickActions.map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Icon className="h-4 w-4" />
                  </span>
                  {a.label}
                  <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground/50" />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
