import fs from "fs";
import { program } from "commander";
import { GoogleSpreadsheet } from 'google-spreadsheet';
import  * as auth  from './auth.js'

const doc = new GoogleSpreadsheet('1GMYp3UxK3nb5LX6QzQO8vLpDeY5ikrSnFZxIkJzE_KA');
const glossaryFile = "./terms.tbx";
const header = "<?xml version='1.0' encoding='UTF-8'?><!DOCTYPE martif PUBLIC 'ISO 12200:1999A//DTD MARTIF core (DXFcdV04)//EN' 'TBXcdv04.dtd'><martif type=\"TBX\" xml:lang=\"en_US\"><text><body>";
const footer = "</body></text></martif>";


program
  .description("Export gloosary for Lokalize")
  .action(async () => {    
    await doc.useServiceAccountAuth({
      client_email: auth.GGclient_email,
      private_key: auth.GGprivate_key,
    });

    await doc.loadInfo(); // loads document properties and worksheets
    console.log(doc.title);
    const sheet = doc.sheetsByIndex[0]; // use doc.sheetsByIndex[0] or doc.sheetsById[id] or doc.sheetsByTitle[title]
    const rows = await sheet.getRows();
    var lastRow = sheet.headerValues[7]-1;
    fs.writeFileSync(glossaryFile, header);

    for(var i = 0; i < lastRow;i++){
      let schvaleno = '';
      let velikost = '';
     
      if (rows[i].OK == "x") { schvaleno = "[OK] " }
      if (rows[i].aA == "x") { velikost = "[aA] " }
      let glossaryRow = '<termEntry id="PHS-'+[i]+'"><descrip type="definition">'+schvaleno+velikost+rows[i].Poznámka+'</descrip><langSet xml:lang="en-US"><tig><term>'+rows[i].Výraz+'</term></tig></langSet><langSet xml:lang="cs-CZ"><tig><term>'+rows[i].Překlad+'</term></tig></langSet></termEntry>';
      fs.appendFileSync(glossaryFile, glossaryRow);              
    }

    fs.appendFileSync(glossaryFile, footer);      

  })


  program.parseAsync();



   
