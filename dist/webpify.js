#!/usr/bin/env node

// webpify.ts
import sharp from "sharp";
import { parseArgs } from "util";
import { basename, dirname, extname, join } from "path";
import { existsSync } from "fs";
function printHelp() {
  console.log(`
webpify - Convert images to WebP format

Usage: webpify <file> [options]

Options:
  -q, --quality <n>  Set quality (1-100, default: 80)
  -o, --output <path>  Output file path (default: same as input with .webp extension)
  -h, --help         Show this help message
  -v, --version      Show version

Examples:
  webpify image.png
  webpify image.jpg -q 90
  webpify image.png -o converted/image.webp
`);
}
function parseCliArgs() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      quality: { type: "string", short: "q", default: "80" },
      output: { type: "string", short: "o" },
      help: { type: "boolean", short: "h", default: false },
      version: { type: "boolean", short: "v", default: false }
    },
    allowPositionals: true
  });
  if (values.help) {
    printHelp();
    process.exit(0);
  }
  if (values.version) {
    console.log("webpify v0.1.0");
    process.exit(0);
  }
  if (positionals.length === 0) {
    console.error("Error: No input file specified\n");
    printHelp();
    process.exit(1);
  }
  const quality = parseInt(values.quality, 10);
  if (isNaN(quality) || quality < 1 || quality > 100) {
    console.error("Error: Quality must be a number between 1 and 100");
    process.exit(1);
  }
  return {
    inputFile: positionals[0],
    options: {
      quality,
      output: values.output
    }
  };
}
function getOutputPath(inputFile, outputOption) {
  if (outputOption) {
    return outputOption;
  }
  const dir = dirname(inputFile);
  const name = basename(inputFile, extname(inputFile));
  return join(dir, `${name}.webp`);
}
async function convertToWebp(inputFile, outputFile, quality) {
  const image = sharp(inputFile);
  const metadata = await image.metadata();
  await image.webp({
    quality
    // Maintain original size - no resizing
  }).toFile(outputFile);
  console.log(`\u2705 Converted: ${inputFile} \u2192 ${outputFile}`);
  console.log(`   Dimensions: ${metadata.width}x${metadata.height}`);
  console.log(`   Quality: ${quality}`);
}
async function main() {
  const parsed = parseCliArgs();
  if (!parsed) return;
  const { inputFile, options } = parsed;
  if (!existsSync(inputFile)) {
    console.error(`Error: File not found: ${inputFile}`);
    process.exit(1);
  }
  const outputFile = getOutputPath(inputFile, options.output);
  await convertToWebp(inputFile, outputFile, options.quality);
}
main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
