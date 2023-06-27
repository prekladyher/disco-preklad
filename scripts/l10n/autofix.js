import fs from "fs";
import path from "path";
import { decodeEntries, encodeEntries } from "../text/main.js";
import { loadFileTree } from "./utils.js";

/**
 * Automatically fix common translation errors.
 * @param {*} base Base path.
 */
export function autofixL10n(base) {
  for (const subpath of loadFileTree(base, "")) {
    const filepath = path.join(base, subpath);
    const entries = decodeEntries(fs.readFileSync(filepath, "utf-8"));
    let update = false;
    for (const entry of entries) {
      if (!entry.msgctxt) {
        continue; // skip header
      }
      update |= fixQuotes(entry, subpath);
      update |= fixDash(entry, subpath);
    }
    if (update) {
      fs.writeFileSync(filepath, encodeEntries(entries));
    }
  }
}

function fixQuotes(entry, context) {
  if (/^FinishTask/.test(entry.msgid)) {
    return false; // ignore script entry
  }
  const relevant = /"/.test(entry.msgid);
  if (/"/.test(entry.msgstr) && !relevant) {
    console.error(`Inconsistent entry ${context}: ${entry.msgctxt}`);
  }
  const fixed = entry.msgstr.replaceAll(/"([^"]+)"/g, "„$1“");
  if (fixed === entry.msgstr) {
    return false; // no change
  }
  entry.msgstr = fixed;
  return true;
}

function fixDash(entry) {
  const fixed = entry.msgstr.replaceAll(/(?<=\s)--?(?=\s)/g, "–");
  if (fixed === entry.msgstr) {
    return false; // no change
  }
  entry.msgstr = fixed;
  return true;
}
