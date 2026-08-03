import { describe, it, expect, vi, beforeEach } from "vitest";

// Test the pure logic of analytics query functions by mocking prisma

const mockPrisma = {
  pageView: {
    count: vi.fn(),
  },
  clickEvent: {
    count: vi.fn(),
  },
  $queryRaw: vi.fn(),
};

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

describe("analytics query functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe("getTotalPageViews", () => {
    it("counts page views within date range", async () => {
      mockPrisma.pageView.count.mockResolvedValue(42);

      const { getTotalPageViews } = await import("@/lib/analytics");

      const from = new Date("2025-01-01");
      const to = new Date("2025-01-31");
      const result = await getTotalPageViews({ from, to });

      expect(result).toBe(42);
      expect(mockPrisma.pageView.count).toHaveBeenCalledWith({
        where: { createdAt: { gte: from, lte: to } },
      });
    });

    it("uses default range when none provided", async () => {
      mockPrisma.pageView.count.mockResolvedValue(10);

      const { getTotalPageViews } = await import("@/lib/analytics");

      const result = await getTotalPageViews();
      expect(result).toBe(10);
      expect(mockPrisma.pageView.count).toHaveBeenCalledOnce();
    });
  });

  describe("getTotalClicks", () => {
    it("counts clicks within date range", async () => {
      mockPrisma.clickEvent.count.mockResolvedValue(15);

      const { getTotalClicks } = await import("@/lib/analytics");

      const from = new Date("2025-01-01");
      const to = new Date("2025-01-31");
      const result = await getTotalClicks({ from, to });

      expect(result).toBe(15);
    });
  });

  describe("getUniquePages", () => {
    it("returns count of distinct pages", async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { path: "/page1" },
        { path: "/page2" },
        { path: "/page3" },
      ]);

      const { getUniquePages } = await import("@/lib/analytics");

      const from = new Date("2025-01-01");
      const to = new Date("2025-01-31");
      const result = await getUniquePages({ from, to });

      expect(result).toBe(3);
    });
  });

  describe("getTopPages", () => {
    it("returns top pages with view counts", async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { path: "/home", count: BigInt(100) },
        { path: "/courses", count: BigInt(50) },
      ]);

      const { getTopPages } = await import("@/lib/analytics");

      const from = new Date("2025-01-01");
      const to = new Date("2025-01-31");
      const result = await getTopPages({ from, to }, 10);

      expect(result).toEqual([
        { path: "/home", views: 100 },
        { path: "/courses", views: 50 },
      ]);
    });
  });

  describe("getDailyVisits", () => {
    it("returns daily visit counts", async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { date: "2025-01-01", count: BigInt(10) },
        { date: "2025-01-02", count: BigInt(15) },
      ]);

      const { getDailyVisits } = await import("@/lib/analytics");

      const from = new Date("2025-01-01");
      const to = new Date("2025-01-02");
      const result = await getDailyVisits({ from, to });

      expect(result).toEqual([
        { date: "2025-01-01", count: 10 },
        { date: "2025-01-02", count: 15 },
      ]);
    });
  });

  describe("getLocaleBreakdown", () => {
    it("returns locale visit counts", async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { locale: "en", count: BigInt(80) },
        { locale: "ar", count: BigInt(20) },
      ]);

      const { getLocaleBreakdown } = await import("@/lib/analytics");

      const from = new Date("2025-01-01");
      const to = new Date("2025-01-31");
      const result = await getLocaleBreakdown({ from, to });

      expect(result).toEqual([
        { locale: "en", count: 80 },
        { locale: "ar", count: 20 },
      ]);
    });
  });

  describe("getClickBreakdown", () => {
    it("returns click event breakdown", async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { element: "nav-courses", count: BigInt(30) },
        { element: "cta-register", count: BigInt(10) },
      ]);

      const { getClickBreakdown } = await import("@/lib/analytics");

      const from = new Date("2025-01-01");
      const to = new Date("2025-01-31");
      const result = await getClickBreakdown({ from, to }, 10);

      expect(result).toEqual([
        { element: "nav-courses", count: 30 },
        { element: "cta-register", count: 10 },
      ]);
    });
  });

  describe("getTrafficSummary", () => {
    it("returns traffic summary counts", async () => {
      mockPrisma.pageView.count
        .mockResolvedValueOnce(5) // today
        .mockResolvedValueOnce(3) // yesterday
        .mockResolvedValueOnce(20) // week
        .mockResolvedValueOnce(100); // total

      const { getTrafficSummary } = await import("@/lib/analytics");

      const result = await getTrafficSummary();

      expect(result).toEqual({
        todayViews: 5,
        yesterdayViews: 3,
        weekViews: 20,
        totalViews: 100,
      });
      expect(mockPrisma.pageView.count).toHaveBeenCalledTimes(4);
    });
  });
});
