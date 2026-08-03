"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  MapPin,
  FolderTree,
  Globe,
  Server,
  FileText,
  Star,
  Settings,
  Mail,
  Flag,
  Layers,
  HelpCircle,
  Building2,
  Award,
  Download,
  Users,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/super-categories", label: "Super Categories", icon: Layers },
  { href: "/admin/venues", label: "Venues", icon: MapPin },
  { href: "/admin/regions", label: "Regions", icon: Globe },
  { href: "/admin/certificates", label: "Certificates", icon: Server },
  { href: "/admin/countries", label: "Countries", icon: Flag },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/clients", label: "Clients", icon: Building2 },
  { href: "/admin/providers", label: "Providers", icon: Award },
  { href: "/admin/downloads", label: "Resources", icon: Download },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/submissions", label: "Registrations", icon: Mail },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings & SMTP", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r bg-white">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-lg font-bold text-brand">Takween</span>
        <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
          Admin
        </span>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {nav.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                active && "bg-brand text-white hover:bg-brand hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <Link href="/" target="_blank" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <Globe className="h-4 w-4" /> View Site
        </Link>
      </div>
    </aside>
  );
}