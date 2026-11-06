@echo off
title Bionic Reader Installer
echo ======================================================
echo  Installing Bionic Reader for Google Chrome...
echo ======================================================

set "SOURCE_DIR=%~dp0bionic-reader"
if not exist "%SOURCE_DIR%" set "SOURCE_DIR=%~dp0"

set "TARGET_DIR=%LOCALAPPDATA%\BionicReader"

echo Copying extension files to %TARGET_DIR%...
mkdir "%TARGET_DIR%" 2>nul
xcopy "%SOURCE_DIR%" "%TARGET_DIR%" /E /I /Y /Q >nul

echo Starting Google Chrome to extensions page...
start chrome "chrome://extensions"

echo Opening folder in File Explorer...
explorer "%TARGET_DIR%"

echo.
echo ======================================================
echo  Setup Complete!
echo  1. In Chrome, switch ON "Developer mode" (top right).
echo  2. Click "Load unpacked" (top left).
echo  3. Select the folder that just opened in Explorer.
echo ======================================================
echo.
pause
