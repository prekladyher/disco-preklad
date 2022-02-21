import { promises as fs } from "fs";
import { program } from "commander";
import { decode } from "./game/main.js";

program
  .name("graph")
  .description("Working with dialogue graph");

function drawConversation(id, index) {
    const conversation = index.conversations[id];
    const graphDef = [`subgraph "${escapeText(conversation.fields.Title || conversation.id)}"`];
    // Add entry definitions
    for (let entry of conversation.dialogueEntries) {
        graphDef.push(`  ${id}_${entry.id}["${entry.id} ${escapeText(entry.fields.Title || entry.id)}"]`);
        // Add outgoing links
        for (let link of entry.outgoingLinks) {
            const origin = `${link.originConversationID}_${link.originDialogueID}`;
            const destination = `${link.destinationConversationID}_${link.destinationDialogueID}`;
            graphDef.push(`  ${origin} -->|${link.priority}| ${destination}`)
        }
    }
    graphDef.push(`end`);
    return graphDef.join("\n");
}

program.command("draw")
  .description("xxx")
  .argument("<file>", "dialogue asset file")
  .argument("<conversationId>", "conversation ID")
  .action(async (file, conversationId) => {
    const database = decode("DialogueDatabase", await fs.readFile(file));
    const index = {
        actors: indexObjects(database.actors),
        conversations: indexObjects(database.conversations),
    };
    const graphDef = ["flowchart"];
    graphDef.push(drawConversation(conversationId, index).replace(/^/mg, "  "));
    console.log(graphDef.join("\n"));
  });

program.parseAsync();
