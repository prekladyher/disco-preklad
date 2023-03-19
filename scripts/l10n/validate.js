import fs from "fs";
import path from "path";
import { decodeEntries } from "../text/main.js";
import { loadFileTree } from "./utils.js";


const validationChecks = Object.entries({
  "newline": entry => entry.msgstr.match(/\n/g)?.length === entry.msgid.match(/\n/g)?.length,
  "leading-whitespace": entry => entry.msgstr.match(/\n /g)?.length === entry.msgid.match(/\n /g)?.length
});

function validateEntry(entry) {
  const errors = validationChecks
    .filter(check => !check[1](entry))
    .map(check => check[0])
    .join(" ");
  return errors ? [entry.msgctxt, errors] : [];
}

/**
 * Perform translation file validation.
 * @param {*} base Base path.
 * @return {[string, [string, string]]} Array with validation errors for checked files.
 */
export function validateL10n(base) {
  return loadFileTree(base, "")
    .map(subpath => {
      const errors = decodeEntries(fs.readFileSync(path.join(base, subpath)).toString())
        // do not validate header entry and entries with `valid` flag
        .filter(entry => entry.msgid && !(entry["#,"]?.indexOf("valid") >= 0))
        // do not validate entries with no translation
        .filter(entry => !!entry.msgstr)
        .map(validateEntry)
        .filter(result => result.length);
      return [subpath || path.basename(base), errors];
    })
    .filter(errors => errors[1].length);
}
