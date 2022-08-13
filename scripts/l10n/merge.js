import { promises as fs } from "fs";
import { decodeEntries } from "../text/main.js";
import { encodeTextFile, writeTextFile } from "./utils.js";

async function loadIndex(file) {
  const entries = decodeEntries((await fs.readFile(file)).toString());
  return Object.fromEntries(entries
    .filter(entry => !!entry.msgid)
    .map(entry => [entry.msgctxt, entry]));
}

export async function mergeL10n(source, ignore, ...targets) {
  const sourceIdx = await loadIndex(source);
  const ignoreIdx = ignore ? await loadIndex(ignore) : {};

  for (const target of targets) {
    let changed = false;
    const mergedEntries = decodeEntries((await fs.readFile(target)).toString())
      .filter(entry => !!entry.msgid)
      .map(entry => {
        const sourceEntry = sourceIdx[entry.msgctxt];
        const ignoreString = ignoreIdx[entry.msgctxt]?.msgstr;
        if (!sourceEntry?.msgstr || sourceEntry.msgstr === ignoreString) {
          return entry; // missing translation or ignored translation
        }
        if (sourceEntry.msgstr === entry.msgstr && sourceEntry['#'] === entry['#']) {
          return entry; // nothing changed, no need to merge
        }
        changed ||= true;
        return { ...entry, msgstr: sourceEntry.msgstr, "#": sourceEntry["#"] || undefined };
      });
    if (changed) {
      writeTextFile(target, encodeTextFile("cs", mergedEntries));
    }
  }
}
