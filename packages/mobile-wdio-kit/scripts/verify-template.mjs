#!/usr/bin/env node
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const kitRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const marker = join(kitRoot, "template", "package.json");

if (!existsSync(marker)) {
  console.error(
    "[mobile-wdio-kit] template missing. If you build from the monorepo, run from repo root: npm run kit:sync",
  );
  process.exit(1);
}
