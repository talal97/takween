const BASE = process.env.LIVE_SITE_URL || "https://wazzankw.com";

export type ScrapedCourse = {
  code: string;
  slug: string;
  titleEn: string;
  subtitleEn?: string;
  introEn?: string;
  objectivesEn?: string;
  methodologyEn?: string;
  targetAudienceEn?: string;
  orgImpactEn?: string;
  personalImpactEn?: string;
  certificateNoteEn?: string;
  dayOutlineEn?: unknown;
  categorySlug?: string;
  durationDays: number;
};

export type ScrapedCategory = {
  slug: string;
  nameEn: string;
  taglineEn?: string;
  descriptionEn?: string;
};

export type ScrapedSuperCategory = {
  slug: string;
  nameEn: string;
};

export type ScrapedCertificate = {
  slug: string;
  code: string;
  nameEn: string;
  description?: string;
};

export type ScrapedArticle = {
  slug: string;
  titleEn: string;
  excerptEn?: string;
  bodyEn?: string;
};

async function fetchPage(path: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "User-Agent": "Takween-Import/1.0" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function extractMeta(html: string, property: string): string {
  const ogMatch = html.match(new RegExp(`<meta[^>]*property="${property}"[^>]*content="([^"]*)"`, "i"));
  if (ogMatch) return ogMatch[1];
  const nameMatch = html.match(new RegExp(`<meta[^>]*name="${property}"[^>]*content="([^"]*)"`, "i"));
  return nameMatch?.[1] || "";
}

export async function scrapeSitemap(): Promise<string[]> {
  const xml = await fetchPage("/sitemap.xml");
  if (!xml) return [];
  const urls: string[] = [];
  const regex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
  let m;
  while ((m = regex.exec(xml)) !== null) {
    urls.push(m[1]);
  }
  return urls;
}

export async function scrapeCourses(): Promise<ScrapedCourse[]> {
  const urls = await scrapeSitemap();
  const courseUrls = urls.filter((u) => u.includes("/training-course/") && u.includes("/en/"));

  const courses: ScrapedCourse[] = [];
  for (const url of courseUrls) {
    const path = new URL(url).pathname;
    const html = await fetchPage(path);
    if (!html) continue;

    const slug = path.split("/training-course/")[1]?.replace(/\/$/, "") || "";
    const titleEn = extractMeta(html, "og:title").replace(/ \| Takween.*$/, "").trim();
    const subtitleEn = extractMeta(html, "og:description").trim();
    const codeMatch = html.match(/class="[^"]*text-brand[^"]*"[^>]*>([^<]{1,10})<\/span>/);
    const code = codeMatch?.[1]?.trim() || slug.slice(0, 4).toUpperCase();

    courses.push({
      code,
      slug,
      titleEn,
      subtitleEn,
      introEn: undefined,
      objectivesEn: undefined,
      methodologyEn: undefined,
      targetAudienceEn: undefined,
      orgImpactEn: undefined,
      personalImpactEn: undefined,
      certificateNoteEn: undefined,
      dayOutlineEn: undefined,
      durationDays: 5,
    });
  }
  return courses;
}

export async function scrapeCourseDetail(slug: string): Promise<ScrapedCourse | null> {
  const html = await fetchPage(`/en/training-course/${slug}`);
  if (!html) return null;

  const titleEn = extractMeta(html, "og:title").replace(/ \| Takween.*$/, "").trim();
  const subtitleEn = extractMeta(html, "og:description").trim();
  const codeMatch = html.match(/"course_code"\s*:\s*"([^"]+)"/);
  const code = codeMatch?.[1] || slug.slice(0, 4).toUpperCase();

  const sectionText = (heading: string): string | undefined => {
    const patterns = [
      new RegExp(`<h2[^>]*>[^<]*${heading}[^<]*<\\/h2>([\\s\\S]*?)(?:<h2|$)`, "i"),
      new RegExp(`>${heading}<\\/h[23]>\\s*<div[^>]*>([\\s\\SF]*?)<\\/div>`, "i"),
    ];
    for (const p of patterns) {
      const m = html.match(p);
      if (m) return m[1].replace(/<[^>]+>/g, "").trim().slice(0, 5000) || undefined;
    }
    return undefined;
  };

  return {
    code,
    slug,
    titleEn,
    subtitleEn,
    introEn: sectionText("Introduction"),
    objectivesEn: sectionText("Objectives"),
    methodologyEn: sectionText("Methodology"),
    targetAudienceEn: sectionText("Who should Attend"),
    orgImpactEn: sectionText("Organisational Impact"),
    personalImpactEn: sectionText("Personal Impact"),
    certificateNoteEn: sectionText("Certificate"),
    durationDays: 5,
  };
}

