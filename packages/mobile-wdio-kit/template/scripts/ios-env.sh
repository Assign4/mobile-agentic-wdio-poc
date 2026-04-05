#!/bin/sh
# Shared Xcode / Simulator bootstrap for local iOS scripts. Source (do not execute).
# shellcheck shell=sh

ios_env_project_root() {
  CDPATH= cd -- "$(dirname -- "$0")/.." && pwd
}

ios_env_prepare_paths() {
  PROJECT_ROOT="${PROJECT_ROOT:-$(ios_env_project_root)}"
  mkdir -p "$PROJECT_ROOT/artifacts"
}

# Prints a simulator UDID (single line) or nothing.
ios_env_resolve_udid() {
  if [ -n "${IOS_UDID:-}" ]; then
    printf '%s' "$IOS_UDID"
    return 0
  fi

  name="${IOS_DEVICE_NAME:-iPhone 15}"
  # Prefer an already-booted iPhone simulator so reruns are fast.
  booted=$(xcrun simctl list devices booted 2>/dev/null | grep -F "iPhone" | sed -n 's/.*(\([0-9A-Fa-f-]\{36\}\)).*/\1/p' | head -n 1)
  if [ -n "$booted" ]; then
    printf '%s' "$booted"
    return 0
  fi

  xcrun simctl list devices available 2>/dev/null | grep -F "$name" | sed -n 's/.*(\([0-9A-Fa-f-]\{36\}\)).*/\1/p' | head -n 1
}

ios_env_sim_state() {
  udid="$1"
  xcrun simctl list devices 2>/dev/null | grep -F "$udid" | grep -oE '\(Shutdown\)|\(Booted\)|\(Shutting Down\)' | head -n 1
}

# Blocks until the simulator finishes booting (or is already Booted).
ios_env_ensure_simulator() {
  ios_env_prepare_paths

  if [ "$(uname)" != "Darwin" ]; then
    echo "iOS local runs require macOS with Xcode." >&2
    exit 1
  fi

  udid=$(ios_env_resolve_udid)
  if [ -z "$udid" ]; then
    echo "No simulator UDID resolved. Set IOS_UDID or IOS_DEVICE_NAME (e.g. iPhone 15) and install a matching runtime in Xcode." >&2
    exit 1
  fi

  export IOS_UDID="$udid"

  state=$(ios_env_sim_state "$udid")
  case "$state" in
    *Booted*) ;;
    *)
      xcrun simctl boot "$udid" 2>/dev/null || true
      ;;
  esac

  set +e
  xcrun simctl bootstatus "$udid" -b >/dev/null 2>&1
  bs=$?
  set -e
  if [ "$bs" != 0 ]; then
    i=0
    while [ "$i" -lt 120 ]; do
      st=$(ios_env_sim_state "$udid")
      case "$st" in
        *Booted*) break ;;
      esac
      i=$((i + 1))
      sleep 1
    done
  fi

  open -a Simulator >/dev/null 2>&1 || true
}

# Starts boot without blocking on full boot — for MCP stdio handshakes.
ios_env_start_simulator_async() {
  ios_env_prepare_paths

  if [ "$(uname)" != "Darwin" ]; then
    echo "iOS MCP requires macOS with Xcode." >&2
    return 1
  fi

  udid=$(ios_env_resolve_udid)
  if [ -z "$udid" ]; then
    echo "No simulator UDID resolved. Set IOS_UDID or IOS_DEVICE_NAME." >&2
    return 1
  fi

  export IOS_UDID="$udid"
  state=$(ios_env_sim_state "$udid")
  case "$state" in
    *Booted*)
      echo "[ios-env] Simulator already booted ($udid)." >&2
      ;;
    *)
      echo "[ios-env] Booting simulator $udid (complete boot before start_session if needed)." >&2
      xcrun simctl boot "$udid" 2>/dev/null || true
      ;;
  esac

  open -a Simulator >/dev/null 2>&1 || true
  return 0
}
