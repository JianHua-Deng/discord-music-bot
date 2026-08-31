#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
LOG_FILE="$LOG_DIR/bot-$(date +%Y-%m-%d).log"

mkdir -p "$LOG_DIR"
cd "$SCRIPT_DIR"

{
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Discord music bot"
    echo "Working directory: $SCRIPT_DIR"
    echo "Node: $(node --version 2>/dev/null || echo 'not found')"
    echo "npm: $(npm --version 2>/dev/null || echo 'not found')"
} >> "$LOG_FILE"

if ! command -v npm >/dev/null 2>&1; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] npm was not found on PATH" >> "$LOG_FILE"
    exit 1
fi

exec npm start >> "$LOG_FILE" 2>&1
