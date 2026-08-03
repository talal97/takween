"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function Tracker() {
  const pathname = usePathname();
  const lastPath = useRef(pathname);

  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    sendPageview(pathname);
  }, [pathname]);

  useEffect(() => {
    sendPageview(pathname);
  }, [pathname]);

  return null;
}

function sendPageview(path: string) {
  try {
    const locale = path.startsWith("/ar") ? "ar" : "en";
    const body = JSON.stringify({ path, locale, referrer: document.referrer || null });
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
    const locale = path.startsWith("/ar") ? "ar" : "en";
    const body = JSON.stringify({ element, path, locale, metadata });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/click", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/analytics/click", { method: "POST", body, headers: { "Content-Type": "application/json" } });
    }
  } catch {
    // silent
  }
}
