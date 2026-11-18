#!/usr/bin/env bash
# 检查知识库技能在各宿主是否可被发现。缺 Cursor 不算失败。
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAME="team-know"
if [[ -f "$ROOT/SKILL.md" ]]; then
  n="$(grep -E '^name:' "$ROOT/SKILL.md" | head -1 | sed 's/^name:[[:space:]]*//' | tr -d '"' | tr -d "'")"
  [[ -n "$n" ]] && NAME="$n"
fi

fail=0

need_file() {
  local f="$1"
  if [[ -f "$ROOT/$f" ]]; then
    echo "OK   repo  $f"
  else
    echo "MISS repo  $f"
    fail=1
  fi
}

need_file "RULES.md"
need_file "SKILL.md"
need_file "AGENTS.md"
need_file "index.md"

check() {
  local label="$1"
  local path="$2"
  if [[ -f "$path/SKILL.md" || -L "$path/SKILL.md" ]]; then
    if grep -q '__KNOW_REPO__\|<REPO>' "$path/SKILL.md" 2>/dev/null; then
      echo "WARN $label  $path  (仍含路径占位符，请重跑 install-skill.sh)"
    else
      echo "OK   $label  $path"
    fi
  elif [[ -L "$path" ]]; then
    echo "OK   $label  $path (symlink)"
  else
    echo "MISS $label  $path  (可选：未安装该宿主)"
  fi
}

echo "knowledge repo: $ROOT"
echo "skill name: $NAME"
check "claude      " "$HOME/.claude/skills/$NAME"
check "codex       " "$HOME/.codex/skills/$NAME"
check "agents/DSH  " "$HOME/.agents/skills/$NAME"
check "workbuddy   " "$HOME/.workbuddy/skills/$NAME"
check "workbuddy-ai" "$HOME/.workbuddy-ai/skills/$NAME"
check "cursor      " "$HOME/.cursor/skills/$NAME"

if [[ "$fail" -ne 0 ]]; then
  echo "repo core files incomplete" >&2
  exit 1
fi
echo "Doctor OK (宿主 MISS 仅表示未安装，不算失败)"
