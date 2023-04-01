import { program } from "commander";
import glob from "fast-glob";
import { copyFile, readFile, writeFile } from "fs/promises";
import { basename } from "path";
import { mergeDialogue, mergeLockit } from "./build/merge.js";
import { decodeAsset, encodeAsset } from "./game/main.js";

program
  .name("build")
  .description("Building translation files");

program.command("lockit")
  .description("Build lockit assets")
  .argument("<file>", "source asset file")
  .argument("<source>", "source language file glob")
  .argument("<target>", "target asset path")
  .action(async (file, source, target) => {
    const lockitData = decodeAsset("LanguageSourceAsset", await readFile(file))
    await mergeLockit(lockitData, await glob(source));
    await writeFile(target, encodeAsset("LanguageSourceAsset", lockitData));
  });

program.command("images")
  .description("Build image asset data")
  .argument("[target]", "target image file glob", "target/images/*.png")
  .argument("[source]", "localized image file glob", "source/image/cs/*.png")
  .action(async (target, source) => {
    const sourceImages = (await glob(source)).reduce((acc, file) => {
      return Object.assign(acc, { [basename(file, ".png")]: file });
    }, {});
    for (const image of await glob(target)) {
      const lookup = basename(image).replace(/-CAB-.*$/, "");
      if (sourceImages[lookup]) {
        copyFile(sourceImages[lookup], image);
      }
    }
  });

program.command("dialogue")
  .description("Build dialogue database asset")
  .argument("<file>", "source asset file")
  .argument("<source>", "source language file")
  .argument("<target>", "target asset path")
  .action(async (file, source, target) => {
    const dialogueDatabase = decodeAsset("DialogueDatabase", await readFile(file))
    await mergeDialogue(dialogueDatabase, await glob(source));
    await writeFile(target, encodeAsset("DialogueDatabase", dialogueDatabase));
  });

program.parseAsync();
