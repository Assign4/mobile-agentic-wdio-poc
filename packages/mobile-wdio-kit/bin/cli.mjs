#!/usr/bin/env node
import { createProject } from "../lib/create.mjs";
import { createDoctorMain } from "../lib/doctor-cli.mjs";
import { printDoctorResult, runDoctor } from "../lib/doctor.mjs";

const runDoctorMain = createDoctorMain({ runDoctor, printDoctorResult });

function help() {
  process.stdout.write(`
mobile-wdio-kit — scaffold + environment checks for WebdriverIO + Appium mobile projects

Usage:
  mobile-wdio-kit create <directory> [options]
  mobile-wdio-kit doctor [options]
  mobile-wdio-kit --help

Commands:
  create    Copy the framework template, run npm install, fetch the demo Android APK.
  doctor    Verify Node, Android SDK, adb, Appium drivers, demo APK, .env, Appium server.

Where create writes:
  The target path is resolved with Node path.resolve() from your current working directory
  (the shell’s cwd—not the global npm install location). Examples:
    create ./my-app           →  <cwd>/my-app
    create /tmp/foo           →  /tmp/foo
    create ~/Desktop/foo      →  your home/Desktop/foo (tilde expanded by shell or by the CLI)

Create options:
  --force              Overwrite a non-empty directory (dangerous).
  --no-install         Skip npm install (you must install dependencies yourself).
  --no-demo-apk        Skip downloading the WebdriverIO demo APK.
  --name <pkg-name>    package.json name (default: folder name).

Doctor options:
  --cwd <path>         Project root to inspect (default: process.cwd()).
  --json               Machine-readable JSON on stdout.
  --appium-url <url>   Override status URL (default: from .env or http://127.0.0.1:4723/status).

Examples:
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
    name: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--force") out.force = true;
    else if (a === "--no-install") out.skipInstall = true;
    else if (a === "--no-demo-apk") out.skipDemoApk = true;
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

  if (cmd === "create") {
    const args = parseCreateArgs(rest);
    if (!args.target) {
      console.error("Error: create requires a target directory.\n");
      help();
      process.exit(1);
    }
    try {
      process.stderr.write("\nmobile-wdio-kit — create\n\n");
      const { targetAbs, name } = createProject({
        targetDir: args.target,
        force: args.force,
        skipInstall: args.skipInstall,
        skipDemoApk: args.skipDemoApk,
        projectName: args.name,
      });
      process.stdout.write(
        `\nCreated project "${name}" at:\n  ${targetAbs}\n\nNext:\n  cd ${args.target}\n  npm run doctor\n  npm run test:android   # with emulator + Appium\n`,
      );
      process.exit(0);
    } catch (e) {
      console.error(String(/** @type {Error} */ (e).message || e));
      process.exit(1);
    }
  }

  if (cmd === "doctor") {
    try {
      process.exit(await runDoctorMain(rest));
    } catch (e) {
      console.error(String(/** @type {Error} */ (e).message || e));
      process.exit(1);
    }
  }

  console.error(`Unknown command: ${cmd}\n`);
  help();
  process.exit(1);
}

main();
