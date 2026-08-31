#!/usr/bin/env bash
set -Eeuo pipefail

export PATH="/c/Program Files/Git/usr/bin:/c/Program Files/Git/bin:/c/Program Files/nodejs:$PATH"

SCRIPT_DIR="/c/Users/dengj/Desktop/Personal Projects/discord-music-bot"
LOG_FILE="$SCRIPT_DIR/bot-startup.log"
NPM_CMD="/c/Program Files/nodejs/npm.cmd"
NODE_CMD="/c/Program Files/nodejs/node.exe"

cd "$SCRIPT_DIR"

{
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Discord music bot"
    echo "Working directory: $SCRIPT_DIR"
    echo "Node: $("${NODE_CMD}" --version 2>/dev/null || echo 'not found')"
    echo "npm: $("${NPM_CMD}" --version 2>/dev/null || echo 'not found')"
} >> "$LOG_FILE"

if [[ ! -x "$NODE_CMD" || ! -f "$NPM_CMD" ]]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Node or npm was not found at C:\\Program Files\\nodejs" >> "$LOG_FILE"
    exit 1
fi

exec "$NPM_CMD" start >> "$LOG_FILE" 2>&1
