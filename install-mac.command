#!/usr/bin/env bash
# ========================================================
# ⚡ VibeCodedProject — Bionic Reader Mac Installer
# Double-click this file to set up Bionic Reader in Chrome
# ========================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SOURCE_DIR="$DIR/bionic-reader"
if [ ! -d "$SOURCE_DIR" ]; then
  SOURCE_DIR="$DIR"
fi

TARGET_DIR="$HOME/Library/Application Support/BionicReader"

echo "======================================================"
echo "⚡ Installing Bionic Reader..."
echo "======================================================"

# 1. Create target directory and copy extension files
mkdir -p "$TARGET_DIR"
cp -R "$SOURCE_DIR/"* "$TARGET_DIR/"

# 2. Copy path to macOS clipboard for convenience
echo "$TARGET_DIR" | pbcopy

echo "✓ Extension files saved to: $TARGET_DIR"
echo "✓ Path copied to clipboard!"

# 3. Open Chrome directly to the extensions manager
open -a "Google Chrome" "chrome://extensions" 2>/dev/null || open -a "Chromium" "chrome://extensions" 2>/dev/null || true

# 4. Reveal the folder in macOS Finder
open -R "$TARGET_DIR/manifest.json" 2>/dev/null || open "$TARGET_DIR" 2>/dev/null || true

# 5. Display friendly Native macOS Dialog
osascript -e 'display alert "⚡ Bionic Reader Ready!" message "1. In Chrome, turn ON \"Developer mode\" (toggle in top-right).\n2. Click \"Load unpacked\" (top-left).\n3. Select the BionicReader folder opened in Finder (path is also copied to clipboard).\n\nEnjoy Bionic Reading!" buttons {"Done"} default button 1' 2>/dev/null || true

echo ""
echo "======================================================"
echo "🎉 Setup complete! You can close this window."
echo "======================================================"
