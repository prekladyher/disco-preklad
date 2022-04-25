import fs from "fs";
import path from "path";
import { extractDialogue, extractTemplate, extractLanguage } from "./extract.js";

/**
 * Extract asset data into translation file(s).
 */
export function extractAsset(filename, base = "source/l10n") {
  const basename = path.basename(filename);
  if (basename.match("(General|Fonts|Dialogues|Images)Lockit.*")) {
    const category = basename.substring(0, basename.indexOf("Lockit"));
    if (basename.indexOf("English") >= 0) { // english is template
      extractTemplate(category, fs.readFileSync(filename), base);
    } else {
      extractLanguage(category, fs.readFileSync(filename), base);
    }
  } else if (basename.startsWith("Dialogue")) {
    extractDialogue(fs.readFileSync(filename), base);
  } else {
    console.error(`Invalid filename: ${basename}`);
  }
}

export { calcStats, saveStats } from "./stats.js";

export { mergeL10n } from "./merge.js";

export { validateL10n } from "./validate.js";
