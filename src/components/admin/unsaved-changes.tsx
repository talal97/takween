"use client";

import { useEffect, useId, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const pending = new Set<string>();
let requestConfirmation: (() => Promise<boolean>) | null = null;

export function clearUnsavedChanges() { pending.clear(); }

export async function confirmDiscardChanges(clear = true) {
  if (!pending.size) return true;
  if (!requestConfirmation || !await requestConfirmation()) return false;
  if (clear) pending.clear();
  return true;
}

export function useUnsavedChanges(value: unknown) {
  const id = useId();
  const serialized = JSON.stringify(value);
  const baseline = useRef(serialized);
  const [version, redraw] = useState(0);
  useEffect(() => {
    if (serialized !== baseline.current) pending.add(id);
    else pending.delete(id);
    return () => { pending.delete(id); };
  }, [id, serialized, version]);
  return (savedValue: unknown = value) => {
    baseline.current = JSON.stringify(savedValue);
    pending.delete(id);
    redraw((n) => n + 1);
  };
}

export function UnsavedChangesGuard() {
  const pathname = usePathname();
  const [prompt, setPrompt] = useState<{ resolve: (value: boolean) => void } | null>(null);
  useEffect(() => {
    requestConfirmation = () => new Promise<boolean>((resolve) => setPrompt({ resolve }));
    return () => { requestConfirmation = null; };
  }, []);
  const finish = (leave: boolean) => { prompt?.resolve(leave); setPrompt(null); };
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (pending.size) { event.preventDefault(); event.returnValue = ""; }
    };
    const click = (event: MouseEvent) => {
      const link = (event.target as Element)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.hasAttribute("download") || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const target = new URL(link.href);
      if (target.pathname === location.pathname && target.search === location.search && target.origin === location.origin) return;
      if (!pending.size) return;
      event.preventDefault(); event.stopPropagation();
      void confirmDiscardChanges().then((leave) => { if (leave) location.assign(link.href); });
    };
    // Navigation API also covers browser Back/Forward and programmatic navigation.
    const navigation = (window as unknown as { navigation?: EventTarget }).navigation;
    const navigate = (event: Event) => {
      const e = event as Event & { hashChange?: boolean; navigationType?: string; destination?: { url: string } };
      if (e.destination && e.navigationType !== "reload") {
        const target = new URL(e.destination.url);
        if (target.pathname === location.pathname && target.search === location.search && target.origin === location.origin) return;
      }
      if (!pending.size || e.hashChange || !event.cancelable || !e.destination || e.navigationType === "reload") return;
      event.preventDefault();
      const destination = e.destination.url;
      void confirmDiscardChanges().then((leave) => { if (leave) location.assign(destination); });
    };
    const previousUrl = location.href;
    const previousState = history.state;
    const popstate = (event: PopStateEvent) => {
      if (!pending.size) return;
      const destination = location.href;
      event.stopImmediatePropagation();
      history.pushState(previousState, "", previousUrl);
      void confirmDiscardChanges().then((leave) => { if (leave) location.assign(destination); });
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", click, true);
    if (navigation) navigation.addEventListener("navigate", navigate);
    else window.addEventListener("popstate", popstate, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", click, true);
      navigation?.removeEventListener("navigate", navigate);
      window.removeEventListener("popstate", popstate, true);
    };
  }, [pathname]);
  return <Dialog.Root open={!!prompt} onOpenChange={(open) => { if (!open) finish(false); }}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/60" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-[91] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
        <Dialog.Title className="text-xl font-semibold">Unsaved changes / تغييرات غير محفوظة</Dialog.Title>
        <Dialog.Description className="my-4">Leave without saving your changes? / هل تريد المغادرة دون حفظ التغييرات؟</Dialog.Description>
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={() => finish(false)}>Keep editing / متابعة التحرير</Button>
          <Button type="button" variant="outline" onClick={() => finish(true)}>Discard changes / تجاهل التغييرات</Button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
