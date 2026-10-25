#!/usr/bin/env bash
# Deploy the latest build to the RePebble store (prep + open developer dashboard).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$ROOT/scripts/publish-rebble.sh" "$@"
