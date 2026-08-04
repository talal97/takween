"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function Tracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    sendPageview(pathname);
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = (e.target as Element | null)?.closest?.("[data-track]");
      if (!el) return;
      const element = el.getAttribute("data-track");
      if (!element) return;
      trackClick(element);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}

function localeOf(path: string): "en" | "ar" {
  return path.startsWith("/ar") ? "ar" : "en";
}

function sendPageview(path: string) {
  try {
    const body = JSON.stringify({ path, locale: localeOf(path), referrer: document.referrer || null });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/pageview", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/analytics/pageview", { method: "POST", body, headers: { "Content-Type": "application/json" } });
    }
  } catch {
    // silent
  }
}

export function trackClick(element: string, metadata?: Record<string, string>) {
  try {
    const path = window.location.pathname;
    const body = JSON.stringify({ element, path, locale: localeOf(path), metadata });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/click", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/analytics/click", { method: "POST", body, headers: { "Content-Type": "application/json" } });
    }
  } catch {
    // silent
  }
}
