import fs from "fs";
import path from "path";
import { decodeEntries } from "../text/main.js";
import { encodeTextFile, loadFileTree } from "./utils.js";

export function appendL10n(files, cleanup) {
  const entries = files
    .flatMap(file => loadFileTree(file, "").map(child => path.join(file, child)))
    .flatMap(file => decodeEntries((fs.readFileSync(file)).toString()))
    .filter(entry => !!entry.msgid);
  if (cleanup) {
    entries.forEach(entry => {
      Object.keys(entry)
        .filter(key => key.startsWith("#"))
        .forEach(key => delete entry[key]);
    });
  }
  return encodeTextFile("cs", entries);
}
