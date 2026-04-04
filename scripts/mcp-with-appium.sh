#!/bin/sh
# Cursor MCP entry: ensure Android device/emulator, ensure Appium, then run wdio-mcp on stdio.
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
cd "$PROJECT_ROOT"

# Load .env so wdio-mcp (patched) sees MOBILE_* for demo auto-login and APPIUM_* / paths match local runs.
if [ -f "$PROJECT_ROOT/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  . "$PROJECT_ROOT/.env"
  set +a
fi

# shellcheck source=android-env.sh
. "$SCRIPT_DIR/android-env.sh"
android_env_prepare_paths
# Blocking until boot_completed can take minutes and breaks Cursor's MCP handshake (~10s).
# Terminal: npm run mcp:server:with-appium sets MCP_BLOCK_UNTIL_EMULATOR_READY=1 for full wait.
if [ "${MCP_BLOCK_UNTIL_EMULATOR_READY:-0}" = "1" ]; then
  android_env_ensure_emulator
else
  android_env_start_emulator_async || exit 1
fi

node "$SCRIPT_DIR/ensure-appium.mjs"

exec "$PROJECT_ROOT/node_modules/.bin/wdio-mcp" "$@"
