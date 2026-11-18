#!/usr/bin/env bash
# 初始化个人/协作知识库目录结构（宿主无关）。
set -euo pipefail

CAP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TPL="$CAP_ROOT/templates/repo"

PATH_OUT=""
TITLE="我的知识库"
SKILL_NAME="team-know"
DIMS="businesses,features,tech"
DIM_CNS=""
SCENARIO="通用个人/协作知识沉淀"
PRODUCT_OPS="on"
WITH_CURSOR_RULES=0
FORCE=0

usage() {
  cat <<EOF
Usage: bash scripts/init-know-repo.sh --path ABS --title NAME [options]

  --path ABS              知识库绝对路径（必填）
  --title NAME            知识库标题
  --skill-name NAME       技能名（默认 team-know）
  --dims a,b,c            三维目录名（默认 businesses,features,tech）
  --dim-cns 中1,中2,中3   三维中文名（默认 业务,功能,技术）
  --scenario TEXT         场景一句话
  --product-ops on|off    是否保留产品↔运营对照（默认 on）
  --with-cursor-rules     额外生成 .cursor/rules（可选）
  --force                 允许写入已存在的非空目录（不覆盖已有文件）

EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --path) PATH_OUT="${2:-}"; shift 2 ;;
    --title) TITLE="${2:-}"; shift 2 ;;
    --skill-name) SKILL_NAME="${2:-}"; shift 2 ;;
    --dims) DIMS="${2:-}"; shift 2 ;;
    --dim-cns) DIM_CNS="${2:-}"; shift 2 ;;
    --scenario) SCENARIO="${2:-}"; shift 2 ;;
    --product-ops) PRODUCT_OPS="${2:-}"; shift 2 ;;
    --with-cursor-rules) WITH_CURSOR_RULES=1; shift ;;
    --force) FORCE=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "unknown arg: $1" >&2; usage; exit 2 ;;
  esac
done

if [[ -z "$PATH_OUT" ]]; then
  echo "error: --path required" >&2
  usage
  exit 2
fi

