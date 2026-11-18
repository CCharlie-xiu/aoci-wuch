#!/usr/bin/env bash
# 把本知识库技能安装到各 AI 宿主的用户级 skills 目录（可重复执行）。
# 缺宿主则跳过，不整装失败。不绑 Cursor。
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC_SKILL="$ROOT/SKILL.md"
SRC_RULES="$ROOT/RULES.md"
SRC_INSTALL="$ROOT/INSTALL.md"

if [[ ! -f "$SRC_SKILL" ]]; then
  echo "error: missing $SRC_SKILL" >&2
  exit 1
fi

NAME="$(grep -E '^name:' "$SRC_SKILL" | head -1 | sed 's/^name:[[:space:]]*//' | tr -d '"' | tr -d "'")"
if [[ -z "$NAME" ]]; then
  NAME="$(basename "$ROOT")"
fi

MODE="copy"
TARGETS_CSV="claude,codex,agents,workbuddy,workbuddy-ai,cursor"

usage() {
  cat <<EOF
Usage: bash scripts/install-skill.sh [--mode copy|link] [--targets list] [--repo PATH]

  --mode copy   写入渲染后的 SKILL.md + 软链 RULES/INSTALL/AGENTS/harness（默认）
  --mode link   整个技能目录软链到仓库根
  --targets     逗号分隔：claude,codex,agents,workbuddy,workbuddy-ai,cursor 或 all
  --repo PATH   覆盖知识库绝对路径

EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode) MODE="${2:-}"; shift 2 ;;
    --targets) TARGETS_CSV="${2:-}"; shift 2 ;;
    --repo) ROOT="$(cd "${2:-}" && pwd)"; SRC_SKILL="$ROOT/SKILL.md"; SRC_RULES="$ROOT/RULES.md"; SRC_INSTALL="$ROOT/INSTALL.md"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "unknown arg: $1" >&2; usage; exit 2 ;;
  esac
done

if [[ "$TARGETS_CSV" == "all" ]]; then
  TARGETS_CSV="claude,codex,agents,workbuddy,workbuddy-ai,cursor"
fi

IFS=',' read -r -a TARGETS <<<"$TARGETS_CSV"

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

render_skill() {
  local dest="$1"
  sed -e "s|__KNOW_REPO__|$ROOT|g" \
      -e "s|<REPO>|$ROOT|g" \
      "$SRC_SKILL" >"$dest"
}

install_one() {
  local key="$1"
  local dir
  dir="$(target_dir "$key")"
  if [[ -z "$dir" ]]; then
    echo "skip unknown target: $key"
    return 0
  fi

  local parent
  parent="$(dirname "$dir")"
  if [[ ! -d "$parent" ]]; then
    mkdir -p "$parent" 2>/dev/null || {
      echo "SKIP $key  cannot create $parent"
      return 0
    }
  fi

  if [[ "$MODE" == "link" ]]; then
    if [[ -e "$dir" || -L "$dir" ]]; then
      rm -rf "$dir"
    fi
    ln -sfn "$ROOT" "$dir"
    echo "OK  $key  link -> $ROOT"
    return 0
  fi

  if [[ -L "$dir" ]]; then
    rm -f "$dir"
  fi
  mkdir -p "$dir"
  render_skill "$dir/SKILL.md"
  ln -sfn "$SRC_RULES" "$dir/RULES.md"
  ln -sfn "$SRC_INSTALL" "$dir/INSTALL.md"
  [[ -f "$ROOT/AGENTS.md" ]] && ln -sfn "$ROOT/AGENTS.md" "$dir/AGENTS.md"
  [[ -d "$ROOT/harness" ]] && ln -sfn "$ROOT/harness" "$dir/harness"
  echo "OK  $key  $dir"
}

echo "repo: $ROOT"
echo "name: $NAME"
echo "mode: $MODE"
for t in "${TARGETS[@]}"; do
  t="$(echo "$t" | tr -d '[:space:]')"
  [[ -z "$t" ]] && continue
  install_one "$t"
done

echo
echo "Done. Claude: 新开会话后输入 /$NAME"
echo "Doctor: bash \"$ROOT/scripts/doctor-skill.sh\""
