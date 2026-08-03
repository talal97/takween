import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
};

const mockRequireOwner = vi.fn();
const mockRevalidatePath = vi.fn();

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/require-admin", () => ({
  requireOwner: (...args: any[]) => mockRequireOwner(...args),
}));
vi.mock("next/cache", () => ({
  revalidatePath: (...args: any[]) => mockRevalidatePath(...args),
}));

function ownerSession(id = "owner-1", role = "owner") {
  return { user: { id, role } };
}

describe("createUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("creates a new user with hashed password", async () => {
    mockRequireOwner.mockResolvedValue(ownerSession());
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({});

    const { createUser } = await import(
      "@/app/admin/(protected)/actions-users"
    );

    await createUser({
      name: "New Admin",
      email: "new@example.com",
      password: "securepass123",
      role: "admin",
    });

    expect(mockPrisma.user.create).toHaveBeenCalledOnce();
    const call = mockPrisma.user.create.mock.calls[0][0];
    expect(call.data.name).toBe("New Admin");
    expect(call.data.email).toBe("new@example.com");
    expect(call.data.role).toBe("admin");
    expect(call.data.passwordHash).not.toBe("securepass123"); // should be hashed
  });

  it("throws if email already exists", async () => {
    mockRequireOwner.mockResolvedValue(ownerSession());
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "existing",
      email: "taken@example.com",
    });

    const { createUser } = await import(
      "@/app/admin/(protected)/actions-users"
    );

    await expect(
      createUser({
        name: "Test",
        email: "taken@example.com",
        password: "password123",
        role: "admin",
      }),
    ).rejects.toThrow("A user with this email already exists.");
  });
});

describe("updateUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("prevents demoting the last owner", async () => {
    mockRequireOwner.mockResolvedValue(ownerSession("owner-1", "owner"));
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "owner-1",
      role: "owner",
    });
    mockPrisma.user.count.mockResolvedValue(1);

    const { updateUser } = await import(
      "@/app/admin/(protected)/actions-users"
    );

    await expect(
      updateUser("owner-1", { name: "Owner", email: "o@e.com", role: "admin" }),
    ).rejects.toThrow("Cannot demote the last owner.");
  });

  it("prevents self-demotion", async () => {
    mockRequireOwner.mockResolvedValue(ownerSession("owner-1", "owner"));
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "owner-1",
      role: "owner",
    });
    mockPrisma.user.count.mockResolvedValue(2); // not last owner

    const { updateUser } = await import(
      "@/app/admin/(protected)/actions-users"
    );

    await expect(
      updateUser("owner-1", { name: "Owner", email: "o@e.com", role: "admin" }),
    ).rejects.toThrow("You cannot change your own role.");
  });

  it("allows owner to update another user", async () => {
    mockRequireOwner.mockResolvedValue(ownerSession("owner-1", "owner"));
    mockPrisma.user.update.mockResolvedValue({});

    const { updateUser } = await import(
      "@/app/admin/(protected)/actions-users"
    );

    await updateUser("user-2", {
      name: "Updated",
      email: "u@e.com",
      role: "admin",
    });

    expect(mockPrisma.user.update).toHaveBeenCalledOnce();
  });
});

describe("deleteUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("prevents self-deletion", async () => {
    mockRequireOwner.mockResolvedValue(ownerSession("owner-1", "owner"));

    const { deleteUser } = await import(
      "@/app/admin/(protected)/actions-users"
    );

    await expect(deleteUser("owner-1")).rejects.toThrow(
      "You cannot delete your own account.",
    );
  });

  it("prevents deleting the last owner", async () => {
    mockRequireOwner.mockResolvedValue(ownerSession("owner-1", "owner"));
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user-2",
      role: "owner",
    });
    mockPrisma.user.count.mockResolvedValue(1);

    const { deleteUser } = await import(
      "@/app/admin/(protected)/actions-users"
    );

    await expect(deleteUser("user-2")).rejects.toThrow(
      "Cannot delete the last owner.",
    );
  });

  it("throws when user not found", async () => {
    mockRequireOwner.mockResolvedValue(ownerSession("owner-1", "owner"));
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const { deleteUser } = await import(
      "@/app/admin/(protected)/actions-users"
    );

    await expect(deleteUser("nonexistent")).rejects.toThrow("User not found.");
  });

  it("deletes a non-owner user successfully", async () => {
    mockRequireOwner.mockResolvedValue(ownerSession("owner-1", "owner"));
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user-2",
      role: "admin",
    });
    mockPrisma.user.delete.mockResolvedValue({});

    const { deleteUser } = await import(
      "@/app/admin/(protected)/actions-users"
    );

    await deleteUser("user-2");
    expect(mockPrisma.user.delete).toHaveBeenCalledWith({
      where: { id: "user-2" },
    });
  });
});

describe("changePassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("allows user to change their own password", async () => {
    mockRequireOwner.mockResolvedValue(ownerSession("owner-1", "owner"));
    mockPrisma.user.update.mockResolvedValue({});

    const { changePassword } = await import(
      "@/app/admin/(protected)/actions-users"
    );

    await changePassword("owner-1", { password: "newpass123" });
    expect(mockPrisma.user.update).toHaveBeenCalledOnce();
  });

  it("allows owner to change any user's password", async () => {
    mockRequireOwner.mockResolvedValue(ownerSession("owner-1", "owner"));
    mockPrisma.user.update.mockResolvedValue({});

    const { changePassword } = await import(
      "@/app/admin/(protected)/actions-users"
    );

    await changePassword("user-2", { password: "newpass123" });
    expect(mockPrisma.user.update).toHaveBeenCalledOnce();
  });

  it("throws for non-owner trying to change another user's password", async () => {
    mockRequireOwner.mockResolvedValue({
      user: { id: "admin-1", role: "admin" },
    });

    const { changePassword } = await import(
      "@/app/admin/(protected)/actions-users"
    );

    await expect(
      changePassword("other-user", { password: "newpass123" }),
    ).rejects.toThrow("You can only change your own password.");
  });
});
