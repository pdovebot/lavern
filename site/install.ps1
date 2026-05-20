#Requires -Version 5.1
<#
  Lavern installer — https://lavern.ai

  Usage:
    powershell -ExecutionPolicy Bypass -Command "irm https://lavern.ai/install.ps1 | iex"

  Or — recommended for irm | iex on the internet — inspect first:
    irm https://lavern.ai/install.ps1 -OutFile install.ps1
    notepad install.ps1
    .\install.ps1

  What this script does:
    1. Verifies git, Node 22+, and npm are installed.
    2. Shallow-clones github.com/AnttiHero/lavern into .\lavern
       (override with $env:LAVERN_DEST = 'somewhere-else' before piping).
    3. Runs `npm install` in the project root and in viz\.
    4. Prints the commands you need to start the dev servers.

  What it deliberately does NOT do:
    - Touch your PATH, $PROFILE, or any global state.
    - Install anything outside the target directory.
    - Require admin.
    - Send telemetry.

  License: Apache 2.0. Same as the repo.
#>

$ErrorActionPreference = 'Stop'

$Dest = if ($env:LAVERN_DEST) { $env:LAVERN_DEST } else { 'lavern' }

# --- Colours ----------------------------------------------------------
$e = [char]27
$BOLD  = "$e[1m"; $DIM   = "$e[2m"; $RESET = "$e[0m"
$GREEN = "$e[32m"; $RED  = "$e[31m"; $AMBER = "$e[33m"

function Write-Ok   ($msg) { Write-Host "  ${GREEN}OK${RESET}   $msg" }
function Write-Warn ($msg) { Write-Host "  ${AMBER}!${RESET}    $msg" }
function Write-Err  ($msg) { Write-Host "  ${RED}x${RESET}    $msg" }
function Write-Step ($msg) { Write-Host ""; Write-Host "${BOLD}${msg}${RESET}" }

# --- Banner -----------------------------------------------------------
Write-Host ""
Write-Host "  ${BOLD}LAVERN${RESET}"
Write-Host "  a multi-agent legal system. yours."
Write-Host "  not a law firm. not legal advice. use at your own risk."
Write-Host "  https://lavern.ai"
Write-Host ""

function Test-CommandExists($name) {
  $null -ne (Get-Command $name -ErrorAction SilentlyContinue)
}

# --- 1. Prerequisites -------------------------------------------------
Write-Step "Checking prerequisites"

if (-not (Test-CommandExists 'git')) {
  Write-Err "git is not installed."
  Write-Err "  Install git first: https://git-scm.com/download/win"
  Write-Err "  Or via winget:     winget install --id Git.Git"
  exit 1
}
$gitVersion = ((git --version) -replace 'git version ', '').Trim()
Write-Ok "git $gitVersion"

if (-not (Test-CommandExists 'node')) {
  Write-Err "Node.js is not installed."
  Write-Err "  Install Node 22+: https://nodejs.org"
  Write-Err "  Or via winget:    winget install --id OpenJS.NodeJS.LTS"
  exit 1
}

$nodeVersion = (node -p 'process.versions.node').Trim()
$nodeMajor = [int]($nodeVersion.Split('.')[0])
if ($nodeMajor -lt 22) {
  Write-Err "Node v$nodeVersion is too old. Lavern requires Node 22+."
  Write-Err "  winget install --id OpenJS.NodeJS.LTS"
  exit 1
}
Write-Ok "Node v$nodeVersion"

if (-not (Test-CommandExists 'npm')) {
  Write-Err "npm is not installed (it usually ships with Node)."
  exit 1
}
$npmVersion = (npm --version).Trim()
Write-Ok "npm v$npmVersion"

# --- 2. Clone ---------------------------------------------------------
Write-Step "Cloning Lavern into $Dest\"

if (Test-Path $Dest) {
  Write-Warn "$Dest\ already exists. Skipping clone."
  Write-Warn "  To start fresh:  Remove-Item -Recurse -Force $Dest  and re-run this script."
} else {
  git clone --depth=1 https://github.com/AnttiHero/lavern.git $Dest
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  Write-Ok "Cloned"
}

Set-Location $Dest

# --- 3. Install dependencies ------------------------------------------
Write-Step "Installing dependencies (backend)"
npm install --no-audit --no-fund --silent
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Ok "Backend deps installed"

Write-Step "Installing dependencies (dashboard)"
Push-Location viz
try {
  npm install --no-audit --no-fund --silent
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
  Pop-Location
}
Write-Ok "Dashboard deps installed"

# --- 4. Next steps ----------------------------------------------------
Write-Step "Done. Next:"
Write-Host ""
Write-Host "  cd $Dest"
Write-Host ""
Write-Host "  ${BOLD}Verify the install${RESET}"
Write-Host "      npx lavern --help            print the CLI usage banner"
Write-Host ""
Write-Host "  ${BOLD}Run the dashboard${RESET}"
Write-Host "      Terminal 1   ${DIM}# API server on :3000 (LOCAL MODE, no API key needed)${RESET}"
Write-Host "        npm run serve:dev"
Write-Host "      Terminal 2   ${DIM}# Dashboard on :5173, hot reload${RESET}"
Write-Host "        cd viz; npm run dev"
Write-Host "      Then open  ${BOLD}http://localhost:5173${RESET}"
Write-Host ""
Write-Host "  ${BOLD}Try it with the bundled sample${RESET}"
Write-Host "      A short, fabricated SaaS Terms of Service lives in samples\."
Write-Host "      Set ANTHROPIC_API_KEY in .env first, then:"
Write-Host "        npx lavern samples\sample-terms-of-service.txt --workflow review"
Write-Host ""
Write-Host "  ${BOLD}EU teams${RESET}"
Write-Host "      Set LAVERN_PROVIDER=mistral and MISTRAL_API_KEY=... in .env."
Write-Host "      The entire stack routes through Mistral (Paris). No document"
Write-Host "      content reaches Anthropic."
Write-Host ""
Write-Host "  ${DIM}Full quickstart:  https://github.com/AnttiHero/lavern/blob/main/QUICKSTART.md${RESET}"
Write-Host "  ${DIM}Architecture:     https://lavern.ai/architecture/${RESET}"
Write-Host "  ${DIM}Watch the demo:   https://lavern.ai/demo/${RESET}"
Write-Host ""
