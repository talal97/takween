"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { confirmDiscardChanges } from "./unsaved-changes";
import { signOut } from "next-auth/react";
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
  FolderOpen,
  LogOut,
  ExternalLink,
  DownloadCloud,
  Play,
  GalleryHorizontal,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/hero-slides", label: "Hero Slides", icon: GalleryHorizontal },
      { href: "/admin/interface-text", label: "Interface Text", icon: FileText },
      { href: "/admin/courses", label: "Courses", icon: BookOpen },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/super-categories", label: "Super Categories", icon: Layers },
      { href: "/admin/certificates", label: "Certificates", icon: Server },
      { href: "/admin/testimonials", label: "Testimonials", icon: Star },
      { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
      { href: "/admin/articles", label: "Articles", icon: FileText },
      { href: "/admin/videos", label: "Videos", icon: Play },
      { href: "/admin/media", label: "Media", icon: FolderOpen },
      { href: "/admin/downloads", label: "Resources", icon: Download },
    ],
  },
  {
    label: "Locations",
    items: [
      { href: "/admin/venues", label: "Venues", icon: MapPin },
      { href: "/admin/regions", label: "Regions", icon: Globe },
      { href: "/admin/countries", label: "Countries", icon: Flag },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/admin/clients", label: "Clients", icon: Building2 },
      { href: "/admin/providers", label: "Providers", icon: Award },
      { href: "/admin/submissions", label: "Registrations", icon: Mail },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/settings", label: "Settings & SMTP", icon: Settings },
      { href: "/admin/import", label: "Import from Live", icon: DownloadCloud },
    ],
  },
];

export function AdminSidebar({ isOwner = false }: { isOwner?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile drawer whenever the route changes (i.e. a nav link was tapped).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile top bar — fixed (not sticky) since it's a sibling of the flex-row layout in
          layout.tsx and must span the full viewport width rather than sit inside that row. */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-border/70 bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-navy text-xs font-bold text-white shadow-sm">
          T
        </span>
        <span className="text-sm font-bold tracking-tight text-navy">Takween Admin</span>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-50 flex h-screen w-72 max-w-[85vw] shrink-0 flex-col border-r border-border/70 bg-white transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:z-0 lg:w-64 lg:max-w-none lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-border/70 px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-navy text-sm font-bold text-white shadow-sm">
            T
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight text-navy">Takween</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Admin Panel</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="ms-auto flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {nav.map((section) => (
            <div key={section.label}>
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.filter((item) => item.href !== "/admin/users" || isOwner).map((item) => {
                  const active = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                        active && "bg-brand/10 font-medium text-brand hover:bg-brand/10 hover:text-brand"
                      )}
                    >
                      {active && (
                        <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-brand" />
                      )}
                      <Icon className={cn("h-4 w-4", active && "text-brand")} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-1 border-t border-border/70 p-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" /> View Site
          </Link>
          <button
            type="button"
            onClick={async () => { if (await confirmDiscardChanges()) void signOut({ callbackUrl: "/admin/login" }); }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
