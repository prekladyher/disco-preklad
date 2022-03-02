import { program } from "commander";
import { calcStats, extractAsset } from "./l10n/main.js";
import { mergeL10n } from "./l10n/merge.js";
import { copySource } from "./l10n/copy.js";

program
  .name("l10n")
  .description("L10n file manipulation");

program.command("extract")
  .description("Extract l10n files")
  .argument("<files...>", "source asset files")
  .option("-b, --base <base>", "base localization directory.", "source/l10n")
  .action(async (files, options) => {
    for (let file of files) {
      extractAsset(file, options.base);
    }
  });

program.command("stats")
  .description("Provide simple translation statistics")
  .argument("<base>", "base path (file or directory)")
  .action(async (base) => {
    calcStats(base).forEach(stats => console.log(JSON.stringify(stats)));
  });

program.command("merge")
  .description("Merge translation into existing file")
  .argument("<source>", "source translation file")
  .argument("<target>", "target translation file")
  .option("-i, --ignore <ignore>", "file with ignored translations")
  .action(async (source, target, options) => {
    return mergeL10n(source, target, options.ignore);
  });

program.command("copy")
  .description("Copy source string as translation")
  .argument("<files...>", "translation files to process")
  .option("-r, --regexp <regexp>", "source string matcher")
  .action(async (files, options) => {
    const regexp = new RegExp(options.regexp);
    for (let file of files) {
      copySource(file, regexp);
    }
  });

program.parseAsync();
