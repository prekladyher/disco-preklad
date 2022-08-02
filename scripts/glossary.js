import fs from "fs";
import { GoogleSpreadsheet } from "google-spreadsheet";

function prettifyXml(xmlInput) {
  const indentString = "  ";
  const newlineOption = "\n";
  let formatted = "";
  const regex = /(>)(<)(\/*)/g;
  const xml = xmlInput.replace(regex, `$1${newlineOption}$2$3`);
  let pad = 0;
  xml.split(/\r?\n/).forEach(l => {
    const line = l.trim();
    let indent = 0;
    if (line.match(/.+<\/\w[^>]*>$/)) {
      indent = 0;
    } else if (line.match(/^<\/\w/)) {
      if (pad !== 0) {
        pad -= 1;
      }
    } else if (line.match(/^<\w([^>]*[^/])?>.*$/)) {
      indent = 1;
    } else {
      indent = 0;
    }
    const padding = Array(pad + 1).join(indentString);
    formatted += padding + line + newlineOption;
    pad += indent;
  });
  return formatted.trim();
}

const doc = new GoogleSpreadsheet("1GMYp3UxK3nb5LX6QzQO8vLpDeY5ikrSnFZxIkJzE_KA");
const glossaryFile = "./terms.tbx";
const header = "<?xml version='1.0' encoding='UTF-8'?><!DOCTYPE martif PUBLIC 'ISO 12200:1999A//DTD MARTIF core (DXFcdV04)//EN' 'TBXcdv04.dtd'><martif type=\"TBX\" xml:lang=\"en_US\"><text><body>";
const footer = "</body></text></martif>";


async function generateGlossary() {
  await doc.useServiceAccountAuth({
    client_email: process.env.GS_CLIENT_EMAIL,
    private_key: process.env.GS_PRIVATE_KEY
  });

  await doc.loadInfo(); // loads document properties and worksheets
  console.log("DOCS: " + doc.title);
  const sheet = doc.sheetsByIndex[0]; // use doc.sheetsByIndex[0] or doc.sheetsById[id] or doc.sheetsByTitle[title]
  await sheet.loadCells("A1:I10000");
  const entriesCount = sheet.getCell(0, 8).value;
  const entries = [];
  let usedIds = [];
  let glossaryData = header;

  for (let idx = 1; idx < entriesCount; idx++) {
    entries.push([sheet.getCell(idx, 1).value, sheet.getCell(idx, 2).value, sheet.getCell(idx, 3).value, sheet.getCell(idx, 5).value, sheet.getCell(idx, 7).value, sheet.getCell(idx, 4).value]);
  }
  entries.sort((a, b) => a[0].localeCompare(b[0], "en", { sensitivity: "base" }));
  entries.forEach(entry => {
    let [id, vyraz, preklad, poznamka, velikost, schvaleno, tykani] = Array(7).fill("");

    if (entry[0] !== null) {vyraz = entry[0].replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");}
    if (entry[1] !== null) {preklad = entry[1].replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");}
    if (entry[2] == "x") {velikost = "[aA] ";}
    if (entry[3] !== null) {poznamka = entry[3].replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");}
    if (entry[4] == "x") {schvaleno = "[OK] ";}
    if (entry[5] !== null) {
      if (entry[5].toUpperCase() == "T") { tykani = "[TYKAT] "; }
      else if (entry[5].toUpperCase() == "V") { tykani = "[VYKAT] "; }
    }

    let idx = usedIds.findIndex(el => el[0] === entry[0]);
    if (idx !== -1) {
      id = entry[0] + (usedIds[idx][1] + 1);
      usedIds[idx][1]++;
    } else {
      id = entry[0];
      usedIds.push([vyraz, 1]);
    }

    glossaryData += "<termEntry id=\"" + id + "\"><descrip type=\"definition\">" + schvaleno + velikost + tykani + poznamka + "</descrip><langSet xml:lang=\"en\"><tig><term>" + vyraz + "</term></tig></langSet><langSet xml:lang=\"cs\"><tig><term>" + preklad + "</term></tig></langSet></termEntry>";
  });

  glossaryData += footer;
  fs.writeFileSync(glossaryFile, prettifyXml(glossaryData));

}

generateGlossary();





