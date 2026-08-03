"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUser, updateUser, deleteUser, changePassword } from "@/app/admin/(protected)/actions-users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UserInitial = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

export function UserForm({ initial }: { initial?: UserInitial }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    password: "",
    role: initial?.role ?? "admin",
  });
  const [error, setError] = useState("");

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (initial) {
        await updateUser(initial.id, { name: form.name, email: form.email, role: form.role as "admin" | "owner" });
      } else {
        await createUser({ name: form.name, email: form.email, password: form.password, role: form.role as "admin" | "owner" });
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>{initial ? "New Password (leave blank to keep)" : "Password"}</Label>
          <Input
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            required={!initial}
            minLength={8}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Role</Label>
          <select
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit">{initial ? "Update User" : "Add User"}</Button>
      </div>
    </form>
  );
}

export function DeleteUserButton({ id, disabled }: { id: string; disabled?: boolean }) {
  const router = useRouter();
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={disabled}
      onClick={async () => {
        await deleteUser(id);
        router.refresh();
      }}
    >
      <span className="text-destructive">Delete</span>
    </Button>
  );
}

export function ChangePasswordForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    try {
      await changePassword(userId, { password });
      setPassword("");
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-600">Password updated.</p>}
      <div className="flex gap-4 items-end">
        <div className="space-y-1.5 flex-1">
          <Label>New Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </div>
        <Button type="submit" variant="outline">Change Password</Button>
      </div>
    </form>
  );
}
