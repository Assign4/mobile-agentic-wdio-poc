#!/bin/sh
# Shared Android SDK / emulator bootstrap for local scripts. Source (do not execute).
# shellcheck shell=sh

android_env_project_root() {
  CDPATH= cd -- "$(dirname -- "$0")/.." && pwd
}

android_env_prepare_paths() {
  PROJECT_ROOT="${PROJECT_ROOT:-$(android_env_project_root)}"
  mkdir -p "$PROJECT_ROOT/artifacts"

  if [ -z "${ANDROID_HOME:-}" ] && [ -d "$HOME/Library/Android/sdk" ]; then
    export ANDROID_HOME="$HOME/Library/Android/sdk"
  fi

  if [ -z "${ANDROID_SDK_ROOT:-}" ] && [ -n "${ANDROID_HOME:-}" ]; then
    export ANDROID_SDK_ROOT="$ANDROID_HOME"
  fi

  if [ -z "${JAVA_HOME:-}" ]; then
    if [ -x "/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home/bin/java" ]; then
      export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
    elif command -v /usr/libexec/java_home >/dev/null 2>&1; then
      JAVA_HOME_CANDIDATE=$(/usr/libexec/java_home 2>/dev/null || true)
      if [ -n "$JAVA_HOME_CANDIDATE" ]; then
        export JAVA_HOME="$JAVA_HOME_CANDIDATE"
      fi
    fi
  fi

  if [ -n "${JAVA_HOME:-}" ]; then
    export PATH="$JAVA_HOME/bin:$PATH"
  fi

  if [ -n "${ANDROID_HOME:-}" ]; then
    ADB_BIN="$ANDROID_HOME/platform-tools/adb"
    EMULATOR_BIN="$ANDROID_HOME/emulator/emulator"
  else
    ADB_BIN=""
    EMULATOR_BIN=""
  fi
}

android_env_has_device() {
  [ -n "$ADB_BIN" ] && [ -x "$ADB_BIN" ] &&
    "$ADB_BIN" devices | awk 'NR>1 && $2=="device" { found=1 } END { exit found ? 0 : 1 }'
}

# Appium 3 installs platform drivers separately; WDIO’s embedded server has none until you add one.
android_env_require_appium_uiautomator2() {
  root="${1:-}"
  if [ -z "$root" ]; then
    return 0
  fi
  ap="$root/node_modules/.bin/appium"
  if [ ! -x "$ap" ]; then
    return 0
  fi
  # Match doctor.mjs: Appium may print the driver table on stderr; merge streams.
  drivers_out=$("$ap" driver list --installed 2>&1) || true
  if printf '%s\n' "$drivers_out" | grep -qi uiautomator2; then
    return 0
  fi
  echo "Appium has no UiAutomator2 driver (required for Android sessions)." >&2
  echo "Install once from the project root:" >&2
  echo "  npm run appium:driver:android" >&2
  echo "Then re-run this script. (Check: npm run doctor)" >&2
  exit 1
}

android_env_ensure_emulator() {
  android_env_prepare_paths

  if android_env_has_device; then
    return 0
  fi

  if [ ! -x "$EMULATOR_BIN" ] || [ ! -x "$ADB_BIN" ]; then
    echo "Android SDK tools not found. Set ANDROID_HOME." >&2
    exit 1
  fi

  SELECTED_AVD="${ANDROID_AVD:-$("$EMULATOR_BIN" -list-avds 2>/dev/null | sed -n '/^[A-Za-z0-9._-][A-Za-z0-9._-]*$/p' | sed -n '1p')}"

  if [ -z "$SELECTED_AVD" ]; then
    echo "No Android emulator available. Create an AVD or set ANDROID_AVD." >&2
    exit 1
  fi

  nohup "$EMULATOR_BIN" -avd "$SELECTED_AVD" >"$PROJECT_ROOT/artifacts/emulator.log" 2>&1 &

  "$ADB_BIN" wait-for-device
  while [ "$("$ADB_BIN" shell getprop sys.boot_completed | tr -d '\r')" != "1" ]; do
    sleep 2
  done
  "$ADB_BIN" shell input keyevent 82 >/dev/null 2>&1 || true
}

# Start an AVD in the background without waiting for boot. For MCP stdio: Cursor must get a
# JSON-RPC handshake quickly; blocking on cold boot exceeds typical client timeouts.
android_env_start_emulator_async() {
  android_env_prepare_paths

  if android_env_has_device; then
    return 0
  fi

  if [ ! -x "$EMULATOR_BIN" ] || [ ! -x "$ADB_BIN" ]; then
    echo "Android SDK tools not found. Set ANDROID_HOME." >&2
    return 1
  fi

  SELECTED_AVD="${ANDROID_AVD:-$("$EMULATOR_BIN" -list-avds 2>/dev/null | sed -n '/^[A-Za-z0-9._-][A-Za-z0-9._-]*$/p' | sed -n '1p')}"

  if [ -z "$SELECTED_AVD" ]; then
    echo "No Android emulator available. Create an AVD or set ANDROID_AVD." >&2
    return 1
  fi

  echo "[android-env] Starting emulator '$SELECTED_AVD' in the background (logs: $PROJECT_ROOT/artifacts/emulator.log). Wait for adb device before start_session." >&2
  nohup "$EMULATOR_BIN" -avd "$SELECTED_AVD" >"$PROJECT_ROOT/artifacts/emulator.log" 2>&1 &
  return 0
}
