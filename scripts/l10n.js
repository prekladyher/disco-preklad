import chalk, { supportsColor } from "chalk";
import { program } from "commander";
import FastGlob from "fast-glob";
import { inspect } from "util";
import { appendL10n } from "./l10n/append.js";
import { autofixL10n } from "./l10n/autofix.js";
import { copySource } from "./l10n/copy.js";
import { calcStats, extractAsset, saveStats, validateL10n } from "./l10n/main.js";
import { mergeL10n } from "./l10n/merge.js";
import { default as Spellchecker } from "hunspell-spellchecker";
import { readFile } from "fs/promises";
import { loadFileTree } from "./l10n/utils.js";
import { decodeEntries } from "./text/main.js";
import { join } from "path";

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
          inspect(file[1], { compact: true, breakLength: Number.MAX_SAFE_INTEGER, colors: !!supportsColor }));
      });
    }
    // Print statistics summary
    if (options.summary) {
      const summary = stats.map(it => it[1]).reduce((acc, cur) => {
        return Object.fromEntries(Object.keys(acc).map(key => [key, cur[key] + acc[key]]));
      });
      console.log(
        chalk.cyan(`Summary: `),
        inspect(summary, { compact: true, breakLength: Number.MAX_SAFE_INTEGER, colors: !!supportsColor }));
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
  .option("-m, --mark", "mark invalid entries as fuzzy")
  .action((base, { mark }) => {
    const result = validateL10n(base, mark);
    result.forEach(([subpath, errors]) => {
      console.log(`${chalk.green(subpath)}:`);
      errors.forEach(error => console.log(chalk.yellow(`  ${error[0]}\t`), chalk.red(error[1])));
    });
    if (result.length) {
      process.exit(1);
    }
  });

program.command("spellcheck")
  .argument("<base>", "base path (file or directory)")
  .action(async (base) => {
    const checker = new Spellchecker();
    checker.use(checker.parse({
      aff: await readFile("./target/check/cs_CZ.aff"),
      dic: await readFile("./target/check/cs_CZ.dic")
    }));
    for (const file of await loadFileTree(base, "")) {
      decodeEntries(await readFile(join(base, file), "utf-8"))
        .filter(entry => entry.msgctxt && entry.msgstr)
        .forEach(entry => {
          const errors = [];
          entry.msgstr
            .split(/[^\p{L}]+/u)
            .filter(word => /\w/u.test(word))
            .forEach(word => checker.check(word) || errors.push(word));
          if (errors.length) {
            console.log(`${file}\t${entry.msgctxt}\t${errors.join(" ")}`);
          }
        });
    }
  });

program.command("merge")
  .description("Merge translation into existing file")
  .argument("<source>", "source translation file (merge overlay)")
  .argument("<targets...>", "target translation files (merge target)")
  .option("-i, --ignore <ignore>", "file with ignored translations")
  .option("-g, --glob", "interpret target files as glob patterns")
  .option("-h, --header", "keep source file header")
  .action(async (source, targets, options) => {
    const resolvedTargets = options.glob ? await FastGlob(targets) : targets;
    return mergeL10n(source, options.header, options.ignore, ...resolvedTargets);
  });

program.command("append")
  .description("Concatenate multiple translation files")
  .argument("<files...>", "list of source files or directories")
  .option("-g, --glob", "interpret files as glob patterns")
  .option("-c, --cleanup", "remove translation metadata / comments", false)
  .action(async (files, options) => {
    const resolvedFiles = options.glob ? await FastGlob(files) : files;
    process.stdout.write(appendL10n(resolvedFiles, options.cleanup));
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

program.command("autofix")
  .description("Automatically fix common translation errors")
  .argument("<base>", "base path (file or directory)")
  .action(async (base) => {
    autofixL10n(base);
  });

program.parseAsync();
