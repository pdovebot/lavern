@echo off
REM Lavern - one-step onboarding for Windows.
REM Double-click from Explorer, or run from cmd:  setup.bat

setlocal enableextensions
cd /d "%~dp0"

echo.
echo Lavern - setup
echo.

REM ── Node check ─────────────────────────────────────────────────────────
where node >nul 2>nul
if errorlevel 1 (
  echo [X] Node.js is not installed.
  echo.
  echo How to install Node 20+ on Windows:
  echo   - Download the LTS installer from https://nodejs.org/
  echo   - Or via winget:  winget install OpenJS.NodeJS.LTS
  echo.
  echo Then re-run setup.bat
  echo.
  pause
  exit /b 1
)

REM Version check: require Node 20+.
for /f "tokens=1 delims=." %%i in ('node -p "process.versions.node.split('.')[0]"') do set NODE_MAJOR=%%i
if %NODE_MAJOR% LSS 20 (
  echo [X] Your Node version is too old. Lavern needs Node 20 or newer.
  node -v
  echo.
  echo Upgrade from https://nodejs.org/ or run:  winget upgrade OpenJS.NodeJS.LTS
  echo.
  pause
  exit /b 1
)

REM npm check.
where npm >nul 2>nul
if errorlevel 1 (
  echo [X] npm is not on PATH. Reinstall Node from https://nodejs.org/
  echo.
  pause
  exit /b 1
)

for /f "delims=" %%v in ('node -v') do set NODE_VER=%%v
for /f "delims=" %%v in ('npm -v') do set NPM_VER=%%v
echo [OK] Node %NODE_VER%  -  npm %NPM_VER%

REM ── Root install ──────────────────────────────────────────────────────
REM --legacy-peer-deps: openai's optional zod@^3 peer conflicts with our zod@^4.
if not exist node_modules (
  echo -^> Installing dependencies (this may take a couple of minutes)...
  call npm install --legacy-peer-deps
  if errorlevel 1 (
    echo.
    echo [X] npm install failed. See errors above.
    pause
    exit /b 1
  )
)

REM ── Hand off to the interactive script ────────────────────────────────
call npm run setup --silent

echo.
echo Press any key to close...
pause >nul
