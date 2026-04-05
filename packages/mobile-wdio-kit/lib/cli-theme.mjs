import pc from "picocolors";

/** @returns {boolean} */
export function useColor(stream = process.stderr) {
  if (process.env.NO_COLOR) return false;
  if (process.env.FORCE_COLOR === "1" || process.env.FORCE_COLOR === "true") return true;
  if (!stream || typeof stream.isTTY !== "boolean" || !stream.isTTY) return false;
  return true;
}

/**
 * @param {{ stream?: import("node:stream").Writable; force?: boolean }} [opts]
 * @returns {boolean}
 */
export function cliColorEnabled(opts = {}, stream = opts.stream ?? process.stderr) {
  if (opts.force === false) return false;
  if (opts.force === true) return !process.env.NO_COLOR;
  return useColor(stream);
}

/**
 * @param {{ stream?: import("node:stream").Writable; force?: boolean }} [opts]
 */
export function createCliTheme(opts = {}) {
  const stream = opts.stream ?? process.stderr;
  const enabled = cliColorEnabled(opts, stream);
  const colors = pc.createColors(enabled);
  return {
    brand: (s) => colors.bold(colors.cyan(s)),
    title: (s) => colors.bold(s),
    ok: (s) => colors.green(s),
    warn: (s) => colors.yellow(s),
    fail: (s) => colors.red(s),
    dim: (s) => colors.dim(s),
    fix: (s) => colors.cyan(s),
    accent: (s) => colors.magenta(s),
  };
}
