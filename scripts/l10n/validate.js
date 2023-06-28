import fs from "fs";
import path from "path";
import { decodeEntries, encodeEntries } from "../text/main.js";
import { loadFileTree } from "./utils.js";


const validationChecks = Object.entries({
  "newline": entry => entry.msgstr.match(/\n/g)?.length === entry.msgid.match(/\n/g)?.length,
  "leading-whitespace": entry => entry.msgstr.match(/\n /g)?.length === entry.msgid.match(/\n /g)?.length,
  "matching-quotes": entry => /["“”]/.test(entry.msgid) === /["„“]/.test(entry.msgstr),
  "even-quotes": entry => (entry.msgstr.match(/"/g)?.length || 0) % 2 === 0,
  "even-asterisks": entry => (entry.msgstr.match(/\*/g)?.length || 0) % 2 === 0
});

function validateEntry(entry, overrides) {
  const errors = validationChecks
    .filter(check => !check[1](entry))
    .map(check => check[0])
    .filter(check => overrides.indexOf(`valid-${check}`) < 0)
    .join(" ");
  return errors ? [entry.msgctxt, errors] : [];
}

/**
 * Perform translation file validation.
 * @param {*} base Base path.
 * @param {boolean} mark Mark invalid entries as fuzzy.
 * @return {[string, [string, string]]} Array with validation errors for checked files.
 */
export function validateL10n(base, mark = false) {
  const globalErrors = [];
  for (const subpath of loadFileTree(base, "")) {
    const fileErrors = [];
    try {
      const entries = decodeEntries(fs.readFileSync(path.join(base, subpath), "utf-8"));
      for (const entry of entries) {
        const overrides = entry["#,"]?.match(/\bvalid[^ ]*/g) || [];
        // do not validate header entry and entries with `valid` flag
        if (!entry.msgid || overrides.indexOf("valid") >= 0) {
          continue;
        }
        // do not validate entries with no translation
        if (!entry.msgstr) {
          continue;
        }
        const errors = validateEntry(entry, overrides);
        if (errors.length) {
          fileErrors.push(errors);
          mark && markFuzzy(entry);
        }
      }
      if (fileErrors.length) {
        globalErrors.push([subpath || path.basename(base), fileErrors]);
        if (mark) {
          fs.writeFileSync(path.join(base, subpath), encodeEntries(entries));
        }
      }
    } catch (error) {
      throw new Error(`Unable to parse file ${subpath}`, { cause: error });
    }
  }
  return globalErrors;
}

function markFuzzy(entry) {
  if (entry["#,"]?.indexOf("fuzzy")) {
    return;
  }
  entry["#,"] = entry["#,"] ? entry["#,"] + " fuzzy" : "fuzzy";
}
