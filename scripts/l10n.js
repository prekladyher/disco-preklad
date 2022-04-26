import chalk from "chalk";
import { program } from "commander";
import { inspect } from "util";
import { appendL10n } from "./l10n/append.js";
import { copySource } from "./l10n/copy.js";
import { calcStats, saveStats, extractAsset, validateL10n } from "./l10n/main.js";
import { mergeL10n } from "./l10n/merge.js";

(await import("dotenv")).config();

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
  .option("-p, --push", "push statistics to Google Drive")
  .action(async (base, options) => {
    const stats = calcStats(base);
    // Print detailed file statistics
    if (!options.summary || options.file) {
      stats.forEach(file => {
        console.log(
          chalk.green(`${file[0]}:\t`),
          inspect(file[1], { compact: true, breakLength: Number.MAX_SAFE_INTEGER, colors: true }));
      });
    }
    // Print statistics summary
    if (options.summary) {
      const summary = stats.map(it => it[1]).reduce((acc, cur) => {
        return Object.fromEntries(Object.keys(acc).map(key => [key, cur[key] + acc[key]]));
      });
      console.log(
        chalk.cyan(`Summary: `),
        inspect(summary, { compact: true, breakLength: Number.MAX_SAFE_INTEGER, colors: true }));
      const completion = summary.targetCount / summary.sourceCount;
      console.log(chalk.cyan("Completion: "), chalk.red((completion * 100).toFixed(2) + " %"));
    }
    // Push to Google Drive
    if (options.push) {
      console.log("Pushing statistics to Google Spreadsheet...");
      await saveStats(stats);
      console.log("Successfully pushed to Google Spreadsheet.");
    }
  });

program.command("validate")
  .description("Perform basic translation file validation")
  .argument("<base>", "base path (file or directory)")
  .action(async (base) => {
    const result = validateL10n(base);
    result.forEach(([subpath, errors]) => {
      console.log(`${chalk.green(subpath)}:`);
      errors.forEach(error => console.log(chalk.yellow(`  ${error[0]}\t`), chalk.red(error[1])));
    });
    if (result.length) {
      process.exit(1);
    }
  });

program.command("merge")
  .description("Merge translation into existing file")
  .argument("<target>", "target translation file (merge target)")
  .argument("<source>", "source translation file (merge overlay)")
  .option("-i, --ignore <ignore>", "file with ignored translations")
  .action(async (target, source, options) => {
    return mergeL10n(target, source, options.ignore);
  });

program.command("append")
  .description("Concatenate multiple translation files")
  .argument("<files...>", "list of source files or directories")
  .option("-c, --cleanup", "remove translation metadata / comments", false)
  .action((files, options) => {
    process.stdout.write(appendL10n(files, options.cleanup));
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
