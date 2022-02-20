import { promises as fs } from "fs";
import { program } from "commander";
import { extract } from "./l10n/main.js";

program
  .name("l10n")
  .description("L10n file manipulation");

program.command("extract")
  .description("Extract l10n files")
  .argument("<files...>", "source asset files")
  .option("-b, --base <base>", "base target directory", "source/l10n")
  .action(async (files, options) => {
    for (let file of files) {
      extract(file, options.base);
    }
  });

program.parseAsync();
