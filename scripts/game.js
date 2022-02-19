import { promises as fs } from "fs";
import { program } from "commander";
import { decode } from "./game/main.js";

const INSPECT_OPTS = {
  depth: null,
  maxArrayLength: Infinity,
  maxStringLength: Infinity,
  breakLength: Infinity,
  showHidden: false,
  compact: false
};

program
  .name("source")
  .description("Handling Disco Elysium game files");

program.command("read")
  .description("Extract Unity script data into JSON model")
  .argument("<type>", "asset data type ('LanguageSourceAsset' or 'DialogueDatabase'")
  .argument("<file>", "script data file")
  .option("-p, --path <path>", "JSON path transform (e.g. '$.mSource.mTerms[*].Term')")
  .option("-d, --depth <depth>", "inspection path depth")
  .action(async (type, file, options) => {
    const decoded = decode(type, await fs.readFile(file));
    const inspect = { ...INSPECT_OPTS };
    if (options.depth !== undefined) {
      inspect.depth = parseInt(options.depth, 10);
    }
    if (options.path) {
      const { JSONPath } = await import("jsonpath-plus");
      console.dir(JSONPath({ path: options.path, json: decoded }), inspect);
    } else {
      console.dir(decoded, inspect);
    }
  });

program.parseAsync();
