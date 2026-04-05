#!/bin/sh
# Cursor MCP entry (iOS): load .env, boot Simulator (async unless MCP_BLOCK_UNTIL_SIM_READY=1), Appium, wdio-mcp.
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
cd "$PROJECT_ROOT"

if [ -f "$PROJECT_ROOT/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  . "$PROJECT_ROOT/.env"
  set +a
fi

# shellcheck source=ios-env.sh
. "$SCRIPT_DIR/ios-env.sh"

if [ "${MCP_BLOCK_UNTIL_SIM_READY:-0}" = "1" ]; then
  ios_env_ensure_simulator
else
  ios_env_start_simulator_async || exit 1
fi

node "$SCRIPT_DIR/ensure-appium.mjs"

exec "$PROJECT_ROOT/node_modules/.bin/wdio-mcp" "$@"
