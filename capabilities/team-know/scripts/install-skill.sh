#!/usr/bin/env bash
# 将 team-know 能力入口安装到各宿主 skills（通用结构，不绑 Cursor）
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAME="team-know"
MODE="copy"
TARGETS_CSV="claude,codex,agents,workbuddy,workbuddy-ai,cursor"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode) MODE="${2:-}"; shift 2 ;;
    --targets) TARGETS_CSV="${2:-}"; shift 2 ;;
    *) shift ;;
  esac
done
[[ "$TARGETS_CSV" == "all" ]] && TARGETS_CSV="claude,codex,agents,workbuddy,workbuddy-ai,cursor"
target_dir() {
  case "$1" in
    claude) echo "$HOME/.claude/skills/$NAME" ;;
    cursor) echo "$HOME/.cursor/skills/$NAME" ;;
    codex) echo "$HOME/.codex/skills/$NAME" ;;
    agents) echo "$HOME/.agents/skills/$NAME" ;;
    workbuddy) echo "$HOME/.workbuddy/skills/$NAME" ;;
    workbuddy-ai) echo "$HOME/.workbuddy-ai/skills/$NAME" ;;
    *) echo "" ;;
  esac
}
IFS=',' read -r -a TARGETS <<<"$TARGETS_CSV"
for t in "${TARGETS[@]}"; do
  t="$(echo "$t" | tr -d '[:space:]')"
  [[ -z "$t" ]] && continue
  dir="$(target_dir "$t")"
  [[ -z "$dir" ]] && continue
  mkdir -p "$(dirname "$dir")" 2>/dev/null || { echo "SKIP $t"; continue; }
  if [[ "$MODE" == "link" ]]; then
    rm -rf "$dir"; ln -sfn "$ROOT" "$dir"; echo "OK $t link"; continue
  fi
  [[ -L "$dir" ]] && rm -f "$dir"
  mkdir -p "$dir"
  cp "$ROOT/SKILL.md" "$dir/SKILL.md"
  ln -sfn "$ROOT/index.md" "$dir/index.md"
  ln -sfn "$ROOT/references" "$dir/references"
  ln -sfn "$ROOT/scripts" "$dir/scripts"
  ln -sfn "$ROOT/templates" "$dir/templates"
  echo "OK $t $dir"
done
