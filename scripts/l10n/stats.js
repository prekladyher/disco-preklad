import fs from "fs";
import path from "path";
import { GoogleSpreadsheet } from 'google-spreadsheet';
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
 export async function saveStats(stats,push) {
  const doc = new GoogleSpreadsheet('13b_-JIIObwzcUg_ujiP-_5wT-V6_lqIc8r7mVRDj6-k');
  await doc.useServiceAccountAuth({
      client_email: process.env.GGCLIENT_EMAIL,
      private_key: process.env.GGPRIVATE_KEY.replace(/\\n/gm, '\n')
    });
  await doc.loadInfo(); // loads document properties and worksheets    
  const sheet = doc.sheetsByTitle['DIALOGY']; // use doc.sheetsByIndex[0] or doc.sheetsById[id] or doc.sheetsByTitle[title]
  const sheet2 = doc.sheetsByTitle['PREKLAD'];
  await sheet.loadCells('A2:F604');
  await sheet2.loadCells('A2:F2');
  let index = 0;

  stats.forEach(file => {
    index = 0;      
    for (let i = 1; i < sheet.rowCount;i++) {             
      if (sheet.getCell(i,0).value.includes(file[0])) {
        index = i;  
        break;        
      }  
    }  
    if (index!=0){
      sheet.getCell(index,5).value = file[1].targetCount / file[1].sourceCount;        
    }  
    if (file[0]=="General.po") {
      sheet2.getCell(1,5).value = file[1].targetCount / file[1].sourceCount;    
    }  
  });  
  if (push) {
    await sheet.saveUpdatedCells();
    await sheet2.saveUpdatedCells();
    console.log("Saving stats done.");  
  }  
}  
  
  

