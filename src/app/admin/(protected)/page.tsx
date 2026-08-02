import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const [courses, schedules, categories, venues, registrations, newRegistrations, testimonials, articles] =
    await prisma.$transaction([
      prisma.course.count(),
      prisma.schedule.count(),
      prisma.category.count(),
      prisma.venue.count(),
      prisma.registration.count(),
      prisma.registration.count({ where: { status: "new" } }),
      prisma.testimonial.count(),
      prisma.article.count(),
    ]);

  const stats = [
    { label: "Courses", value: courses },
    { label: "Schedule Sessions", value: schedules },
    { label: "Categories", value: categories },
    { label: "Venues / Cities", value: venues },
    { label: "Registrations", value: registrations },
    { label: "New Registrations", value: newRegistrations },
    { label: "Testimonials", value: testimonials },
    { label: "Articles", value: articles },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {session.user.name || session.user.email}. Here is an overview of your content.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}