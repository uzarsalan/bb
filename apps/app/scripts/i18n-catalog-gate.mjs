import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  activeKeySet,
  diffKeySets,
  findEmptyTranslations,
  parsePoFile,
} from "../src/i18n/po-catalog.ts";

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_LOCALE = "en";
const TARGET_LOCALES = ["ru"];

function readCatalog(locale) {
  return parsePoFile(
    readFileSync(join(appDir, "locales", locale, "messages.po"), "utf8"),
  );
}

const before = readCatalog(SOURCE_LOCALE);

const extract = spawnSync("pnpm", ["exec", "lingui", "extract"], {
  cwd: appDir,
  encoding: "utf8",
});
if (extract.status !== 0) {
  console.error(extract.stdout);
  console.error(extract.stderr);
  console.error("i18n gate: lingui extract failed");
  process.exit(1);
}

const problems = [];

const { added } = diffKeySets(
  activeKeySet(before),
  activeKeySet(readCatalog(SOURCE_LOCALE)),
);
if (added.length > 0) {
  problems.push(
    `Messages found in code but missing from the committed catalogs (${added.length}). Run "pnpm --filter @bb/app i18n:extract", translate them in locales/*/messages.po and commit:\n` +
      added.map((key) => `  - ${key}`).join("\n"),
  );
}

for (const locale of TARGET_LOCALES) {
  const empty = findEmptyTranslations(readCatalog(locale));
  if (empty.length > 0) {
    problems.push(
      `locales/${locale}/messages.po has ${empty.length} empty translations (silent fallback to English):\n` +
        empty
          .map((entry) => `  - line ${entry.line}: ${entry.msgid}`)
          .join("\n"),
    );
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n\n"));
  process.exit(1);
}
console.log("i18n gate: catalogs are in sync and fully translated");
