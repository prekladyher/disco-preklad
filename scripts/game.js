import { program } from "commander";
import { promises as fs } from "fs";
import { decodeAsset } from "./game/main.js";

const INSPECT_OPTS = {
  depth: null,
  maxArrayLength: Infinity,
  maxStringLength: Infinity,
  breakLength: Infinity,
  showHidden: false,
  compact: false
};

program
  .name("game")
  .description("Handling Disco Elysium game files");

program.command("read")
  .description("Extract Unity script data into JSON model")
  .argument("<type>", "asset data type ('LanguageSourceAsset' or 'DialogueDatabase')")
  .argument("<file>", "script data file")
  .option("-p, --path <path>", "JSON path transform (e.g. '$.mSource.mTerms[*].Term')")
  .option("-d, --depth <depth>", "inspection path depth")
  .option("-j, --json", "return as valid JSON")
  .action(async (type, file, options) => {
    let decoded = decodeAsset(type, await fs.readFile(file));
    if (options.path) {
      const { JSONPath } = await import("jsonpath-plus");
      decoded = JSONPath({ path: options.path, json: decoded });
    }
    if (options.json) {
      BigInt.prototype.toJSON = value => value|0;
      console.log(JSON.stringify(decoded, null, "  "));
    } else {
      console.dir(decoded, {
        depth: options.depth !== undefined ? parseInt(options.depth, 10) : Infinity,
        ...INSPECT_OPTS
      });
    }
  });

program.parseAsync();
