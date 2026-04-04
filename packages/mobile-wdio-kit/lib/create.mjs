import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
  copyFileSync,
  rmSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));

function templateRoot() {
  return resolve(__dirname, "..", "template");
}

/** Resolve `~/...` even when the shell did not expand it (e.g. quoted path). */
function expandUserDir(targetDir) {
  const t = String(targetDir).trim();
  if (t === "~") return homedir();
  if (t.startsWith("~/") || t.startsWith("~\\")) {
    return join(homedir(), t.slice(2));
  }
  return t;
}

function kebabName(raw) {
  return String(raw || "mobile-wdio-project")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "") || "mobile-wdio-project";
}

/**
 * @param {{ targetDir: string; force?: boolean; skipInstall?: boolean; skipDemoApk?: boolean; projectName?: string }} opts
 */
export function createProject(opts) {
  const template = templateRoot();
  if (!existsSync(join(template, "package.json"))) {
    throw new Error(
      "Template missing in mobile-wdio-kit. If you develop the kit from git, run: npm run kit:sync (repo root).",
    );
  }

  const targetAbs = resolve(expandUserDir(opts.targetDir));
  const name = kebabName(opts.projectName ?? basename(targetAbs));

  if (existsSync(targetAbs)) {
    const entries = readDirSafe(targetAbs);
    if (entries.length > 0 && !opts.force) {
      throw new Error(
        `Target directory is not empty: ${targetAbs}\nUse --force to overwrite.`,
      );
    }
    if (entries.length > 0 && opts.force) {
      rmSync(targetAbs, { recursive: true, force: true });
    }
  }

  mkdirSync(targetAbs, { recursive: true });
  cpSync(template, targetAbs, { recursive: true });

  const pkgPath = join(targetAbs, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.name = name;
  delete pkg.private;
  if (!pkg.description) {
    pkg.description = "WebdriverIO mobile tests + Appium + Cursor MCP (scaffolded).";
  }
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

  const envExample = join(targetAbs, ".env.example");
  const envDest = join(targetAbs, ".env");
  if (existsSync(envExample) && !existsSync(envDest)) {
    copyFileSync(envExample, envDest);
  }

  if (!opts.skipInstall) {
    const npm = process.platform === "win32" ? "npm.cmd" : "npm";
    const install = spawnSync(npm, ["install"], {
      cwd: targetAbs,
      stdio: "inherit",
      shell: process.platform === "win32",
      env: process.env,
    });
    if (install.status !== 0) {
      throw new Error("`npm install` failed in the new project.");
    }
  }

  if (!opts.skipDemoApk && !opts.skipInstall) {
    const dl = join(targetAbs, "scripts", "download-demo-android.mjs");
    if (existsSync(dl)) {
      const r = spawnSync(process.execPath, [dl], {
        cwd: targetAbs,
        stdio: "inherit",
        env: process.env,
      });
      if (r.status !== 0) {
        console.warn(
          "[mobile-wdio-kit] Demo APK download failed — run `npm run setup:demo-android` inside the project.",
        );
      }
    }
  }

  return { targetAbs, name };
}

function basename(p) {
  const s = p.replace(/[/\\]+$/, "");
  const i = Math.max(s.lastIndexOf("/"), s.lastIndexOf("\\"));
  return i >= 0 ? s.slice(i + 1) : s;
}

function readDirSafe(dir) {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}
