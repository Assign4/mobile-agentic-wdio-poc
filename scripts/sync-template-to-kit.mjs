#!/usr/bin/env node
/**
 * Copies this repo into packages/mobile-wdio-kit/template (excluding heavy/ephemeral paths)
 * and merges package.json so scaffolded projects can run `npm run doctor`.
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const kitRoot = join(repoRoot, "packages", "mobile-wdio-kit");
const destRoot = join(kitRoot, "template");

function shouldSkip(relPosix) {
  if (relPosix === "" || relPosix === ".") return false;
  const top = relPosix.split("/")[0];
  if (
    top === "node_modules" ||
    top === ".git" ||
    top === "artifacts" ||
    top === "coverage" ||
    top === "packages" ||
    top === "dist"
  ) {
    return true;
  }
  if (relPosix === ".env" || relPosix.endsWith("/.env")) return true;
  if (relPosix === "package-lock.json") return true;
  if (relPosix === "RELEASING.md") return true;
  if (relPosix.endsWith(".apk")) return true;
  if (relPosix.includes(".app/") || relPosix.endsWith(".app")) return true;
  if (
    relPosix === "scripts/sync-template-to-kit.mjs" ||
    relPosix === "scripts/verify-kit-template.mjs"
  ) {
    return true;
  }
  return false;
}

function copyTree(srcDir, destDir, baseRel = "") {
  mkdirSync(destDir, { recursive: true });
  for (const name of readdirSync(srcDir)) {
    const rel = baseRel ? `${baseRel}/${name}` : name;
    const relPosix = rel.replace(/\\/g, "/");
    if (shouldSkip(relPosix)) continue;

    const from = join(srcDir, name);
    const to = join(destDir, name);
    const st = statSync(from);
    if (st.isDirectory()) {
      copyTree(from, to, rel);
    } else if (st.isFile()) {
      copyFileSync(from, to);
    }
  }
}

if (!existsSync(kitRoot)) {
  console.error(`Kit root missing: ${kitRoot}`);
  process.exit(1);
}

console.log(`Sync template → ${destRoot}`);
if (existsSync(destRoot)) {
  rmSync(destRoot, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
mkdirSync(destRoot, { recursive: true });
copyTree(repoRoot, destRoot);

copyFileSync(
  join(kitRoot, "lib", "doctor.mjs"),
  join(destRoot, "scripts", "mobile-wdio-doctor-core.mjs"),
);
copyFileSync(join(kitRoot, "lib", "doctor-cli.mjs"), join(destRoot, "scripts", "doctor-cli.mjs"));

const doctorRunner = `#!/usr/bin/env node
import { printDoctorResult, runDoctor } from "./mobile-wdio-doctor-core.mjs";
import { createDoctorMain } from "./doctor-cli.mjs";

const runDoctorMain = createDoctorMain({ runDoctor, printDoctorResult });
const code = await runDoctorMain(process.argv.slice(2));
process.exit(code);
`;
writeFileSync(join(destRoot, "scripts", "doctor-runner.mjs"), doctorRunner, {
  mode: 0o755,
});

const pkgPath = join(destRoot, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

pkg.private = false;
pkg.description =
  "WebdriverIO + Appium mobile tests, Cursor MCP, Vitest (scaffolded via mobile-wdio-kit).";
pkg.scripts = {
  ...pkg.scripts,
  doctor: "node scripts/doctor-runner.mjs --cwd .",
  "setup:demo-android": "node scripts/download-demo-android.mjs",
};

if (pkg.devDependencies?.["mobile-wdio-kit"]) {
  delete pkg.devDependencies["mobile-wdio-kit"];
}

delete pkg.scripts["kit:sync"];

writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

console.log(
  `Done. Vendored doctor into template/scripts (no registry dep).\nRemember: APK and .app bundles are excluded — create runs setup:demo-android.`,
);
