#!/usr/bin/env node
/**
 * Quick check that Appium is up before using wdio-mcp from Cursor.
 * Respects APPIUM_HOST / APPIUM_PORT (same as .env).
 */
import "dotenv/config";

const host = process.env.APPIUM_HOST ?? "127.0.0.1";
const port = process.env.APPIUM_PORT ?? "4723";
const url = `http://${host}:${port}/status`;

const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
if (!res.ok) {
  console.error(`Appium HTTP ${res.status} at ${url}`);
  process.exit(1);
}
const body = await res.json();
const ready = body?.value?.ready === true;
if (!ready) {
  console.error("Appium responded but is not ready:", JSON.stringify(body, null, 2));
  process.exit(1);
}
console.log(`Appium ready at ${url}`);
console.log(body.value?.message ?? "");
