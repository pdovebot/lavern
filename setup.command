#!/usr/bin/env bash
# macOS Finder double-click entrypoint. Hands off to setup.sh.
cd "$(dirname "${BASH_SOURCE[0]}")"
./setup.sh
echo ""
echo "Press any key to close…"
read -n 1 -s
