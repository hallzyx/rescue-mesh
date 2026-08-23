#!/usr/bin/env bash
set -euo pipefail

# Importa los 17 commits del Cloud Agent sobre tu clone de Origin (3 commits).
# Ejecutar en WSL, dentro del repo, con origin auth login hecho.

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUNDLE="${1:-$ROOT/rescuemesh-full.bundle}"

if [[ ! -f "$BUNDLE" ]]; then
  echo "No encuentro el bundle: $BUNDLE" >&2
  exit 1
fi

git bundle verify "$BUNDLE" >/dev/null

echo "→ Importando historial completo desde $BUNDLE"
git pull "$BUNDLE" main

echo ""
echo "→ Listo. Commits locales:"
git log --oneline -5
echo ""
echo "Sube a Origin y GitHub:"
echo "  git push origin main"
echo "  git push github main   # si tienes ese remoto"
