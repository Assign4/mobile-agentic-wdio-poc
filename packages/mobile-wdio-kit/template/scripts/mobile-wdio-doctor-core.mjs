import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const MIN_NODE = 18;

/** @typedef {{ ok: boolean; level: "ok" | "warn" | "fail"; title: string; detail?: string; fix?: string }} Check */

function nodeMajor(version) {
  const m = /^v?(\d+)/.exec(version.trim());
  return m ? Number(m[1]) : 0;
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    ...opts,
  });
  return {
    code: r.status ?? 1,
    out: `${r.stdout ?? ""}${r.stderr ?? ""}`.trim(),
  };
}

function which(name) {
  const cmd = process.platform === "win32" ? "where" : "which";
  const r = run(cmd, [name]);
  return r.code === 0 ? r.out.split("\n")[0].trim() : "";
}

/**
 * @param {{ cwd?: string; json?: boolean; appiumUrl?: string }} opts
 */
export async function runDoctor(opts = {}) {
  const cwd = opts.cwd ?? process.cwd();
  const checks = /** @type {Check[]} */ ([]);

  const add = (c) => checks.push(c);

  const nodeVer = process.version;
  const major = nodeMajor(nodeVer);
  add({
    ok: major >= MIN_NODE,
    level: major >= MIN_NODE ? "ok" : "fail",
    title: `Node.js ${nodeVer}`,
    detail: `Required: >= ${MIN_NODE}`,
    fix:
      major < MIN_NODE
        ? "Install Node.js 18+ (LTS recommended) from https://nodejs.org/"
        : undefined,
  });

  const npmWhich = which("npm");
  add({
    ok: Boolean(npmWhich),
    level: npmWhich ? "ok" : "warn",
    title: "npm on PATH",
    detail: npmWhich || "not found",
    fix: npmWhich ? undefined : "Install Node.js with npm, or use a version manager (nvm, fnm).",
  });

  const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || "";
  const sdkOk = Boolean(androidHome && existsSync(androidHome));
  add({
    ok: sdkOk,
    level: sdkOk ? "ok" : "warn",
    title: "Android SDK (ANDROID_HOME or ANDROID_SDK_ROOT)",
    detail: sdkOk ? androidHome : "not set or path missing",
    fix: sdkOk
      ? undefined
      : "Install Android Studio / cmdline-tools, then export ANDROID_HOME (e.g. ~/Library/Android/sdk on macOS).",
  });

  const adbPath = which("adb");
  const adbOk = Boolean(adbPath);
  add({
    ok: adbOk,
    level: adbOk ? "ok" : "warn",
    title: "adb on PATH",
    detail: adbOk ? adbPath : "not found",
    fix: adbOk ? undefined : "Add platform-tools to PATH (inside your Android SDK).",
  });

  if (adbOk) {
    const dev = run("adb", ["devices"]);
    const lines = dev.out.split("\n").filter(Boolean);
    const deviceLines = lines.filter((l) => l.includes("\tdevice") || l.includes("\temulator"));
    add({
      ok: deviceLines.length > 0,
      level: deviceLines.length > 0 ? "ok" : "warn",
      title: "ADB device / emulator",
      detail:
        deviceLines.length > 0 ? `${deviceLines.length} online` : "no devices in `adb devices`",
      fix:
        deviceLines.length > 0
          ? undefined
          : "Start an emulator (`emulator -avd …`) or plug in a device with USB debugging.",
    });
  }

  const javaHome = process.env.JAVA_HOME || "";
  const javaOk = Boolean(javaHome && existsSync(javaHome));
  add({
    ok: javaOk,
    level: javaOk ? "ok" : "warn",
    title: "JAVA_HOME (recommended for Android toolchain)",
    detail: javaOk ? javaHome : "not set or path missing",
    fix: javaOk
      ? undefined
      : "Point JAVA_HOME at a JDK 17+ install (Android Studio bundled JBR works).",
  });

  const demoApk = join(cwd, "apps", "android.wdio.native.app.v2.0.0.apk");
  const apkOk = existsSync(demoApk);
  add({
    ok: apkOk,
    level: apkOk ? "ok" : "warn",
    title: "Demo Android APK (apps/android.wdio.native.app.v2.0.0.apk)",
    detail: apkOk ? demoApk : "missing",
    fix: apkOk
      ? undefined
      : "Run `npm run setup:demo-android` in this project (or set ANDROID_APP_PATH to your app).",
  });

  const envFile = join(cwd, ".env");
  add({
    ok: existsSync(envFile),
    level: existsSync(envFile) ? "ok" : "warn",
    title: ".env present",
    detail: existsSync(envFile) ? envFile : "missing",
    fix: existsSync(envFile)
      ? undefined
      : "Copy `.env.example` to `.env` and adjust device names / paths.",
  });

  let pkg = null;
  try {
    pkg = JSON.parse(readFileSync(join(cwd, "package.json"), "utf8"));
  } catch {
    add({
      ok: false,
      level: "warn",
      title: "package.json in cwd",
      detail: "not readable — run doctor from the scaffolded project root",
    });
  }

  if (pkg) {
    const appiumBin = join(cwd, "node_modules", ".bin", "appium");
    const appiumLocal = existsSync(appiumBin);
    add({
      ok: appiumLocal,
      level: appiumLocal ? "ok" : "warn",
      title: "Appium (local devDependency)",
      detail: appiumLocal ? appiumBin : "run npm install in this project",
      fix: appiumLocal ? undefined : "From project root: npm install",
    });

    if (appiumLocal) {
      const appiumCli =
        process.platform === "win32" ? join(cwd, "node_modules", ".bin", "appium.cmd") : appiumBin;
      const exe = existsSync(appiumCli) ? appiumCli : appiumBin;
      const drivers = spawnSync(exe, ["driver", "list", "--installed"], {
        cwd,
        encoding: "utf8",
        env: process.env,
        shell: false,
      });
      const driverText = `${drivers.stdout ?? ""}${drivers.stderr ?? ""}`;
      const hasU2 = /uiautomator2/i.test(driverText);
      const hasXc = /xcuitest/i.test(driverText);
      add({
        ok: hasU2,
        level: hasU2 ? "ok" : "warn",
        title: "Appium UiAutomator2 driver",
        detail: hasU2 ? "installed" : "not detected",
        fix: hasU2 ? undefined : "npm run appium:driver:android",
      });
      if (process.platform === "darwin") {
        add({
          ok: hasXc,
          level: hasXc ? "ok" : "warn",
          title: "Appium XCUITest driver (iOS)",
          detail: hasXc ? "installed" : "not detected",
          fix: hasXc ? undefined : "npm run appium:driver:ios",
        });
      }
    }
  }

  if (process.platform === "darwin") {
    const xc = run("xcodebuild", ["-version"]);
    add({
      ok: xc.code === 0,
      level: xc.code === 0 ? "ok" : "warn",
      title: "Xcode (xcodebuild)",
      detail: xc.code === 0 ? xc.out.split("\n")[0] : xc.out || "not found",
      fix:
        xc.code === 0
          ? undefined
          : "Install Xcode from the App Store and run `xcode-select --install` if needed.",
    });

    const sim = run("xcrun", ["simctl", "list", "devices", "available"]);
    const simOk = sim.code === 0 && /iPhone|iPad/.test(sim.out);
    add({
      ok: simOk,
      level: simOk ? "ok" : "warn",
      title: "iOS Simulator (simctl)",
      detail: simOk ? "at least one iPhone/iPad device listing present" : sim.out || "failed",
      fix: simOk ? undefined : "Open Xcode → Settings → Platforms and install a simulator runtime.",
    });
  } else {
    add({
      ok: true,
      level: "ok",
      title: "iOS tooling",
      detail: "skipped (not macOS)",
    });
  }

  const appiumUrl =
    opts.appiumUrl ??
    (() => {
      try {
        if (existsSync(join(cwd, ".env"))) {
          const raw = readFileSync(join(cwd, ".env"), "utf8");
          const host = raw.match(/^\s*APPIUM_HOST\s*=\s*(.+)$/m)?.[1]?.trim() ?? "127.0.0.1";
          const port = raw.match(/^\s*APPIUM_PORT\s*=\s*(.+)$/m)?.[1]?.trim() ?? "4723";
          return `http://${host}:${port}/status`;
        }
      } catch {
        /* ignore */
      }
      return "http://127.0.0.1:4723/status";
    })();

  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 2500);
    const res = await fetch(appiumUrl, { signal: ac.signal });
    clearTimeout(t);
    const body = res.ok ? await res.json().catch(() => ({})) : {};
    const ready = body?.value?.ready === true;
    add({
      ok: ready,
      level: ready ? "ok" : "warn",
      title: "Appium server reachable",
      detail: `${appiumUrl} → HTTP ${res.status}${ready ? ", ready" : ""}`,
      fix: ready
        ? undefined
        : "Start Appium: npm run appium:start (or your own 127.0.0.1:4723 server).",
    });
  } catch (e) {
    add({
      ok: false,
      level: "warn",
      title: "Appium server reachable",
      detail: String(/** @type {Error} */ (e).message || e),
      fix: "Start Appium on APPIUM_HOST:APPIUM_PORT (see .env).",
    });
  }

  const failed = checks.filter((c) => c.level === "fail");
  const warns = checks.filter((c) => c.level === "warn");

  if (opts.json) {
    return {
      ok: failed.length === 0,
      summary: {
        fail: failed.length,
        warn: warns.length,
        ok: checks.filter((c) => c.level === "ok").length,
      },
      checks,
    };
  }

  const icon = (c) => (c.level === "ok" ? "✓" : c.level === "warn" ? "!" : "✗");

  const lines = [
    "",
    "mobile-wdio-kit — doctor",
    "========================",
    "",
    ...checks.map(
      (c) =>
        `${icon(c)} ${c.title}${c.detail ? `\n    ${c.detail.split("\n").join("\n    ")}` : ""}${c.fix ? `\n    → ${c.fix}` : ""}`,
    ),
    "",
    failed.length
      ? `Result: ${failed.length} required check(s) failed.`
      : warns.length
        ? `Result: OK (with ${warns.length} warning(s)).`
        : "Result: all checks passed.",
    "",
  ];

  return {
    ok: failed.length === 0,
    text: lines.join("\n"),
    checks,
  };
}

export function printDoctorResult(result) {
  if (typeof result.text === "string") process.stdout.write(result.text);
}
