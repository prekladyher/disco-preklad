import { promises as fs } from "fs";
import { decodeEntries } from "../text/main.js";
import { writeTextFile } from "./utils.js";

export async function mergeL10n(source, target, ignore) {
  const sourceEntries = decodeEntries((await fs.readFile(source)).toString());
  const sourceIdx = Object.fromEntries(sourceEntries
      .filter(entry => !!entry.msgid)
      .map(entry => [entry.msgctxt, entry]));

  const ignoreEntries = ignore ? decodeEntries((await fs.readFile(ignore)).toString()) : [];
  const ignoreIdx = Object.fromEntries(ignoreEntries
    .filter(entry => !!entry.msgid)
    .map(entry => [entry.msgctxt, entry]));

  const mergedEntries = decodeEntries((await fs.readFile(target)).toString())
    .filter(entry => !!entry.msgid)
    .map(entry => {
      const sourceEntry = sourceIdx[entry.msgctxt];
      const ignoreString = ignoreIdx[entry.msgctxt]?.msgstr;
      if (sourceEntry?.msgstr && sourceEntry.msgstr !== ignoreString) {
        return { ...entry, msgstr: sourceEntry.msgstr, "#": sourceEntry["#"] || undefined };
      } else {
        return entry;
      }
    });
  writeTextFile(target, "cs", mergedEntries);
}
