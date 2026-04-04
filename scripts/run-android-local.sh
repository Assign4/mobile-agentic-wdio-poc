#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
# shellcheck source=android-env.sh
. "$SCRIPT_DIR/android-env.sh"

PROJECT_ROOT=$(android_env_project_root)
android_env_ensure_emulator

exec "$PROJECT_ROOT/node_modules/.bin/wdio" run "$PROJECT_ROOT/configs/wdio.local.android.conf.ts" "$@"
