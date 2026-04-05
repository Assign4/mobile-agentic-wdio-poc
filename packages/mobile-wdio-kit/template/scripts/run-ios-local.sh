#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
# shellcheck source=ios-env.sh
. "$SCRIPT_DIR/ios-env.sh"

PROJECT_ROOT=$(ios_env_project_root)
ios_env_ensure_simulator

exec "$PROJECT_ROOT/node_modules/.bin/wdio" run "$PROJECT_ROOT/configs/wdio.local.ios.conf.ts" "$@"
