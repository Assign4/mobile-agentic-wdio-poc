#!/bin/sh
# Starts Appium in the background, waits until /status is ready, runs MCP smoke, stops Appium.
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
# shellcheck source=android-env.sh
. "$SCRIPT_DIR/android-env.sh"

PROJECT_ROOT=$(android_env_project_root)
cd "$PROJECT_ROOT"
android_env_prepare_paths

APPIUM_HOST="${APPIUM_HOST:-127.0.0.1}"
APPIUM_PORT="${APPIUM_PORT:-4723}"
STATUS_URL="http://${APPIUM_HOST}:${APPIUM_PORT}/status"

"$PROJECT_ROOT/node_modules/.bin/appium" --address "$APPIUM_HOST" --port "$APPIUM_PORT" &
APPIUM_PID=$!

cleanup() {
  if kill -0 "$APPIUM_PID" 2>/dev/null; then
    kill "$APPIUM_PID" 2>/dev/null || true
    wait "$APPIUM_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

i=0
while [ "$i" -lt 120 ]; do
  # Appium can answer /status before the HTTP listener and drivers are fully ready;
  # require JSON "ready":true so new sessions are accepted reliably.
  if curl -sf "$STATUS_URL" | grep -q '"ready":true'; then
    break
  fi
  i=$((i + 1))
  sleep 1
done

if ! curl -sf "$STATUS_URL" | grep -q '"ready":true'; then
  echo "Appium did not become ready at $STATUS_URL" >&2
  exit 1
fi

# Brief settle after ready flag (driver init / listener wiring).
sleep 2

node "$PROJECT_ROOT/tests/mcp-android-login-smoke.mjs"
