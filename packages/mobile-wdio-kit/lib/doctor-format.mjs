import pc from "picocolors";

export function createDoctorTheme() {
  return {
    heading: (s) => pc.bold(pc.cyan(s)),
    rule: () => pc.dim("========================"),
    iconOk: () => pc.green("✓"),
    iconWarn: () => pc.yellow("!"),
    iconFail: () => pc.red("✗"),
    detail: (s) => pc.dim(s),
    fixLine: (s) => pc.cyan(`→ ${s}`),
    resultOk: (s) => pc.green(s),
    resultWarn: (s) => pc.yellow(s),
    resultFail: (s) => pc.red(s),
  };
}

/** Identity theme for unit tests */
export function neutralDoctorTheme() {
  const id = (s) => s;
  return {
    heading: id,
    rule: () => "========================",
    iconOk: () => "✓",
    iconWarn: () => "!",
    iconFail: () => "✗",
    detail: id,
    fixLine: (s) => `→ ${s}`,
    resultOk: id,
    resultWarn: id,
    resultFail: id,
  };
}

/**
 * @param {{ level: string; title: string; detail?: string; fix?: string }[]} checks
 * @param {{ level: string; title: string; detail?: string; fix?: string }[]} failed
 * @param {{ level: string; title: string; detail?: string; fix?: string }[]} warns
 * @param {ReturnType<typeof createDoctorTheme>} [theme]
 */
export function formatDoctorText(checks, failed, warns, theme = createDoctorTheme()) {
  const icon = (c) => {
    if (c.level === "ok") return theme.iconOk();
    if (c.level === "warn") return theme.iconWarn();
    return theme.iconFail();
  };

  const lines = [
    "",
    theme.heading("mobile-wdio-kit — doctor"),
    theme.rule(),
    "",
    ...checks.map((c) => {
      const parts = [`${icon(c)} ${c.title}`];
      if (c.detail) {
        const indented = c.detail.split("\n").join("\n    ");
        parts.push(`    ${theme.detail(indented)}`);
      }
      if (c.fix) parts.push(`    ${theme.fixLine(c.fix)}`);
      return parts.join("\n");
    }),
    "",
    failed.length
      ? theme.resultFail(`Result: ${failed.length} required check(s) failed.`)
      : warns.length
        ? theme.resultWarn(`Result: OK (with ${warns.length} warning(s)).`)
        : theme.resultOk("Result: all checks passed."),
    "",
  ];
  return lines.join("\n");
}
