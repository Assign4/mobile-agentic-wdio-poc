export const MIN_NODE_CREATE = 18;

export function parseNodeMajor(version) {
  const m = /^v?(\d+)/.exec(String(version ?? "").trim());
  return m ? Number(m[1]) : 0;
}

/**
 * @typedef {{ code: string; message: string; fix: string }} PreflightIssue
 */

/**
 * @param {{
 *   nodeVersion: string;
 *   npmOnPath: boolean;
 *   templatePkgExists: boolean;
 *   minNode?: number;
 * }} input
 * @returns {{ ok: boolean; blocking: PreflightIssue[]; hints: PreflightIssue[] }}
 */
export function evaluateCreatePreflight(input) {
  const minNode = input.minNode ?? MIN_NODE_CREATE;
  /** @type {PreflightIssue[]} */
  const blocking = [];

  const major = parseNodeMajor(input.nodeVersion);
  if (major < minNode) {
    blocking.push({
      code: "node_version",
      message: `Node.js ${input.nodeVersion} is too old (need >= ${minNode}).`,
      fix: "Install Node.js 18+ from https://nodejs.org/ or use nvm / fnm.",
    });
  }

  if (!input.npmOnPath) {
    blocking.push({
      code: "npm_missing",
      message: "npm is not on PATH (required to run npm install in the new project).",
      fix: "Install Node.js (includes npm) or fix PATH so `npm` resolves.",
    });
  }

  if (!input.templatePkgExists) {
    blocking.push({
      code: "template_missing",
      message: "Kit template is missing (expected template/package.json next to the kit).",
      fix: "If you develop from git: from repo root run `npm run kit:sync`, then retry.",
    });
  }

  return { ok: blocking.length === 0, blocking, hints: [] };
}

/**
 * Plain-text failure (CLI may color). For tests, pass identity theme.
 * @param {{ ok: boolean; blocking: PreflightIssue[] }} pre
 * @param {{ fail?: (s: string) => string; fix?: (s: string) => string; dim?: (s: string) => string }} [t]
 */
export function formatPreflightFailure(pre, t = {}) {
  const fail = t.fail ?? ((s) => s);
  const fix = t.fix ?? ((s) => s);
  const dim = t.dim ?? ((s) => s);
  if (pre.ok) return "";
  const lines = [fail("Cannot create project — fix the following first:"), ""];
  for (const b of pre.blocking) {
    lines.push(`  • ${b.message}`);
    lines.push(dim(`    ${fix(b.fix)}`));
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}
