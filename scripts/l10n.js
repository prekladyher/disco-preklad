import { program } from "commander";
import { copySource } from "./l10n/copy.js";
import { calcStats, extractAsset } from "./l10n/main.js";
import { mergeL10n } from "./l10n/merge.js";
import chalk from "chalk";
import { inspect } from "util";

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
  .option("-f, --file", "print individual file statistics")
  .option("-s, --summary", "print overall statistics summary")
  .action(async (base, options) => {
    const stats = calcStats(base);
    if (!options.summary || options.file) {
      stats.forEach(file => {
        console.log(
          chalk.green(`${file[0]}:\t`),
          inspect(file[1], { compact: true, breakLength: Number.MAX_SAFE_INTEGER, colors: true }));
      });
    }
    if (options.summary) {
      const summary = stats.map(it => it[1]).reduce((acc, cur) => {
        return Object.fromEntries(Object.keys(acc).map(key => [key, cur[key] + acc[key]]))
      });
      console.log(
        chalk.cyan(`Summary: `),
        inspect(summary, { compact: true, breakLength: Number.MAX_SAFE_INTEGER, colors: true }));
      const completion = summary.targetCount / summary.sourceCount;
      console.log(chalk.cyan("Completion: "), chalk.red(completion.toFixed(2) + " %"));
    }
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
