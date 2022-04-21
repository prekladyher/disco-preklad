import fs from "fs";
import { program } from "commander";
import deepl from "deepl-node";
import * as auth from './auth.js'
import { decodeEntries } from "./text/main.js";
import { encodeTextFile,writeTextFile } from "./l10n/utils.js"; 

const sourceDirBase = "./source/l10n/cs/Dialogues/";
const translator = new deepl.Translator(auth.deeplAuth);
const usage = await translator.getUsage();
let mark = "DEEPL: ";

function translate(sourceFile, nomark){
  console.log('File: '+sourceFile);
  let data = decodeEntries(fs.readFileSync(sourceFile).toString()).filter(entry => !!entry.msgid); 

  data.forEach(el => {
    translator  
    .translateText(el.msgid, null, 'cs')
    .then((result) => {
      if (nomark) mark = "";
      el.msgstr = mark+result.text.toString().replace(/[^ěščřžýáíéóúůďťňĎŇŤŠČŘŽÝÁÍÉÚŮĚÓa-zA-Z]*$/gi, '');
      writeTextFile(sourceFile.replace('/l10n/' ,'/deepl/'), encodeTextFile('cs', data));  
      console.log('Translating... '+el.msgctxt);  
    })
    .catch((error) => {
        console.error(error);
    });
  })

}  



program
  .command('stats')
  .action((options) => {
    if (usage.anyLimitReached()) {
        console.log('Translation limit exceeded.');
    }
    if (usage.character) {
        console.log(`Characters: ${usage.character.limit-usage.character.count}`);
    }
  });  



program
  .option('-f, --file <string>', 'File to translate')
  .option('-d, --dir <string>', 'Dir to translate')
  .option('-nm, --nomark', 'No deepl marking')
  .action((options) => {

    if (options.file){
      let sourceFile = sourceDirBase+options.file;
      translate(sourceFile, options.nomark);
    } else if (options.dir){
      let sourceDir = sourceDirBase+options.dir+'/';
      fs.readdirSync(sourceDir).forEach(file => {
        let sourceFile = sourceDir+file;
        translate(sourceFile, options.nomark);
      });  
    } else {
      console.log('You must specify file or directory.');
    } 
    
  }); 

program.parse(process.argv);