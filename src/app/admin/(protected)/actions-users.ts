"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/require-admin";

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "owner"]),
});

const updateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "owner"]),
});

const changePasswordSchema = z.object({
  password: z.string().min(8),
});

export async function createUser(data: z.infer<typeof createUserSchema>) {
  await requireOwner();
  const parsed = createUserSchema.parse(data);

  const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
  if (existing) throw new Error("A user with this email already exists.");

  await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      passwordHash: await bcrypt.hash(parsed.password, 10),
      role: parsed.role,
    },
  });

  revalidatePath("/admin/users");
}

export async function updateUser(id: string, data: z.infer<typeof updateUserSchema>) {
  const session = await requireOwner();
  const parsed = updateUserSchema.parse(data);

  // Prevent demoting the last owner
  if (parsed.role !== "owner") {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user?.role === "owner") {
      const ownerCount = await prisma.user.count({ where: { role: "owner" } });
      if (ownerCount <= 1) throw new Error("Cannot demote the last owner.");
    }
  }

  // Prevent self-demotion
  if (session.user.id === id && parsed.role !== "owner") {
    throw new Error("You cannot change your own role.");
  }

  await prisma.user.update({
    where: { id },
    data: { name: parsed.name, email: parsed.email, role: parsed.role },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
}

export async function deleteUser(id: string) {
  const session = await requireOwner();

  if (session.user.id === id) throw new Error("You cannot delete your own account.");

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found.");

  if (user.role === "owner") {
    const ownerCount = await prisma.user.count({ where: { role: "owner" } });
    if (ownerCount <= 1) throw new Error("Cannot delete the last owner.");
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
}

export async function changePassword(id: string, data: z.infer<typeof changePasswordSchema>) {
  const session = await requireOwner();
  const parsed = changePasswordSchema.parse(data);

  // Allow users to change their own password, or owners to change anyone's
  if (session.user.id !== id && session.user.role !== "owner") {
    throw new Error("You can only change your own password.");
  }

  await prisma.user.update({
    where: { id },
    data: { passwordHash: await bcrypt.hash(parsed.password, 10) },
  });
}
