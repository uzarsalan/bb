import { describe, expect, it } from "vitest";
import {
  activeKeySet,
  diffKeySets,
  findEmptyTranslations,
  parsePoFile,
} from "./po-catalog";

const SAMPLE = `msgid ""
msgstr ""
"Language: ru\\n"

#: src/a.tsx:1
msgid "Hello"
msgstr "Привет"

#: src/a.tsx:2
msgid "Untranslated"
msgstr ""

#: src/a.tsx:3
msgid "Long "
"line"
msgstr "Длинная "
"строка"

#: src/a.tsx:4
msgid "{count, plural, one {# file} other {# files}}"
msgid_plural "files"
msgstr[0] "# файл"
msgstr[1] ""
msgstr[2] "# файлов"

#~ msgid "Old"
#~ msgstr ""
`;

describe("parsePoFile", () => {
  const entries = parsePoFile(SAMPLE);

  it("joins multi-line strings and keeps references", () => {
    const long = entries.find((entry) => entry.msgid === "Long line");
    expect(long?.msgstr).toBe("Длинная строка");
    expect(long?.references).toEqual(["src/a.tsx:3"]);
  });

  it("ignores the header and obsolete entries", () => {
    expect([...activeKeySet(entries)].sort()).toEqual([
      "Hello",
      "Long line",
      "Untranslated",
      "{count, plural, one {# file} other {# files}}",
    ]);
  });

  it("reports empty singular and empty plural forms", () => {
    expect(findEmptyTranslations(entries).map((entry) => entry.msgid)).toEqual([
      "Untranslated",
      "{count, plural, one {# file} other {# files}}",
    ]);
  });
});

describe("diffKeySets", () => {
  it("lists added and removed keys", () => {
    expect(diffKeySets(new Set(["a", "b"]), new Set(["b", "c"]))).toEqual({
      added: ["c"],
      removed: ["a"],
    });
  });
});
