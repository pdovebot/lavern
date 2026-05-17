#!/bin/sh
#
# Lavern installer — https://lavern.ai
#
# Usage:
#   curl -fsSL https://lavern.ai/install.sh | sh
#   curl -fsSL https://lavern.ai/install.sh | sh -s -- ~/code/lavern
#
# Or — recommended for curl | sh on the internet — inspect first:
#   curl -fsSL https://lavern.ai/install.sh -o install.sh
#   less install.sh
#   sh install.sh
#
# What this script does:
#   1. Verifies git, Node 22+, and npm are installed.
#   2. Shallow-clones github.com/AnttiHero/lavern into ./lavern (or $1).
#   3. Runs `npm install` in the project root and in viz/.
#   4. Prints the two commands you need to start the dev servers.
#
# What it deliberately does NOT do:
#   · Touch your $PATH, ~/.bashrc, or any global state.
#   · Install anything outside the target directory.
#   · Require sudo.
#   · Send telemetry.
#
# License: Apache 2.0. Same as the repo.
#

set -eu

# ─── Colours (only if stdout is a TTY) ────────────────────────────────
if [ -t 1 ]; then
  BOLD=$(printf '\033[1m')
  DIM=$(printf '\033[2m')
  RESET=$(printf '\033[0m')
  GREEN=$(printf '\033[32m')
  RED=$(printf '\033[31m')
  AMBER=$(printf '\033[33m')
else
  BOLD=''
  DIM=''
  RESET=''
  GREEN=''
  RED=''
  AMBER=''
fi

ok()   { printf '  %s\xe2\x9c\x93%s %s\n' "$GREEN" "$RESET" "$*"; }
warn() { printf '  %s!%s %s\n' "$AMBER" "$RESET" "$*"; }
err()  { printf '  %sx%s %s\n' "$RED" "$RESET" "$*" >&2; }
step() { printf '\n%s%s%s\n' "$BOLD" "$*" "$RESET"; }

# ─── Banner ───────────────────────────────────────────────────────────
cat <<EOF

  ${BOLD}LAVERN${RESET}
  an agentic law firm. yours.
  https://lavern.ai

EOF

DEST="${1:-lavern}"

# ─── 1. Prerequisites ─────────────────────────────────────────────────
step "Checking prerequisites"

if ! command -v git >/dev/null 2>&1; then
  err "git is not installed."
  err "  Install git first: https://git-scm.com"
  exit 1
fi
ok "git $(git --version | awk '{print $3}')"

if ! command -v node >/dev/null 2>&1; then
  err "Node.js is not installed."
  err "  Install Node 22+: https://nodejs.org   or   https://github.com/nvm-sh/nvm"
  exit 1
fi

NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
if [ "$NODE_MAJOR" -lt 22 ]; then
  err "Node v$(node -p 'process.versions.node') is too old. Lavern requires Node 22+."
  err "  nvm install 22 && nvm use 22"
  exit 1
fi
ok "Node v$(node -p 'process.versions.node')"

if ! command -v npm >/dev/null 2>&1; then
  err "npm is not installed (it usually ships with Node)."
  exit 1
fi
ok "npm v$(npm --version)"

# ─── 2. Clone ─────────────────────────────────────────────────────────
step "Cloning Lavern into ${DEST}/"

if [ -d "$DEST" ]; then
  warn "${DEST}/ already exists. Skipping clone."
  warn "  To start fresh:  rm -rf ${DEST} && re-run this script."
else
  git clone --depth=1 https://github.com/AnttiHero/lavern.git "$DEST"
  ok "Cloned"
fi

cd "$DEST"

# ─── 3. Install dependencies ──────────────────────────────────────────
step "Installing dependencies (backend)"
npm install --no-audit --no-fund --silent
ok "Backend deps installed"

step "Installing dependencies (dashboard)"
(cd viz && npm install --no-audit --no-fund --silent)
ok "Dashboard deps installed"

# ─── 4. Next steps ────────────────────────────────────────────────────
step "Done. Next:"
cat <<EOF

  cd ${DEST}

  ${BOLD}Verify the install${RESET}
      npx lavern --help            print the CLI usage banner

  ${BOLD}Run the dashboard${RESET}
      Terminal 1   ${DIM}# API server on :3000 (LOCAL MODE, no API key needed)${RESET}
        npm run serve:dev
      Terminal 2   ${DIM}# Dashboard on :5173, hot reload${RESET}
        cd viz && npm run dev
      Then open  ${BOLD}http://localhost:5173${RESET}

  ${BOLD}Try it with the bundled sample${RESET}
      A short, fabricated SaaS Terms of Service lives in samples/.
      Set ANTHROPIC_API_KEY in .env first, then:
        npx lavern samples/sample-terms-of-service.txt --workflow review

  ${BOLD}EU teams${RESET}
      Set LAVERN_PROVIDER=mistral and MISTRAL_API_KEY=... in .env.
      The entire stack routes through Mistral (Paris). No document
      content reaches Anthropic.

  ${DIM}Full quickstart:  https://github.com/AnttiHero/lavern/blob/main/QUICKSTART.md${RESET}
  ${DIM}Architecture:     https://lavern.ai/architecture/${RESET}
  ${DIM}Watch the demo:   https://lavern.ai/demo/${RESET}

EOF
