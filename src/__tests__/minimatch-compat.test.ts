import { createRequire } from "node:module";
import { expect, it } from "vitest";

const require = createRequire(import.meta.url);
const match = require("../../vendor/minimatch-compat/index.cjs");

it("supports both callable legacy lint plugins and modern named APIs", async () => {
  expect(match("src/app/page.tsx", "**/*.{ts,tsx}")).toBe(true);
  expect(match("node_modules/test.ts", "src/**")).toBe(false);
  expect(match(".hidden.ts", "*.ts")).toBe(false);
  expect(match(".hidden.ts", "*.ts", { dot: true })).toBe(true);
  expect(match("src/app/page.tsx", "*.tsx", { matchBase: true })).toBe(true);
  expect(new match.Minimatch("src/**").match("src/app/page.tsx")).toBe(true);
  expect(match.defaults({ nocase: true })("PAGE.TSX", "*.tsx")).toBe(true);
  expect(match.match(["one.ts", "two.js"], "*.ts")).toEqual(["one.ts"]);
  expect(match.makeRe("*.ts").test("one.ts")).toBe(true);
  const named = await import("../../vendor/minimatch-compat/index.cjs");
  expect(named.Minimatch).toBe(match.Minimatch);
});

it("uses only the patched upstream matcher", () => {
  const modern = require("minimatch-modern");
  expect(match).toBe(modern.minimatch);
  expect(match.Minimatch).toBe(modern.Minimatch);
  expect(require("minimatch-modern/package.json").version).toBe("11.0.4");
});

it("preserves import restrictions in an actual legacy ESLint plugin", async () => {
  const { ESLint } = require("eslint");
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [{
      plugins: { import: require("eslint-plugin-import") },
      rules: { "import/no-internal-modules": ["error", { forbid: ["pkg/private/**"] }] },
    }],
  });
  const [blocked] = await eslint.lintText("import value from 'pkg/private/secret';");
  const [allowed] = await eslint.lintText("import value from 'pkg/public/api';");
  expect(blocked.messages.map((message: { ruleId: string }) => message.ruleId)).toEqual(["import/no-internal-modules"]);
  expect(allowed.messages).toEqual([]);
});
