import fs from "fs";
import path from "path";
import { decodeAsset } from "../game/main.js";
import { decodeEntries } from "../text/main.js";
import { writeTextFile, loadFileTree } from "./utils.js";

/**
 * Translatable dialogue fields.
 */
const DIALOGUE_FIELDS = [
  "Dialogue Text",
  "Alternate1", "Alternate2", "Alternate3", "Alternate4",
  "tooltip1", "tooltip2", "tooltip3", "tooltip4", "tooltip5",
  "tooltip6", "tooltip7", "tooltip8", "tooltip9", "tooltip10"
];

/**
 * Create metadata for dialogue entry message.
 * @param {*} index Dialogue database index.
 * @param {*} entry Dialogue entry.
 * @return Metadata to be included in the final translation entry.
 */
function createDialogueMeta(index, entry) {
  const conversation = index.conversations[entry.conversationID];
  const fields = [];
  fields.push(["Title", conversation.fields.Title]);
  fields.push(["Description", conversation.fields.Description]);
  fields.push(["Actor", index.actors[entry.fields.Actor || 0]?.fields.Name ]);
  fields.push(["Conversant", index.actors[entry.fields.Conversant || 0]?.fields.Name ]);
  return fields.filter(field => !!field[1]).map(([name, value]) => `${name} = ${value}`).join("\n");
}

/**
 * Extract dialogue data into translation templates.
 * @param {Buffer} source DialogueDatabase asset data.
 * @param {string} base Base localization directory.
 */
export function extractDialogue(source, base = "source/l10n") {
  const data = decodeAsset("DialogueDatabase", source);
  // Create dialogue data lookup index
  const index = {
    actors: Object.fromEntries(data.actors.map(it => [it.id, it])),
    items: Object.fromEntries(data.items.map(it => [it.id, it])),
    variables: Object.fromEntries(data.variables.map(it => [it.id, it])),
    conversations: Object.fromEntries(data.conversations.map(it => [it.id, it])),
  };
  // Extract translatable strings grouped by conversation identifier
  const catalog = [];
  for (let conversation of data.conversations) {
    const messages = [];
    for (let entry of conversation.dialogueEntries) {
      messages.push(...DIALOGUE_FIELDS
        .filter(field => entry.fields[field])
        .map(field => {
          return {
            "#.": createDialogueMeta(index, entry),
            "msgctxt": `${field}/${entry.fields["Articy Id"]}`,
            "msgid": entry.fields[field],
            "msgstr": ""
          };
        }));
    }
    if (messages.length) {
      catalog.push([conversation.id, messages]);
    }
  }
  // Create dialogue translation files structure
  for (let [id, messages] of catalog) {
    if (messages.length) {
      let namepath = index.conversations[id].fields.Title
        .replace(/–/g, "-") // replace n-dash with regular dash
        .replace(/[^a-z0-9 \/_-]/ig, "") // remove invalid characters
        .replace(/ *\/ */g, "/"); // remove unwanted spaces around
      let subpath = path.join(path.dirname(namepath), id + " " + path.basename(namepath + ".pot"));
      writeTextFile(path.join(base, "en/Dialogues", subpath), "en", messages);
    }
  }
}

/**
 * Extract lockit asset data into translation template file.
 * @param {string} category Translation category.
 * @param {Buffer} source LanguageSourceAsset asset data.
 * @param {string} base Base localization directory.
 */
export function extractTemplate(category, source, base = "source/l10n") {
  const data = decodeAsset("LanguageSourceAsset", source);
  const entries = data.mSource.mTerms.map(term => {
    return {
      msgctxt: term.Term,
      msgid: term.Languages[0],
      msgstr: ""
    };
  }).filter(entry => !!entry.msgid);
  writeTextFile(path.join(base, "en", category + ".pot"), "en", entries);
}

/**
 * Extract alternate translation based on preexisting templates.
 * @param {} category Translation category.
 * @param {*} source LanguageSourceAsset asset data.
 * @param {*} base Base localization directory.
 */
export function extractLanguage(category, source, base = "source/l10n") {
  const data = decodeAsset("LanguageSourceAsset", source);
  const index = Object.fromEntries(data.mSource.mTerms.map(term => [term.Term, term.Languages[0]]));
  loadFileTree(path.join(base, "en"), category === "Dialogues" ? "Dialogues" : category + ".pot")
    .forEach(subpath => {
      const merged = decodeEntries(fs.readFileSync(path.join(base, "en", subpath)).toString())
        .filter(entry => !!entry.msgid) // ignore header
        .map(entry => {
          return { ...entry, msgstr: index[entry.msgctxt] };
        });
      const code = data.mSource.mLanguages[0].Code;
      writeTextFile(path.join(base, code, subpath.substring(0, subpath.length - 1)), code, merged);
    });
}
