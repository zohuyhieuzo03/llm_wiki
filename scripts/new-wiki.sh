#!/usr/bin/env bash
# Scaffold a new LLM Wiki project from project-base conventions.
#
# Usage:
#   ./scripts/new-wiki.sh <name> <parent-dir> [template]
#
# Examples:
#   ./scripts/new-wiki.sh my-research ~/wikis research
#   ./scripts/new-wiki.sh work-wiki ~/dev/work business
#
# Templates: general | business | research | reading | personal
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NAME="${1:-}"
PARENT="${2:-}"
TEMPLATE="${3:-general}"

if [[ -z "$NAME" || -z "$PARENT" ]]; then
  echo "Usage: $0 <name> <parent-dir> [template]" >&2
  echo "Templates: general | business | research | reading | personal" >&2
  exit 1
fi

TARGET="${PARENT%/}/${NAME}"
if [[ -e "$TARGET" ]]; then
  echo "Error: path already exists: $TARGET" >&2
  exit 1
fi

node --experimental-strip-types "$ROOT/scripts/scaffold-wiki.ts" "$NAME" "$PARENT" "$TEMPLATE"
