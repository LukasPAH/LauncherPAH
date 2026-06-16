#!/bin/bash
set -e

export DOTNET_ROOT=/app/lib/dotnet
export PATH="$DOTNET_ROOT:$PATH"

FLAGS="--ozone-platform-hint=auto"

exec /app/main/LauncherPAH --no-sandbox $FLAGS "$@"