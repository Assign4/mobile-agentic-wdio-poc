/** Shared doctor argv + runner factory (used by global CLI and vendored template). */

export function parseDoctorArgs(argv) {
  const out = { cwd: process.cwd(), json: false, appiumUrl: null };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--json") out.json = true;
    else if (a === "--cwd") {
      out.cwd = argv[i + 1];
      i += 1;
    } else if (a === "--appium-url") {
      out.appiumUrl = argv[i + 1];
      i += 1;
    } else {
      throw new Error(`Unknown argument: ${a}`);
    }
  }
  return out;
}

/** @param {{ runDoctor: Function; printDoctorResult: Function }} deps */
export function createDoctorMain(deps) {
  const { runDoctor, printDoctorResult } = deps;
  return async function runDoctorMain(argv) {
    const args = parseDoctorArgs(argv);
    const result = await runDoctor({
      cwd: args.cwd,
      json: args.json,
      appiumUrl: args.appiumUrl ?? undefined,
    });
    if (args.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    } else {
      printDoctorResult(result);
    }
    return result.ok ? 0 : 1;
  };
}
