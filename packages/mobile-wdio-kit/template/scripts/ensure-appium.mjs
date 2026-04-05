#!/usr/bin/env node
/**
 * If Appium is not ready at APPIUM_HOST:APPIUM_PORT, start it in the background
 * (logs to artifacts/appium-mcp.log). Safe for MCP: does not touch stdout.
 */
import "dotenv/config";
import { spawn } from "node:child_process";
import { mkdirSync, openSync, writeSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const host = process.env.APPIUM_HOST ?? "127.0.0.1";
const port = Number(process.env.APPIUM_PORT ?? "4723");
const statusUrl = `http://${host}:${port}/status`;

async function ping() {
  try {
    const res = await fetch(statusUrl, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return false;
    const body = await res.json();
    return body?.value?.ready === true;
  } catch {
    return false;
  }
}

if (await ping()) {
  console.error(`[ensure-appium] already ready at ${statusUrl}`);
  process.exit(0);
}

mkdirSync(join(root, "artifacts"), { recursive: true });
const logPath = join(root, "artifacts", "appium-mcp.log");
const logFd = openSync(logPath, "a");
const line = `\n--- ${new Date().toISOString()} starting Appium for MCP ---\n`;
writeSync(logFd, line);

const appiumBin = join(root, "node_modules", ".bin", "appium");
const child = spawn(appiumBin, ["--address", host, "--port", String(port)], {
  cwd: root,
  detached: true,
  stdio: ["ignore", logFd, logFd],
});
child.unref();

child.on("error", (err) => {
  console.error("[ensure-appium] failed to spawn appium:", err.message);
  process.exit(1);
});

const deadline = Date.now() + 120_000;
while (Date.now() < deadline) {
  if (await ping()) {
    console.error(`[ensure-appium] Appium ready at ${statusUrl} (log: ${logPath})`);
    process.exit(0);
  }
  await new Promise((r) => setTimeout(r, 500));
}

try {
  process.kill(child.pid, "SIGTERM");
} catch {
  // ignore
}
console.error("[ensure-appium] timed out waiting for Appium");
process.exit(1);