export async function scrapeCategories(): Promise<ScrapedCategory[]> {
  const urls = await scrapeSitemap();
  const catUrls = urls.filter((u) => u.includes("/training-courses/") && u.includes("/en/"));

  const cats: ScrapedCategory[] = [];
  for (const url of catUrls) {
    const path = new URL(url).pathname;
    const slug = path.split("/training-courses/")[1]?.replace(/\/$/, "") || "";
    const html = await fetchPage(path);
    if (!html) continue;

    const nameEn = extractMeta(html, "og:title").replace(/ \| Takween.*$/, "").trim();
    const taglineEn = extractMeta(html, "og:description").trim() || undefined;

    cats.push({ slug, nameEn, taglineEn });
  }
  return cats;
}

export async function scrapeSuperCategories(): Promise<ScrapedSuperCategory[]> {
  const urls = await scrapeSitemap();
  const scUrls = urls.filter((u) => u.includes("/training-subjects/") && u.includes("/en/") && !u.includes("/training-courses/"));

  const scats: ScrapedSuperCategory[] = [];
  for (const url of scUrls) {
    const path = new URL(url).pathname;
    const slug = path.split("/training-subjects/")[1]?.replace(/\/$/, "") || "";
    const html = await fetchPage(path);
    if (!html) continue;

    const nameEn = extractMeta(html, "og:title").replace(/ \| Takween.*$/, "").trim();
    scats.push({ slug, nameEn });
  }
  return scats;
}

export async function scrapeCertificates(): Promise<ScrapedCertificate[]> {
  const urls = await scrapeSitemap();
  const certUrls = urls.filter((u) => u.includes("/certified-courses/") && u.includes("/en/"));

  const certs: ScrapedCertificate[] = [];
  for (const url of certUrls) {
    const path = new URL(url).pathname;
    const slug = path.split("/certified-courses/")[1]?.replace(/\/$/, "") || "";
    const html = await fetchPage(path);
    if (!html) continue;

    const nameEn = extractMeta(html, "og:title").replace(/ \| Takween.*$/, "").trim();
    const description = extractMeta(html, "og:description").trim() || undefined;

    certs.push({ slug, code: slug.toUpperCase(), nameEn, description });
  }
  return certs;
}

export async function scrapeArticles(): Promise<ScrapedArticle[]> {
  const urls = await scrapeSitemap();
  const articleUrls = urls.filter((u) => u.includes("/resources/") && u.includes("/en/") && !u.includes("/resources/"));

  const articles: ScrapedArticle[] = [];
  for (const url of articleUrls) {
    const path = new URL(url).pathname;
    const slug = path.split("/resources/")[1]?.replace(/\/$/, "") || "";
    if (!slug) continue;
    const html = await fetchPage(path);
    if (!html) continue;

    const titleEn = extractMeta(html, "og:title").replace(/ \| Takween.*$/, "").trim();
    const excerptEn = extractMeta(html, "og:description").trim() || undefined;

    articles.push({ slug, titleEn, excerptEn });
  }
  return articles;
}
