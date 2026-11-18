#!/usr/bin/env bash
# Pack a skill directory into a WorkBuddy-uploadable zip (excludes junk).
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: bash pack-wb-zip.sh <skill-dir> [out.zip]" >&2
  exit 2
fi

SRC="$(cd "$1" && pwd)"
NAME="$(basename "$SRC")"
OUT="${2:-}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

python3 "$SCRIPT_DIR/validate-wb-skill.py" "$SRC"

PARENT="$(dirname "$SRC")"
if [[ -z "$OUT" ]]; then
  OUT="$PARENT/${NAME}.zip"
fi
OUT="$(mkdir -p "$(dirname "$OUT")" && cd "$(dirname "$OUT")" && pwd)/$(basename "$OUT")"

rm -f "$OUT"
(
  cd "$PARENT"
  zip -r "$OUT" "$NAME" \
    -x "*/.git/*" \
    -x "*/.DS_Store" \
    -x "*/*.pyc" \
    -x "*/__pycache__/*" \
    -x "*/PACKAGING.md" \
    -x "*/*.zip"
)

echo "packed $OUT"
ls -la "$OUT"
