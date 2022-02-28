import fs from "fs";
import { GoogleSpreadsheet } from 'google-spreadsheet';

const doc = new GoogleSpreadsheet('1GMYp3UxK3nb5LX6QzQO8vLpDeY5ikrSnFZxIkJzE_KA');
const glossaryFile = "./terms.tbx";
const header = "<?xml version='1.0' encoding='UTF-8'?><!DOCTYPE martif PUBLIC 'ISO 12200:1999A//DTD MARTIF core (DXFcdV04)//EN' 'TBXcdv04.dtd'><martif type=\"TBX\" xml:lang=\"en_US\"><text><body>";
const footer = "</body></text></martif>";


async function generateGlossary() {
    await doc.useServiceAccountAuth({
      client_email: process.env.GGCLIENT_EMAIL,
      private_key: process.env.GGPRIVATE_KEY.replace(/\\n/gm, '\n')
    });

    await doc.loadInfo(); // loads document properties and worksheets
    console.log('DOCS: '+doc.title);
    const sheet = doc.sheetsByIndex[0]; // use doc.sheetsByIndex[0] or doc.sheetsById[id] or doc.sheetsByTitle[title]
    const rows = await sheet.getRows();
    var lastRow = sheet.headerValues[7]-1;
    fs.writeFileSync(glossaryFile, header);

    for(var i = 0; i < lastRow;i++){
      let poznamka = '';
      let vyraz = '';
      let preklad = '';
      let schvaleno = '';
      let velikost = '';

      if (typeof rows[i].Poznámka !== "undefined") { poznamka = rows[i].Poznámka.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
      if (typeof rows[i].Výraz !== "undefined") { vyraz = rows[i].Výraz.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
      if (typeof rows[i].Překlad !== "undefined") { preklad = rows[i].Překlad.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
      if (rows[i].OK == "x") { schvaleno = "[OK] " }
      if (rows[i].aA == "x") { velikost = "[aA] " }

      let glossaryRow = '<termEntry id="PHS-'+[i]+'"><descrip type="definition">'+schvaleno+velikost+poznamka+'</descrip><langSet xml:lang="en-US"><tig><term>'+vyraz+'</term></tig></langSet><langSet xml:lang="cs-CZ"><tig><term>'+preklad+'</term></tig></langSet></termEntry>';
      fs.appendFileSync(glossaryFile, glossaryRow);
    }

    fs.appendFileSync(glossaryFile, footer);

}

generateGlossary();





