import { expect, it } from "vitest";
import { unzipSync, strFromU8 } from "fflate";
import { writeWorkbook } from "@/lib/excel";

const columns = [
  { header: "Course", key: "title", width: 40 },
  { header: "Fee", key: "fee", width: 10 },
];

it("preserves Arabic, escaped text, numeric fees and formatting without creating formulas", async () => {
  const buffer = await writeWorkbook("Schedules", columns, [
    { title: "دورة <عربية> & English", fee: 1234.5 },
    { title: '=HYPERLINK("https://example.test")', fee: 0 },
    { title: "+1+1", fee: 20 },
  ]);
  const files = unzipSync(buffer);
  const xml = Object.values(files).map((bytes) => strFromU8(bytes)).join("\n");
  expect(xml).toContain("دورة &lt;عربية&gt; &amp; English");
  expect(xml).toContain("HYPERLINK");
  expect(xml).toContain("+1+1");
  expect(xml).not.toMatch(/<f[\s>]/);
  expect(strFromU8(files["xl/worksheets/sheet1.xml"])).toMatch(/<v>1234\.5<\/v>/);
  expect(xml).toContain('width="40"');
  expect(xml).toContain('name="Schedules"');
  expect(strFromU8(files["xl/styles.xml"])).toMatch(/<b\s*\/>/);
});

it("creates a header-only workbook when there are no schedules", async () => {
  const files = unzipSync(await writeWorkbook("All Courses", columns, []));
  const xml = Object.values(files).map((bytes) => strFromU8(bytes)).join("\n");
  expect(xml).toContain("Course");
  expect(xml).toContain("Fee");
  expect(xml).toContain('name="All Courses"');
  expect(strFromU8(files["xl/worksheets/sheet1.xml"]).match(/<row\b/g)).toHaveLength(1);
});
