import { readFile } from "fs/promises";
import { decodeEntries } from "../text/main.js";

/**
 * Load translation sources.
 */
async function loadSources(sources) {
  const entryMap = {};
  for (const source of sources) {
    for (const entry of decodeEntries(await readFile(source, 'utf-8'))) {
      if (entry.msgstr) {
        entryMap[entry.msgctxt] = entry.msgstr;
      }
    }
  }
  return entryMap;
}


/**
 * Merge translation with lockit asset.
 */
export async function mergeLockit(lockitData, sources) {
  const entryMap = await loadSources(sources);
  for (const term of lockitData.mSource.mTerms) {
    if (entryMap[term.Term]) {
      term.Languages[0] = entryMap[term.Term];
    }
  }
}


/**
 * Merge translation with dialogue database asset.
 */
export async function mergeDialogue(database, sources) {
  const entryMap = await loadSources(sources);
  for (let conversation of database.conversations) {
    for (let entry of conversation.dialogueEntries) {
      const entryId = entry.fields["Articy Id"];
      for (let field of Object.keys(entry.fields)) {
        const translation = entryMap[`${field}/${entryId}`];
        if (translation) {
          entry.fields[field] = translation;
        }
      }
    }
  }
}
