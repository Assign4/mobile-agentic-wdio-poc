#!/usr/bin/env node
import { createProject } from "../lib/create.mjs";
import { createDoctorMain } from "../lib/doctor-cli.mjs";
import { printDoctorResult, runDoctor } from "../lib/doctor.mjs";
import { createCliTheme } from "../lib/cli-theme.mjs";

const runDoctorMain = createDoctorMain({ runDoctor, printDoctorResult });

function help() {
  const theme = createCliTheme({ stream: process.stdout });
  process.stdout.write(`
${theme.brand("mobile-wdio-kit")} — ${theme.dim("scaffold + environment checks for WebdriverIO + Appium mobile projects")}

${theme.title("Usage:")}
  ${theme.dim("mobile-wdio-kit")} create <directory> [options]
  ${theme.dim("mobile-wdio-kit")} doctor [options]
  ${theme.dim("mobile-wdio-kit")} --help

${theme.title("Commands:")}
  ${theme.accent("create")}    Copy the framework template, run npm install, fetch demo Android APK (and iOS .app on macOS).
  ${theme.accent("doctor")}    Verify Node, Android SDK, adb, Appium drivers, demo apps, .env, Appium server.

${theme.title("Where create writes:")}
  The target path is resolved with Node path.resolve() from your current working directory
  (the shell’s cwd—not the global npm install location). Examples:
    create ./my-app           →  <cwd>/my-app
    create /tmp/foo           →  /tmp/foo
    create ~/Desktop/foo      →  your home/Desktop/foo (tilde expanded by shell or by the CLI)

${theme.title("Create options:")}
  --force              Overwrite a non-empty directory (dangerous).
  --no-install         Skip npm install (you must install dependencies yourself).
  --no-demo-apk        Skip downloading the WebdriverIO demo APK.
  --no-demo-ios        Skip downloading the WebdriverIO demo iOS Simulator app (macOS only).
  --name <pkg-name>    package.json name (default: folder name).

${theme.title("Doctor options:")}
  --cwd <path>         Project root to inspect (default: process.cwd()).
  --json               Machine-readable JSON on stdout.
  --appium-url <url>   Override status URL (default: from .env or http://127.0.0.1:4723/status).

${theme.title("Examples:")}
  npx mobile-wdio-kit@latest create ./my-mobile-tests
  cd my-mobile-tests && npm run doctor
  mobile-wdio-kit doctor --cwd ./my-mobile-tests

`);
}

function parseCreateArgs(argv) {
  const out = {
    target: null,
    force: false,
    skipInstall: false,
    skipDemoApk: false,
    skipDemoIos: false,
    name: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--force") out.force = true;
    else if (a === "--no-install") out.skipInstall = true;
    else if (a === "--no-demo-apk") out.skipDemoApk = true;
    else if (a === "--no-demo-ios") out.skipDemoIos = true;
    else if (a === "--name") {
      out.name = argv[i + 1];
      i += 1;
    } else if (!a.startsWith("-") && !out.target) out.target = a;
    else {
      throw new Error(`Unknown argument: ${a}`);
    }
  }
  return out;
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv[0] === "-h" || argv[0] === "--help") {
    help();
    process.exit(0);
  }

  const cmd = argv[0];
  const rest = argv.slice(1);
  const errTheme = createCliTheme({ stream: process.stderr });
  const outTheme = createCliTheme({ stream: process.stdout });

  if (cmd === "create") {
    const args = parseCreateArgs(rest);
    if (!args.target) {
      process.stderr.write(`${errTheme.fail("Error:")} create requires a target directory.\n\n`);
      help();
      process.exit(1);
    }
    try {
      process.stderr.write(
        `\n${errTheme.brand("mobile-wdio-kit")} — ${errTheme.title("create")}\n\n`,
      );
      const { targetAbs, name } = createProject({
        targetDir: args.target,
        force: args.force,
        skipInstall: args.skipInstall,
        skipDemoApk: args.skipDemoApk,
        skipDemoIos: args.skipDemoIos,
        projectName: args.name,
      });
      process.stdout.write(
        `\n${outTheme.ok("Created project")} ${outTheme.title(`"${name}"`)} ${outTheme.dim("at:")}\n  ${targetAbs}\n\n${outTheme.title("Next:")}\n  ${outTheme.dim(`cd ${args.target}`)}\n  ${outTheme.dim("npm run doctor")}\n  ${outTheme.dim("npm run test:android   # with emulator + Appium")}\n  ${outTheme.dim("# macOS: npm run test:ios  # Simulator + Appium")}\n`,
      );
      process.exit(0);
    } catch (e) {
      process.stderr.write(`${errTheme.fail(String(/** @type {Error} */ (e).message || e))}\n`);
      process.exit(1);
    }
  }

  if (cmd === "doctor") {
    try {
      process.exit(await runDoctorMain(rest));
    } catch (e) {
      process.stderr.write(`${errTheme.fail(String(/** @type {Error} */ (e).message || e))}\n`);
      process.exit(1);
    }
  }

  process.stderr.write(`${errTheme.fail(`Unknown command: ${cmd}`)}\n\n`);
  help();
  process.exit(1);
}

main();
