import { decodeEntries } from "../text/main.js";
import { loadFileTree } from "./utils.js";

/**
 * Calculate basic translation file statistics.
 * @param {*} base Base path.
 * @return {[string, object]} Array with file statistics.
 */
 export function calcStats(base) {
  loadFileTree(base)
    .map(subpath => {
      const stats = {
        sourceCount: 0,
        sourceLength: 0,
        targetCount: 0,
        targetLength: 0,
        fuzzyCount: 0
      };
      decodeEntries(fs.readFileSync(path.join(base, subpath)).toString())
        .forEach(entry => {
          if (entry.msgid) {
            stats.sourceCount++;
            stats.sourceLength += entry.msgid.length;
            if (entry.msgstr) {
              stats.targetCount++;
              stats.targetLength += entry.msgstr.length;
            }
            if (entry["#,"]?.indexOf("fuzzy") >= 0) {
              stats.fuzzyCount++;
            }
          }
        });
      return [subpath, stats];
    });
}
