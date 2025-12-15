#!/usr/bin/env npx tsx

/**
 * Build script - Compiles webpify.ts into a standalone executable
 *
 * Usage:
 *   npx tsx build.ts           # Build for current platform
 *   npx tsx build.ts --install # Build and install to ~/.local/bin
 */

import { execSync } from "child_process";
import {
  copyFileSync,
  mkdirSync,
  chmodSync,
  existsSync,
  writeFileSync,
  readFileSync,
} from "fs";
import { join } from "path";

const ENTRY_FILE = "webpify.ts";
const OUTPUT_NAME = "webpify";
const INSTALL_DIR = join(process.env.HOME!, ".local", "bin");
const LIB_DIR = join(process.env.HOME!, ".local", "lib", "webpify");

// Read version from package.json
const pkg = JSON.parse(readFileSync("package.json", "utf-8"));

async function build() {
  const args = process.argv.slice(2);
  const shouldInstall = args.includes("--install");

  console.log("🔨 Building webpify...");

  try {
    // Compile TypeScript to JavaScript bundle using esbuild
    // sharp is marked external because it has native bindings that can't be bundled
    execSync(
      `npx esbuild ${ENTRY_FILE} --bundle --platform=node --outfile=dist/${OUTPUT_NAME}.js --format=esm --external:sharp --banner:js="#!/usr/bin/env node"`,
      { stdio: "inherit" }
    );

    console.log(`✅ Built: dist/${OUTPUT_NAME}.js`);

    if (shouldInstall) {
      // Ensure directories exist
      if (!existsSync(INSTALL_DIR)) {
        mkdirSync(INSTALL_DIR, { recursive: true });
      }
      if (!existsSync(LIB_DIR)) {
        mkdirSync(LIB_DIR, { recursive: true });
      }

      // Copy the main script to lib directory
      copyFileSync(
        `dist/${OUTPUT_NAME}.js`,
        join(LIB_DIR, `${OUTPUT_NAME}.js`)
      );

      // Create package.json for dependencies (includes version for --version flag)
      writeFileSync(
        join(LIB_DIR, "package.json"),
        JSON.stringify(
          {
            name: "webpify",
            version: pkg.version,
            type: "module",
            dependencies: { sharp: "^0.34.0" },
          },
          null,
          2
        )
      );

      // Install sharp in the lib directory
      console.log("📦 Installing dependencies...");
      execSync("npm install --omit=dev", { cwd: LIB_DIR, stdio: "inherit" });

      // Create a wrapper script in bin that runs from lib directory
      const wrapperScript = `#!/bin/bash
exec node "${join(LIB_DIR, `${OUTPUT_NAME}.js`)}" "$@"
`;
      const destPath = join(INSTALL_DIR, OUTPUT_NAME);
      writeFileSync(destPath, wrapperScript);
      chmodSync(destPath, 0o755);

      console.log(`✅ Installed to: ${destPath}`);
      console.log(`\nMake sure ${INSTALL_DIR} is in your PATH:`);
      console.log(`  export PATH="$PATH:${INSTALL_DIR}"`);
    }
  } catch (error) {
    console.error("❌ Build failed");
    process.exit(1);
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
