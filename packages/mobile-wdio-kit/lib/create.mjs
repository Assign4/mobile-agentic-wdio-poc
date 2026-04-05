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
import { createCliTheme } from "./cli-theme.mjs";
import {
  evaluateCreatePreflight,
  formatPreflightFailure,
  MIN_NODE_CREATE,
} from "./create-preflight.mjs";
import {
  startSpinner,
  stopSpinnerForSubprocess,
  succeedSpinner,
  shouldShowSpinner,
} from "./long-task.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

function templateRoot() {
  return resolve(__dirname, "..", "template");
}

function npmOnPath() {
  const cmd = process.platform === "win32" ? "where" : "which";
  const r = spawnSync(cmd, ["npm"], {
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  return (r.status ?? 1) === 0;
}

/** @param {ReturnType<typeof createCliTheme>} theme */
function logCreate(theme, message) {
  process.stderr.write(`${theme.dim("mobile-wdio-kit")}  ${message}\n`);
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
  return (
    String(raw || "mobile-wdio-project")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "") || "mobile-wdio-project"
  );
}

/**
 * @param {{ targetDir: string; force?: boolean; skipInstall?: boolean; skipDemoApk?: boolean; skipDemoIos?: boolean; projectName?: string }} opts
 */
export function createProject(opts) {
  const theme = createCliTheme();
  const template = templateRoot();
  const pre = evaluateCreatePreflight({
    nodeVersion: process.version,
    npmOnPath: npmOnPath(),
    templatePkgExists: existsSync(join(template, "package.json")),
    minNode: MIN_NODE_CREATE,
  });
  if (!pre.ok) {
    throw new Error(
      formatPreflightFailure(pre, {
        fail: theme.fail,
        fix: theme.fix,
        dim: theme.dim,
      }),
    );
  }

  logCreate(theme, theme.ok("Starting project setup…"));
  logCreate(theme, "Template found — WebdriverIO + Appium scaffold.");

  const targetAbs = resolve(expandUserDir(opts.targetDir));
  const name = kebabName(opts.projectName ?? basename(targetAbs));
  logCreate(theme, `Target directory: ${targetAbs}`);
  logCreate(theme, `package.json name: ${name}`);

  if (existsSync(targetAbs)) {
    const entries = readDirSafe(targetAbs);
    if (entries.length > 0 && !opts.force) {
      throw new Error(`Target directory is not empty: ${targetAbs}\nUse --force to overwrite.`);
    }
    if (entries.length > 0 && opts.force) {
      logCreate(theme, theme.warn("Removing existing directory (--force)…"));
      rmSync(targetAbs, { recursive: true, force: true });
    }
  }

  const copySpin = startSpinner("Copying template files…", process.stderr);
  if (!copySpin) logCreate(theme, "Creating folder and copying template files…");
  mkdirSync(targetAbs, { recursive: true });
  cpSync(template, targetAbs, { recursive: true });
  succeedSpinner(copySpin, "Template copy complete (configs, specs, scripts, patches).");
  if (!copySpin) logCreate(theme, "Template copy complete (configs, specs, scripts, patches).");

  const pkgPath = join(targetAbs, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.name = name;
  delete pkg.private;
  if (!pkg.description) {
    pkg.description = "WebdriverIO mobile tests + Appium + Cursor MCP (scaffolded).";
  }
  logCreate(theme, "Writing package.json (project name, public package)…");
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

  const envExample = join(targetAbs, ".env.example");
  const envDest = join(targetAbs, ".env");
  if (existsSync(envExample) && !existsSync(envDest)) {
    logCreate(theme, "Creating .env from .env.example…");
    copyFileSync(envExample, envDest);
  } else if (existsSync(envDest)) {
    logCreate(theme, "Keeping existing .env (already present).");
  }

  if (!opts.skipInstall) {
    const spin = startSpinner("Preparing npm install (often 1–3 minutes)…", process.stderr);
    stopSpinnerForSubprocess(spin, "Running npm install — full output below (often 1–3 minutes)");
    if (!spin) {
      logCreate(theme, "Running npm install in the new project (this often takes 1–3 minutes)…");
    } else {
      process.stderr.write(theme.dim("────────────────────────────────────────\n"));
    }
    const npm = process.platform === "win32" ? "npm.cmd" : "npm";
    const install = spawnSync(npm, ["install"], {
      cwd: targetAbs,
      stdio: "inherit",
      shell: process.platform === "win32",
      env: process.env,
    });
    if (install.status !== 0) {
      throw new Error(
        "`npm install` failed in the new project. Fix registry/network, then cd into the project and run: npm install",
      );
    }
    if (shouldShowSpinner(process.stderr)) {
      process.stderr.write(theme.ok("✓ npm install finished\n"));
    } else {
      logCreate(theme, "npm install finished.");
    }
  } else {
    logCreate(
      theme,
      theme.warn(
        "Skipped npm install (--no-install). Run npm install inside the project when ready.",
      ),
    );
  }

  if (!opts.skipDemoApk && !opts.skipInstall) {
    const dl = join(targetAbs, "scripts", "download-demo-android.mjs");
    if (existsSync(dl)) {
      const dSpin = startSpinner("Downloading demo Android APK (~105 MB)…", process.stderr);
      stopSpinnerForSubprocess(dSpin, "Downloading demo APK — progress below");
      if (!dSpin) {
        logCreate(theme, "Downloading WebdriverIO native demo Android APK (~105 MB)…");
      } else {
        process.stderr.write(theme.dim("────────────────────────────────────────\n"));
      }
      const r = spawnSync(process.execPath, [dl], {
        cwd: targetAbs,
        stdio: "inherit",
        env: process.env,
      });
      if (r.status !== 0) {
        process.stderr.write(
          theme.warn(
            "[mobile-wdio-kit] Demo APK download failed — run `npm run setup:demo-android` inside the project.\n",
          ),
        );
      } else if (shouldShowSpinner(process.stderr)) {
        process.stderr.write(theme.ok("✓ Demo APK saved under apps/.\n"));
      } else {
        logCreate(theme, "Demo APK saved under apps/.");
      }
    }
  } else if (opts.skipDemoApk) {
    logCreate(
      theme,
      theme.dim(
        "Skipped demo APK (--no-demo-apk). Set ANDROID_APP_PATH or run npm run setup:demo-android later.",
      ),
    );
  } else if (opts.skipInstall) {
    logCreate(
      theme,
      theme.dim(
        "Skipped demo APK (npm install was skipped — run setup:demo-android after npm install).",
      ),
    );
  }

  if (process.platform === "darwin" && !opts.skipDemoIos && !opts.skipInstall) {
    const dlIos = join(targetAbs, "scripts", "download-demo-ios.mjs");
    if (existsSync(dlIos)) {
      const iSpin = startSpinner("Downloading demo iOS app (~16 MB zip)…", process.stderr);
      stopSpinnerForSubprocess(iSpin, "Downloading demo iOS app — progress below");
      if (!iSpin) {
        logCreate(theme, "Downloading WebdriverIO native demo iOS Simulator app (~16 MB zip)…");
      } else {
        process.stderr.write(theme.dim("────────────────────────────────────────\n"));
      }
      const ri = spawnSync(process.execPath, [dlIos], {
        cwd: targetAbs,
        stdio: "inherit",
        env: process.env,
      });
      if (ri.status !== 0) {
        process.stderr.write(
          theme.warn(
            "[mobile-wdio-kit] Demo iOS app download failed — run `npm run setup:demo-ios` inside the project.\n",
          ),
        );
      } else if (shouldShowSpinner(process.stderr)) {
        process.stderr.write(theme.ok("✓ Demo iOS app saved under apps/ios-demo.app.\n"));
      } else {
        logCreate(theme, "Demo iOS app saved under apps/ios-demo.app.");
      }
    }
  } else if (opts.skipDemoIos) {
    logCreate(
      theme,
      theme.dim(
        "Skipped demo iOS app (--no-demo-ios). Set IOS_APP_PATH or run npm run setup:demo-ios later.",
      ),
    );
  } else if (process.platform !== "darwin") {
    logCreate(
      theme,
      theme.dim(
        "Skipped demo iOS app (not macOS — run setup:demo-ios on a Mac if you need the Simulator build).",
      ),
    );
  } else if (opts.skipInstall) {
    logCreate(
      theme,
      theme.dim(
        "Skipped demo iOS app (npm install was skipped — run setup:demo-ios after npm install).",
      ),
    );
  }

  logCreate(theme, theme.ok("Setup complete."));
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
