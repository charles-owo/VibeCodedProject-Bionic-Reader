# ⚡ VibeCodedProject — Bionic Reader

> High-contrast Bionic Reading Chrome Extension for faster reading, focus guidance, and superior dark-mode typography.

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](./bionic-reader/manifest.json)
[![Manifest V3](https://img.shields.io/badge/Chrome-Manifest%20V3-success.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Project](https://img.shields.io/badge/VibeCoded-Project-6366f1.svg?style=flat&logo=rocket)](https://github.com/charles-owo/VibeCodedProject-Bionic-Reader)

---

## ⚡ 1-Click Fast Installer (For Non-Technical Users)

We have included automated desktop installers so you don't have to fiddle with paths or move files around manually:

- **macOS Users**:
  - Simply double-click **`install-mac.command`**.
  - It automatically copies the extension to your local Application Support folder, opens Chrome to `chrome://extensions`, and reveals the folder in Finder.
  - In Chrome, flip the **Developer mode** toggle ON and click **Load unpacked**.
- **Windows Users**:
  - Double-click **`install-windows.bat`**.
  - Automatically copies the extension into `%LOCALAPPDATA%`, launches Chrome, and opens File Explorer for you.

---

## 📦 Manual Installation (Standard)

1. Open Google Chrome and go to `chrome://extensions`.
2. Turn on **Developer mode** (top-right toggle).
3. Click **Load unpacked** (top-left button).
4. Select the [`bionic-reader`](./bionic-reader) folder.
5. Pin the extension to your toolbar. Press <kbd>Alt</kbd> + <kbd>B</kbd> anytime to toggle!

---

## 🚀 Key Features

- **Theme-Aware High Contrast**: Custom tuned for dark mode (Medium, Twitter, Reddit) with 2.4:1 contrast ratio.
- **Anchor Color Palette**: Choose between Pure White, Warm Amber (night mode), Electric Cyan, Mint Emerald, and Lilac.
- **Dynamic Infinite Scroll**: Debounced `MutationObserver` formats newly loaded articles seamlessly.
- **Non-Destructive**: Reverts to original text cleanly on toggle off; protects code snippets, forms, and rich text editors.
