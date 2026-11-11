#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
servicehub_ip=$(ip -4 route get 1.1.1.1 | sed -n 's/.* src \([^ ]*\).*/\1/p')
systemd-run --user --unit=servicehub-server --collect --working-directory="$PWD" --setenv=APP_SERVER_HOST=0.0.0.0 --setenv=APP_SERVER_PORT=13600 --setenv=APP_BASE_PATH=/main --setenv=APP_PUBLIC_ORIGIN="http://$servicehub_ip:13600" --setenv=APP_VITE_DEV_URL=false --setenv=APP_VITE_DEV_PORT=13601 --setenv=APP_SAMPLE_DATA=true --setenv=NODE_OPTIONS=--conditions=development /usr/bin/node node_modules/tsx/dist/cli.mjs --tsconfig tsconfig.server.json server/standalone.ts
