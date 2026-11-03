"use client";

import { useUnsavedChanges } from "./unsaved-changes";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSettings, testSmtp } from "@/app/admin/(protected)/actions-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SmtpForm({ initial, envManaged, envConfig }: { initial: Record<string, string>; envManaged?: boolean; envConfig?: { host: string; port: string; user: string; pass: string; from: string } }) {
  const router = useRouter();
  const [form, setForm] = useState({
    host: initial.smtp_host ?? "",
    port: initial.smtp_port ?? "587",
    user: initial.smtp_user ?? "",
    pass: initial.smtp_pass ?? "",
    from: initial.mail_from ?? "no-reply@takween.com",
  });
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<"ok" | "fail" | null>(null);
  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const markSaved = useUnsavedChanges(form);

  if (envManaged) {
    const cfg = envConfig || { host: "", port: "587", user: "", pass: "", from: "no-reply@takween.com" };
    return (
      <div className="space-y-3">
        <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
          SMTP is configured via environment variables and cannot be edited here.
          Set <code>SMTP_HOST</code>, <code>SMTP_PORT</code>, <code>SMTP_USER</code>, <code>SMTP_PASS</code>, and <code>MAIL_FROM</code> in your <code>.env</code> file.
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>SMTP Host</Label>
            <Input value={cfg.host} disabled />
          </div>
          <div>
            <Label>Port</Label>
            <Input value={cfg.port} disabled />
          </div>
          <div>
            <Label>Username</Label>
            <Input value={cfg.user} disabled />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value="********" disabled />
          </div>
          <div>
            <Label>From Address</Label>
            <Input value={cfg.from} disabled />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={testing}
            onClick={async () => {
              setTesting(true);
              setResult(null);
              try {
                await testSmtp(form);
                setResult("ok");
              } catch {
                setResult("fail");
              }
              setTesting(false);
            }}
          >
            {testing ? "Testing..." : "Send Test Email"}
          </Button>
          {result === "ok" && <span className="text-sm text-green-600">Test email sent successfully.</span>}
          {result === "fail" && <span className="text-sm text-destructive">SMTP test failed. Check environment variables.</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await saveSettings({}, form);
          markSaved();
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
          router.refresh();
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div>
          <Label>SMTP Host</Label>
          <Input value={form.host} onChange={(e) => set("host", e.target.value)} placeholder="smtp.hostinger.com" />
        </div>
        <div>
          <Label>Port</Label>
          <Input value={form.port} onChange={(e) => set("port", e.target.value)} />
        </div>
        <div>
          <Label>Username</Label>
          <Input value={form.user} onChange={(e) => set("user", e.target.value)} placeholder="your@email.com" />
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" value={form.pass} onChange={(e) => set("pass", e.target.value)} />
        </div>
        <div>
          <Label>From Address</Label>
          <Input value={form.from} onChange={(e) => set("from", e.target.value)} />
        </div>
        <div className="flex items-end">
          <Button type="submit">{saved ? "Saved ✓" : "Save SMTP Settings"}</Button>
        </div>
      </form>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={testing}
          onClick={async () => {
            setTesting(true);
            setResult(null);
            try {
              await saveSettings({}, form);
          markSaved();
              await testSmtp(form);
              setResult("ok");
            } catch {
              setResult("fail");
            }
            setTesting(false);
            router.refresh();
          }}
        >
          {testing ? "Testing..." : "Send Test Email"}
        </Button>
        {result === "ok" && <span className="text-sm text-green-600">Test email sent to {form.user || form.from}.</span>}
        {result === "fail" && <span className="text-sm text-destructive">SMTP test failed. Check settings and that the port is open.</span>}
      </div>
    </div>
  );
}