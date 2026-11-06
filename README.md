# ⚡ VibeCodedProject — Bionic-Style Speed Reader

> High-contrast bionic-style reading extension for Chrome to guide your eyes, improve focus, and elevate dark-mode typography.

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](./bionic-reader/manifest.json)
[![Manifest V3](https://img.shields.io/badge/Chrome-Manifest%20V3-success.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Project](https://img.shields.io/badge/VibeCoded-Project-6366f1.svg?style=flat&logo=rocket)](https://github.com/charles-owo/VibeCodedProject-Bionic-Reader)

---

## ⚡ Easy Desktop Installers

We have included automated desktop helper scripts to simplify setting up the unpacked extension without navigating folder paths:

- **macOS Users**:
  - Double-click **`install-mac.command`**.
  - It copies the extension to your local Application Support folder, opens Chrome to `chrome://extensions`, and reveals the folder in Finder.
  - In Chrome, toggle **Developer mode** ON (top-right) and click **Load unpacked** (top-left).
- **Windows Users**:
  - Double-click **`install-windows.bat`**.
  - Automatically copies the extension into `%LOCALAPPDATA%`, launches Chrome, and opens File Explorer for you.

---

## 🔖 Zero-Install Bookmarklet

Prefer not to install an extension? You can also use the bookmarklet:
1. Open [`bookmarklet.html`](./bookmarklet.html) in your browser.
2. Drag the **⚡ Bionic Read** button into your Chrome Bookmarks bar.
3. Click it on any page (Medium, Notion, Wikipedia, blogs) to toggle bionic formatting!

*(Note: Open `bookmarklet.html` locally or via GitHub Pages; GitHub's source view does not support dragging bookmarklets).*

---

## 📦 Manual Installation (Standard)

1. Open Google Chrome and go to `chrome://extensions`.
2. Turn on **Developer mode** (top-right toggle).
3. Click **Load unpacked** (top-left button).
4. Select the [`bionic-reader`](./bionic-reader) folder.
5. Pin the extension to your toolbar. Press <kbd>Alt</kbd> + <kbd>B</kbd> anytime to toggle!

---

## 🚀 Key Features

- **Theme-Aware High Contrast**: Custom tuned for dark mode (Medium, Twitter, Reddit) with bold anchor highlights and customizable rest dimming.
- **Anchor Color Palette**: Choose between Pure White, Warm Amber (night mode), Electric Cyan, Mint Emerald, and Lilac.
- **Dynamic Infinite Scroll**: Debounced `MutationObserver` formats newly loaded articles seamlessly as you scroll.
- **DOM-Safe & Non-Destructive**: Reverts to original text cleanly on toggle off; protects code snippets, forms, and supports Notion.

---

## 🤖 AI Agent Guidelines

For AI coding agents working in this repository, see [`AGENTS.md`](./AGENTS.md) for architecture, invariants, and verification instructions.

---

## ℹ️ Trademark Disclaimer

"Bionic Reading" is a registered trademark of Bionic Reading AG. This open-source extension provides a bionic-style reading experience and is independently developed. It is not affiliated with, sponsored by, or endorsed by Bionic Reading AG.
