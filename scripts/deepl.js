import fs from "fs";
import { program } from "commander";
import translate from "deepl";
import * as auth from './auth.js'
import { decodeEntries } from "./text/main.js";
import { encodeTextFile,writeTextFile } from "./l10n/utils.js"; 

const sourceDirBase = "./source/l10n/cs/Dialogues/";

function deeplTranslate(string, callback){
  translate({
    free_api: true,
    text: string,
    source_lang: 'EN',
    target_lang: 'CS',
    auth_key: auth.deeplAuth,
  }).then(result => {          
    callback(result.data.translations[0].text);
  })
  .catch(error => {
      console.error(error)
  })
}


program
  .option('-f, --file <string>', 'File to translate')
  .option('-d, --dir <string>', 'Dir to translate')
  .option('-nm, --nomark', 'No deepl marking')
  .action((options) => {

    let mark = "DEEPL: ";

    if (options.file){
      console.log('File: '+sourceDirBase+options.file);
      let sourceFile = sourceDirBase+options.file;
      let data = decodeEntries(fs.readFileSync(sourceFile).toString()).filter(entry => !!entry.msgid); 

      data.forEach(el => {
        deeplTranslate(el.msgid, function(translation) {    
          if (options.nomark) mark = "";
          el.msgstr = mark+translation.toString().replace(/[^ěščřžýáíéóúůďťňĎŇŤŠČŘŽÝÁÍÉÚŮĚÓa-zA-Z]*$/gi, '');
          writeTextFile(sourceFile.replace('/l10n/' ,'/deepl/'), encodeTextFile('cs', data));  
          console.log('Translating... '+el.msgctxt);   
        });
      })
      
    } else if (options.dir){
      console.log('Directory: '+sourceDirBase+options.dir);
      let sourceDir = sourceDirBase+options.dir+'/';

      fs.readdirSync(sourceDir).forEach(file => {
        console.log('File to translate: '+file);
        let sourceFile = sourceDir+file;
        let data = decodeEntries(fs.readFileSync(sourceFile).toString()).filter(entry => !!entry.msgid); 

        data.forEach(el => {
          deeplTranslate(el.msgid, function(translation) {  
            if (options.nomark) mark = "";
            el.msgstr = mark+translation.toString().replace(/[^ěščřžýáíéóúůďťňĎŇŤŠČŘŽÝÁÍÉÚŮĚÓa-zA-Z]*$/gi, '');
            writeTextFile(sourceFile.replace('/l10n/' ,'/deepl/'), 'cs', data);  
            console.log('Translating... '+el.msgctxt);          
          });
        })

      })  


    } else {
      console.log('You must specify file or directory.');
    } 




}); 



program.parse(process.argv);