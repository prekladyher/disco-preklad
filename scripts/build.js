import { program } from "commander";
import glob from "fast-glob";
import { readFile, writeFile } from "fs/promises";
import { mergeLockit } from "./build/lockit.js";

program
  .name("build")
  .description("Building translation files");

program.command("lockit")
  .description("Build lockit asset files")
  .argument("<target>", "target asset path")
  .argument("<source>", "source language file glob")
  .action(async (target, source) => {
    const lockitData = JSON.parse(await readFile(target, 'utf-8'));
    await mergeLockit(lockitData, await glob(source));
    await writeFile(target, JSON.stringify(lockitData, null, '  '), 'utf-8');
  });

program.parseAsync();