if [[ "$PATH_OUT" != /* ]]; then
  echo "error: --path must be absolute" >&2
  exit 2
fi

IFS=',' read -r -a DIM_ARR <<<"$DIMS"
if [[ "${#DIM_ARR[@]}" -ne 3 ]]; then
  echo "error: --dims must have exactly 3 names" >&2
  exit 2
fi
DIM1="$(echo "${DIM_ARR[0]}" | tr -d '[:space:]')"
DIM2="$(echo "${DIM_ARR[1]}" | tr -d '[:space:]')"
DIM3="$(echo "${DIM_ARR[2]}" | tr -d '[:space:]')"

if [[ -z "$DIM_CNS" ]]; then
  DIM1_CN="业务"; DIM2_CN="功能"; DIM3_CN="技术"
else
  IFS=',' read -r -a CN_ARR <<<"$DIM_CNS"
  DIM1_CN="$(echo "${CN_ARR[0]:-维1}" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  DIM2_CN="$(echo "${CN_ARR[1]:-维2}" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  DIM3_CN="$(echo "${CN_ARR[2]:-维3}" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
fi

if [[ "$PRODUCT_OPS" == "on" ]]; then
  PRODUCT_OPS_SECTION=$(cat <<'EOS'
更新 **功能** 或 **业务** 时，检查产品与运营两侧：

| 侧 | 记什么 |
| --- | --- |
| 产品 | 规则、范围、验收、对外话术要点 |
| 运营 | 投放 / 活动口径、配置项名、值班注意、对客说明 |

任一侧变更若影响另一侧，**同一次整理里补齐或标「待确认」**。
EOS
)
else
  PRODUCT_OPS_SECTION="（本库已关闭产品↔运营强制对照；按场景自行记录相关侧即可。）"
fi

if [[ -d "$PATH_OUT" ]]; then
  if [[ -n "$(ls -A "$PATH_OUT" 2>/dev/null || true)" && "$FORCE" -ne 1 ]]; then
    echo "error: $PATH_OUT exists and is not empty (use --force)" >&2
    exit 2
  fi
else
  mkdir -p "$PATH_OUT"
fi

render() {
  local src="$1"
  local dest="$2"
  local dim_for_template="${3:-$DIM1}"
  mkdir -p "$(dirname "$dest")"
  if [[ -e "$dest" && "$FORCE" -eq 1 ]]; then
    echo "skip existing $dest"
    return 0
  fi
  TITLE="$TITLE" SKILL_NAME="$SKILL_NAME" KNOW_REPO="$PATH_OUT" \
  DIM1="$DIM1" DIM2="$DIM2" DIM3="$DIM3" \
  DIM1_CN="$DIM1_CN" DIM2_CN="$DIM2_CN" DIM3_CN="$DIM3_CN" \
  SCENARIO="$SCENARIO" PRODUCT_OPS_SECTION="$PRODUCT_OPS_SECTION" DIM="$dim_for_template" \
  python3 - "$src" "$dest" <<'PY'
import os, pathlib, sys
src, dest = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
text = src.read_text(encoding="utf-8")
repl = {
    "__TITLE__": os.environ["TITLE"],
    "__SKILL_NAME__": os.environ["SKILL_NAME"],
    "__KNOW_REPO__": os.environ["KNOW_REPO"],
    "__DIM1__": os.environ["DIM1"],
    "__DIM2__": os.environ["DIM2"],
    "__DIM3__": os.environ["DIM3"],
    "__DIM1_CN__": os.environ["DIM1_CN"],
    "__DIM2_CN__": os.environ["DIM2_CN"],
    "__DIM3_CN__": os.environ["DIM3_CN"],
    "__SCENARIO__": os.environ["SCENARIO"],
    "__PRODUCT_OPS_SECTION__": os.environ.get("PRODUCT_OPS_SECTION", ""),
    "__DIM__": os.environ.get("DIM", os.environ["DIM1"]),
}
for k, v in repl.items():
    text = text.replace(k, v)
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(text, encoding="utf-8")
print(f"wrote {dest}")
PY
}

render "$TPL/RULES.md.tpl" "$PATH_OUT/RULES.md"
render "$TPL/SKILL.md.tpl" "$PATH_OUT/SKILL.md"
render "$TPL/AGENTS.md.tpl" "$PATH_OUT/AGENTS.md"
render "$TPL/INSTALL.md.tpl" "$PATH_OUT/INSTALL.md"
render "$TPL/harness/AGENTS.snippet.md.tpl" "$PATH_OUT/harness/AGENTS.snippet.md"
render "$TPL/_meta/taxonomy.md.tpl" "$PATH_OUT/_meta/taxonomy.md"
render "$TPL/sketch/README.md.tpl" "$PATH_OUT/sketch/README.md"
mkdir -p "$PATH_OUT/sketch/_archived"

for d in "$DIM1" "$DIM2" "$DIM3"; do
  cn="$DIM1_CN"
  [[ "$d" == "$DIM2" ]] && cn="$DIM2_CN"
  [[ "$d" == "$DIM3" ]] && cn="$DIM3_CN"
  mkdir -p "$PATH_OUT/$d"
  render "$TPL/dim/_template/index.md.tpl" "$PATH_OUT/$d/_template/index.md" "$d"
  cat >"$PATH_OUT/$d/index.md" <<EOF
# ${cn} · 维索引

> 格式：\`id[ABCDE]: F一句 | aliases: … | updated:YYYY-MM-DD\`

\`\`\`text
\`\`\`
EOF
  echo "wrote $PATH_OUT/$d/index.md"
done

TODAY="$(date +%Y-%m-%d)"
cat >"$PATH_OUT/index.md" <<EOF
# ${TITLE} · 总索引

> 先读本文件。用 **五位标签 + aliases + updated** 缩小范围，再打开命中条目。
>
> 场景：${SCENARIO}
>
> AI 入口：[\`SKILL.md\`](SKILL.md) · 规则：[\`RULES.md\`](RULES.md) · 分类：[\`_meta/taxonomy.md\`](_meta/taxonomy.md)
>
> **\`sketch/\` 不在本索引内** — 见 [\`sketch/README.md\`](sketch/README.md)。

格式：

\`\`\`text
id[ABCDE]: F一句 | aliases: a,b,c | updated:YYYY-MM-DD
\`\`\`

---

## ${DIM1_CN} ${DIM1}

见 [\`${DIM1}/index.md\`](${DIM1}/index.md)

\`\`\`text
\`\`\`

## ${DIM2_CN} ${DIM2}

见 [\`${DIM2}/index.md\`](${DIM2}/index.md)

\`\`\`text
\`\`\`

## ${DIM3_CN} ${DIM3}

见 [\`${DIM3}/index.md\`](${DIM3}/index.md)

\`\`\`text
\`\`\`

<!-- bootstrapped: ${TODAY} by team-know -->
EOF
echo "wrote $PATH_OUT/index.md"

mkdir -p "$PATH_OUT/scripts"
cp "$TPL/scripts/install-skill.sh" "$PATH_OUT/scripts/install-skill.sh"
cp "$TPL/scripts/doctor-skill.sh" "$PATH_OUT/scripts/doctor-skill.sh"
chmod +x "$PATH_OUT/scripts/install-skill.sh" "$PATH_OUT/scripts/doctor-skill.sh"

# README
cat >"$PATH_OUT/README.md" <<EOF
# ${TITLE}

个人/协作知识库（由 team-know 初始化）。

- 规则唯一源：\`RULES.md\`
- 技能入口：\`SKILL.md\`
- 安装：\`bash scripts/install-skill.sh\`
- 体检：\`bash scripts/doctor-skill.sh\`

场景：${SCENARIO}
EOF

if [[ "$WITH_CURSOR_RULES" -eq 1 ]]; then
  mkdir -p "$PATH_OUT/.cursor/rules"
  cat >"$PATH_OUT/.cursor/rules/${SKILL_NAME}.mdc" <<EOF
---
description: ${TITLE} 知识库规则（可选 Cursor 适配；完整规则见 RULES.md）
globs:
alwaysApply: true
---

本仓库规则唯一源是 \`RULES.md\`。操作前先读它。技能名：\`${SKILL_NAME}\`。
知识正文只写本仓库三维，不写进其他业务工程。每次先检查 \`sketch/\`。
EOF
  echo "wrote $PATH_OUT/.cursor/rules/${SKILL_NAME}.mdc (optional)"
fi

echo
echo "Initialized: $PATH_OUT"
echo "Next: customize RULES/SKILL for scenario, then guided tour (sketch → dim → index)."
echo "Install hosts: bash \"$PATH_OUT/scripts/install-skill.sh\""
