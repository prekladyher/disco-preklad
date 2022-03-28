import { promises as fs } from "fs";
import { decodeEntries } from "../text/main.js";
import { encodeTextFile, writeTextFile } from "./utils.js";

export async function copySource(file, regexp) {
  const sourceEntries = decodeEntries((await fs.readFile(file)).toString());

  const processedEntries = sourceEntries
    .filter(entry => !!entry.msgid)
    .map(entry => {
      if (regexp.test(entry.msgid)) {
        return { ...entry, msgstr: entry.msgid };
      } else {
        return entry;
      }
    });
  writeTextFile(file, encodeTextFile("cs", processedEntries));
}
