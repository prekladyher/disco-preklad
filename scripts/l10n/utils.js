import fs from "fs";
import path from "path";
import { encodeEntries } from "../text/main.js";

/**
 * List all files under the base path starting with the given name.
 * @param {} base Base path.
 * @param {*} name Initial path name (starting point).
 * @returns List of all files.
 */
export function loadFileTree(base, name) {
  const stat = fs.statSync(path.join(base, name));
  if (stat.isDirectory()) {
    return fs.readdirSync(path.join(base, name))
      .map(child => loadFileTree(base, path.join(name, child)))
      .flat();
  } else {
    return [ name ];
  }
}

/**
 * Write PO or POT language file.
 * @param {string} filename Target filename.
 * @param {*} language Translation language.
 * @param {*} entries Translation entries.
 */
export function writeTextFile(filename, language, entries) {
  const header = {
    msgid: "",
    msgstr: [
      "Content-Transfer-Encoding: 8bit",
      "Content-Type: text/plain; charset=UTF-8",
      `Language: ${language}`
    ].join("\n")
  };
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(filename, encodeEntries([header, ...entries]) + "\n");
}
