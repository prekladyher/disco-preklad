import fs from "fs";
import path from "path";
import { decode } from "../game/main.js";
import { encodeEntries } from "../text/main.js";

/**
 * Translatable dialogue fields.
 */
const DIALOGUE_FIELDS = [
  "Dialogue Text",
  "Alternate1", "Alternate2", "Alternate3", "Alternate4",
  "tooltip1", "tooltip2", "tooltip3", "tooltip4", "tooltip5",
  "tooltip6", "tooltip7", "tooltip8", "tooltip9", "tooltip10"
];

export function extract(file, base) {
  if (path.basename(file).startsWith("Dialogue")) {
    extractDialogue(fs.readFileSync(file), base);
  } else {
    extractLanguage(fs.readFileSync(file), base);
  }
}

export function extractDialogue(source, base) {
  const database = decode("DialogueDatabase", source);
  const index = createDialogueIndex(database);
  const batches = {};
  for (let conversation of database.conversations) {
    let batch = [];
    for (let dialogue of conversation.dialogueEntries) {
      for (let field of DIALOGUE_FIELDS) {
        if (dialogue.fields[field] !== undefined) {
          batch.push(createDialogueMessage(index, conversation, dialogue, field));
        }
      }
      if (batch.length > 0) {
        batches[conversation.fields.Title] = batch;
      }
    }
  }
  for (let [id, batch] of Object.entries(batches)) {
    let slug = id.replace(/[?'!:]/g, "").replace(/–/g, "-").replace(/ *\/ */g, "/");
    if (slug.match(/[^a-z0-9 \/_-]/i)) {
      throw new Error(`Invalid conversation ID: ${id}`);
    }
    writeTextFile(`${path.join(base, "en", slug)}.pot`, batch);
  }
}

function createDialogueIndex(database) {
  return {
    actors: database.actors.reduce((acc, entry) => { acc[entry.id] = entry; return acc }, {}),
    items: database.items.reduce((acc, entry) => { acc[entry.id] = entry; return acc }, {}),
    variables: database.variables.reduce((acc, entry) => { acc[entry.id] = entry; return acc }, {}),
  };
}

function createDialogueMessage(index, conversation, dialogue, field) {
  const meta = [
    `Title = ${conversation.fields.Title}`,
    `Description = ${conversation.fields.Description}`
  ];
  if (dialogue.fields.Actor && dialogue.fields.Actor !== "0") {
    meta.push(`Actor = ${index.actors[dialogue.fields.Actor].fields.Name}`);
  }
  if (dialogue.fields.Conversant && dialogue.fields.Conversant !== "0") {
    meta.push(`Conversant = ${index.actors[dialogue.fields.Conversant].fields.Name}`);
  }
  return {
    "#.": meta.join("\n"),
    "msgctx": `${field}/${dialogue.fields["Articy Id"]}`,
    "msgid": dialogue.fields[field],
    "msgstr": ""
  };
}

function writeTextFile(filepath, entries) {
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, encodeEntries(entries));
}

export function extractLanguage(source, base) {
  const language = decode("LanguageSourceAsset", source);
}
