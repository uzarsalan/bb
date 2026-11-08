export interface PoEntry {
  msgid: string;
  msgctxt: string | null;
  msgstr: string;
  msgstrPlural: string[] | null;
  references: string[];
  obsolete: boolean;
  line: number;
}

export function decodePoString(raw: string): string {
  let out = "";
  for (let index = 0; index < raw.length; index++) {
    const char = raw.charAt(index);
    const next = raw.charAt(index + 1);
    if (char !== "\\" || index + 1 >= raw.length) {
      out += char;
      continue;
    }
    if (next === "n") out += "\n";
    else if (next === "t") out += "\t";
    else if (next === "r") out += "\r";
    else if (next === '"') out += '"';
    else if (next === "\\") out += "\\";
    else {
      out += char;
      continue;
    }
    index++;
  }
  return out;
}

function quotedContent(line: string): string | null {
  const open = line.indexOf('"');
  if (open === -1) return null;
  let index = open + 1;
  while (index < line.length) {
    const char = line.charAt(index);
    if (char === "\\") {
      index += 2;
      continue;
    }
    if (char === '"') return line.slice(open + 1, index);
    index++;
  }
  return null;
}

type Target = "msgctxt" | "msgid" | "msgidPlural" | "msgstr" | "msgstrPlural";

interface Draft {
  msgctxt: string | null;
  msgid: string;
  hasPlural: boolean;
  msgstr: string;
  msgstrPlural: string[];
  references: string[];
  obsolete: boolean;
  line: number;
  target: Target | null;
  pluralIndex: number;
}

const KEYWORD = /^(msgctxt|msgid_plural|msgid|msgstr)(?:\[(\d+)\])?\s/;

function emptyDraft(references: string[], obsolete: boolean, line: number) {
  const draft: Draft = {
    msgctxt: null,
    msgid: "",
    hasPlural: false,
    msgstr: "",
    msgstrPlural: [],
    references,
    obsolete,
    line,
    target: null,
    pluralIndex: 0,
  };
  return draft;
}

function append(draft: Draft, raw: string): void {
  if (draft.target === "msgctxt") draft.msgctxt = (draft.msgctxt ?? "") + raw;
  else if (draft.target === "msgid") draft.msgid += raw;
  else if (draft.target === "msgstr") draft.msgstr += raw;
  else if (draft.target === "msgstrPlural") {
    while (draft.msgstrPlural.length <= draft.pluralIndex) {
      draft.msgstrPlural.push("");
    }
    draft.msgstrPlural[draft.pluralIndex] =
      (draft.msgstrPlural[draft.pluralIndex] ?? "") + raw;
  }
}

function finish(draft: Draft): PoEntry {
  return {
    msgid: decodePoString(draft.msgid),
    msgctxt: draft.msgctxt === null ? null : decodePoString(draft.msgctxt),
    msgstr: decodePoString(draft.msgstr),
    msgstrPlural: draft.hasPlural
      ? draft.msgstrPlural.map(decodePoString)
      : null,
    references: draft.references,
    obsolete: draft.obsolete,
    line: draft.line,
  };
}

export function parsePoFile(content: string): PoEntry[] {
  const entries: PoEntry[] = [];
  let references: string[] = [];
  let draft: Draft | null = null;

  const flush = () => {
    if (draft !== null) entries.push(finish(draft));
    draft = null;
  };

  content.split("\n").forEach((rawLine, lineIndex) => {
    const obsolete = rawLine.startsWith("#~");
    const trimmed = (obsolete ? rawLine.slice(2) : rawLine).trim();
    if (trimmed === "") {
      flush();
      references = [];
      return;
    }
    if (!obsolete && trimmed.startsWith("#:")) {
      references.push(...trimmed.slice(2).trim().split(/\s+/));
      return;
    }
    if (trimmed.startsWith("#")) return;

    const keyword = KEYWORD.exec(trimmed);
    if (keyword !== null) {
      const content = quotedContent(trimmed);
      if (content === null) return;
      draft ??= emptyDraft(references, obsolete, lineIndex + 1);
      const name = keyword[1];
      if (name === "msgctxt") draft.target = "msgctxt";
      else if (name === "msgid_plural") {
        draft.hasPlural = true;
        draft.target = "msgidPlural";
      } else if (name === "msgid") draft.target = "msgid";
      else if (keyword[2] !== undefined) {
        draft.target = "msgstrPlural";
        draft.pluralIndex = Number(keyword[2]);
      } else draft.target = "msgstr";
      if (draft.target !== "msgidPlural") append(draft, content);
      return;
    }
    if (trimmed.startsWith('"') && draft !== null) {
      const continuation = quotedContent(trimmed);
      if (continuation !== null && draft.target !== "msgidPlural") {
        append(draft, continuation);
      }
    }
  });
  flush();
  return entries;
}

export function getActiveEntries(entries: readonly PoEntry[]): PoEntry[] {
  return entries.filter((entry) => !entry.obsolete && entry.msgid !== "");
}

export function entryKey(entry: Pick<PoEntry, "msgid" | "msgctxt">): string {
  return entry.msgctxt === null
    ? entry.msgid
    : `${entry.msgctxt}\u0004${entry.msgid}`;
}

export function activeKeySet(entries: readonly PoEntry[]): Set<string> {
  return new Set(getActiveEntries(entries).map(entryKey));
}

export function findEmptyTranslations(entries: readonly PoEntry[]): PoEntry[] {
  return getActiveEntries(entries).filter((entry) =>
    entry.msgstrPlural === null
      ? entry.msgstr === ""
      : entry.msgstrPlural.some((form) => form === ""),
  );
}

export interface KeyDiff {
  added: string[];
  removed: string[];
}

export function diffKeySets(
  before: ReadonlySet<string>,
  after: ReadonlySet<string>,
): KeyDiff {
  return {
    added: [...after].filter((key) => !before.has(key)).sort(),
    removed: [...before].filter((key) => !after.has(key)).sort(),
  };
}
