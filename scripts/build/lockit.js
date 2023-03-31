import { readFile } from "fs/promises";
import { decodeEntries } from "../text/main.js";


export async function mergeLockit(lockitData, sources) {
  const entryMap = {};
  for (const source of sources) {
    for (const entry of decodeEntries(await readFile(source, 'utf-8'))) {
      if (entry.msgstr) {
        entryMap[entry.msgctxt] = entry.msgstr;
      }
    }
  }
  for (const term of lockitData.mSource.mTerms) {
    if (entryMap[term.Term]) {
      term.Languages[0] = entryMap[term.Term];
    }
  }
}
