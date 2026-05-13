#!/usr/bin/env bash
# Lavern — one-step onboarding.
#
# Run from the repo root:
#   ./setup.sh
#
# On macOS you can also double-click setup.command from Finder.
# Windows users: run setup.bat instead.

set -e

# Resolve repo root (directory containing this script).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

bold=$(printf '\033[1m')
cyan=$(printf '\033[36m')
red=$(printf '\033[31m')
yellow=$(printf '\033[33m')
green=$(printf '\033[32m')
dim=$(printf '\033[2m')
reset=$(printf '\033[0m')

echo ""
echo "${bold}${cyan}Lavern — setup${reset}"
echo ""

# ── Platform detection ────────────────────────────────────────────────────
OS="$(uname -s)"
case "$OS" in
  Darwin) PLATFORM=macos ;;
  Linux)  PLATFORM=linux ;;
  *)      PLATFORM=unknown ;;
esac

# Detect Linux package manager (used only on Linux).
LINUX_PKG=""
if [ "$PLATFORM" = "linux" ]; then
  if   command -v apt-get >/dev/null 2>&1; then LINUX_PKG=apt
  elif command -v dnf     >/dev/null 2>&1; then LINUX_PKG=dnf
  elif command -v pacman  >/dev/null 2>&1; then LINUX_PKG=pacman
  elif command -v zypper  >/dev/null 2>&1; then LINUX_PKG=zypper
  elif command -v apk     >/dev/null 2>&1; then LINUX_PKG=apk
  fi
fi

# Print OS-specific install instructions for Node + npm.
print_install_hints() {
  echo ""
  echo "${bold}How to install Node 20+ on your system:${reset}"
  case "$PLATFORM" in
    macos)
      if command -v brew >/dev/null 2>&1; then
        echo "  ${cyan}brew install node${reset}"
      else
        echo "  • Download the LTS installer: ${cyan}https://nodejs.org/${reset}"
        echo "  • Or install Homebrew first (${dim}https://brew.sh${reset}) then: ${cyan}brew install node${reset}"
      fi
      ;;
    linux)
      case "$LINUX_PKG" in
        apt)    echo "  ${cyan}sudo apt update && sudo apt install -y nodejs npm${reset}" ;;
        dnf)    echo "  ${cyan}sudo dnf install -y nodejs npm${reset}" ;;
        pacman) echo "  ${cyan}sudo pacman -S --noconfirm nodejs npm${reset}" ;;
        zypper) echo "  ${cyan}sudo zypper install -y nodejs npm${reset}" ;;
        apk)    echo "  ${cyan}sudo apk add nodejs npm${reset}" ;;
        *)      echo "  • Use your distro's package manager, or follow ${cyan}https://nodejs.org/${reset}" ;;
      esac
      echo "  • Distro packages can lag — for Node 20+ specifically, use NodeSource:"
      echo "    ${dim}curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -${reset}"
      ;;
    *)
      echo "  • Download from ${cyan}https://nodejs.org/${reset}"
      ;;
  esac
  echo ""
  echo "Then re-run: ${cyan}./setup.sh${reset}"
  echo ""
}

# ── Node check ────────────────────────────────────────────────────────────
if ! command -v node >/dev/null 2>&1; then
  echo "${red}✗ Node.js is not installed.${reset}"

  # On macOS with Homebrew, offer to auto-install.
  if [ "$PLATFORM" = "macos" ] && command -v brew >/dev/null 2>&1; then
    echo ""
    printf "Install Node now via Homebrew (${cyan}brew install node${reset})? [Y/n] "
    read -r reply </dev/tty || reply=""
    case "$reply" in
      n|N|no|No|NO)
        print_install_hints
        exit 1
        ;;
      *)
        echo "${cyan}→${reset} Running: brew install node"
        if ! brew install node; then
          echo "${red}✗ brew install node failed.${reset}"
          print_install_hints
          exit 1
        fi
        echo "${green}✓${reset} Node installed."
        ;;
    esac
  else
    print_install_hints
    exit 1
  fi
fi

NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "${red}✗ Node $(node -v) is too old.${reset} Lavern needs Node 20 or newer."
  print_install_hints
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "${red}✗ npm is not on PATH.${reset}"
  echo "On most systems npm ships with Node — your install may be incomplete."
  print_install_hints
  exit 1
fi

echo "${green}✓${reset} Node $(node -v) · npm $(npm -v)"

# ── Root install ──────────────────────────────────────────────────────────
# --legacy-peer-deps: openai's optional zod@^3 peer conflicts with our zod@^4.
if [ ! -d node_modules ]; then
  echo "${cyan}→${reset} Installing dependencies (this may take a couple of minutes)…"
  npm install --legacy-peer-deps
fi

# ── Hand off to the interactive script ───────────────────────────────────
npm run setup --silent
