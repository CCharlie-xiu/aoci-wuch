#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAME="team-know"
fail=0
for f in SKILL.md index.md scripts/init-know-repo.sh; do
  if [[ -e "$ROOT/$f" ]]; then
    echo "OK   repo  $f"
  else
    echo "MISS repo  $f"
    fail=1
  fi
done
for pair in \
  "claude:$HOME/.claude/skills/$NAME" \
  "codex:$HOME/.codex/skills/$NAME" \
  "agents:$HOME/.agents/skills/$NAME" \
  "workbuddy:$HOME/.workbuddy/skills/$NAME" \
  "workbuddy-ai:$HOME/.workbuddy-ai/skills/$NAME" \
  "cursor:$HOME/.cursor/skills/$NAME"
do
  label="${pair%%:*}"
  path="${pair#*:}"
  if [[ -f "$path/SKILL.md" || -L "$path/SKILL.md" || -L "$path" ]]; then
    echo "OK   $label  $path"
  else
    echo "MISS $label  $path  (optional)"
  fi
done
exit "$fail"
