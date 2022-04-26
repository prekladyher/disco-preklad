import fs from "fs";
import path from "path";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { decodeEntries } from "../text/main.js";
import { loadFileTree } from "./utils.js";

/**
 * Calculate basic translation file statistics.
 * @param {*} base Base path.
 * @return {[string, object]} Array with file statistics.
 */
export function calcStats(base) {
  return loadFileTree(base, "")
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
      return [subpath || path.basename(base), stats];
    });
}


/**
 * Save basic translation file statistics to google sheet.
  * @param {*} stats from calcStats.
 */
export async function saveStats(stats) {
  const document = new GoogleSpreadsheet("13b_-JIIObwzcUg_ujiP-_5wT-V6_lqIc8r7mVRDj6-k");
  await document.useServiceAccountAuth({
    client_email: process.env.GS_CLIENT_EMAIL,
    private_key: process.env.GS_PRIVATE_KEY
  });
  // Load document properties and worksheets
  await document.loadInfo();
  const statsSheet = document.sheetsByTitle["SOUBORY"];
  await statsSheet.loadCells("A2:F1000");
  // Create stats index
  const statsIdx = Object.fromEntries(stats
    .map(([fileName, fileStats]) => [fileName.replaceAll("\\", "/"), fileStats]));
  // Fill statistics for individual files
  for (let rowIdx = 1; rowIdx < statsSheet.rowCount; rowIdx++) {
    const fileStats = statsIdx[statsSheet.getCell(rowIdx, 0).value];
    if (!fileStats) {
      continue; // unknown filename or invalid row
    }
    statsSheet.getCell(rowIdx, 5).value = fileStats.targetCount / fileStats.sourceCount;
  }
  await statsSheet.saveUpdatedCells();
}
