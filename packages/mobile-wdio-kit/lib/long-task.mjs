import ora from "ora";

/** @param {import("node:stream").Writable} [stream] */
export function shouldShowSpinner(stream = process.stderr) {
  if (process.env.CI === "true" || process.env.CI === "1") return false;
  if (!stream || typeof stream.isTTY !== "boolean" || !stream.isTTY) return false;
  if (typeof stream.cursorTo !== "function") return false;
  if (typeof stream.clearLine !== "function") return false;
  return true;
}

/**
 * @param {string} text
 * @param {import("node:stream").Writable} [stream]
 * @returns {import("ora").Ora | null}
 */
export function startSpinner(text, stream = process.stderr) {
  if (!shouldShowSpinner(stream)) return null;
  return ora({ text, stream, color: "cyan" }).start();
}

/**
 * Stop spinner before subprocess output (stdio inherit).
 * @param {import("ora").Ora | null} spinner
 * @param {string} persistText
 */
export function stopSpinnerForSubprocess(spinner, persistText) {
  if (!spinner) return;
  spinner.stopAndPersist({ symbol: "⏳", text: persistText });
}

/**
 * @param {import("ora").Ora | null} spinner
 * @param {string} text
 */
export function succeedSpinner(spinner, text) {
  if (spinner) spinner.succeed(text);
}

/**
 * @param {import("ora").Ora | null} spinner
 * @param {string} text
 */
export function failSpinner(spinner, text) {
  if (spinner) spinner.fail(text);
}
