# ⚡ VibeCodedProject — Bionic-Style Speed Reader

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](./manifest.json)
[![Manifest V3](https://img.shields.io/badge/Chrome-Manifest%20V3-success.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Project](https://img.shields.io/badge/VibeCoded-Project-6366f1.svg?style=flat&logo=rocket)](https://github.com/charles-owo/VibeCodedProject-Bionic-Reader)

A fast, lightweight, and customizable Chrome extension built with Manifest V3 that transforms web pages into a bionic-style reading format. By bolding the initial anchor letters of each word, it creates visual fixation points to guide your eyes and help you stay focused on long texts.

---

## 🚀 Key Features

- **⚡ Instant On/Off**: Toggle anytime with a single click in the popup or using the keyboard shortcut (<kbd>Alt</kbd> + <kbd>B</kbd>).
- **🌗 Theme-Aware High Contrast (v1.1)**:
  - Specially optimized for dark mode websites (like Medium, Twitter, Reddit) and serif typography.
  - Automatically raises bold anchor contrast with crisp font-stroke definition (`-webkit-text-stroke: 0.35px`) and subtle text shadow.
  - Dims resting letters (`0.65` opacity by default) so bold anchor letters clearly stand out.
- **🎨 Custom Anchor Highlight Colors**:
  - ⚪ **Pure White** (Auto High Contrast)
  - 🟡 **Warm Amber (`#fbbf24`)** — Ideal for night reading and dark mode
  - 🔵 **Electric Cyan (`#38bdf8`)**
  - 🟢 **Mint Emerald (`#34d399`)**
  - 🟣 **Lilac Purple (`#c084fc`)**
- **🧠 Visual Anchor Guidance**: Bolds words using an adaptive algorithm that accounts for word length, contractions (`don't`), hyphenations (`state-of-the-art`), and punctuation.
- **🛡️ DOM-Safe & Non-Destructive**:
  - Zero disruption to inputs, textareas, and code blocks (`<pre>`, `<code>`, Monaco, CodeMirror).
  - Built-in support for reading in workspace apps like Notion while keeping formulas and code blocks untouched.
  - Toggling OFF completely restores the page to its original text without needing a refresh.
- **🔄 Dynamic Content & Infinite Scroll**: Includes an optimized, debounced `MutationObserver` that automatically processes newly loaded content on infinite-scrolling platforms.
- **🎛️ Full Customization**:
  - **Reading Contrast (Dimming)**: Slider from 35% (Max dimming) to 100% (No dimming).
  - **Fixation Anchor Length**: Control percentage of letters bolded (Light 25% to Strong 70%).
  - **Bold Weight Picker**: 600 (Semibold), 700 (Bold), 800 (Extra Bold), and 900 (Black).
  - **Minimum Word Length**: Choose whether to format all words or skip short words (1, 2, or 3+ letters).
- **🌐 Domain & Global Auto-Run**:
  - Save favorite websites to automatically format on page load.
  - Option to enable everywhere by default.
- **⚡ Performance Optimized**: Uses native browser `TreeWalker` and chunked idle-batching (`requestIdleCallback`) to maintain smooth scrolling and responsive browsing.

---

## 📦 How to Install in Google Chrome

1. Open Google Chrome and navigate to:
   ```
   chrome://extensions
   ```
2. In the top-right corner, turn on **Developer mode**.
3. Click the **Load unpacked** button in the top-left corner.
4. Select the `bionic-reader` folder inside this repository.
5. Click the puzzle icon in Chrome's toolbar and **pin** the **Bionic-Style Speed Reader** extension for quick access.

---

## 🧪 Testing the Extension

1. Open the included `test.html` page in Chrome:
   - In Chrome, press <kbd>Cmd</kbd> + <kbd>O</kbd> (Mac) or <kbd>Ctrl</kbd> + <kbd>O</kbd> (Windows) and select `test.html` inside the `bionic-reader` folder.
   - Or simply drag and drop `test.html` into any open Chrome tab.
2. Press <kbd>Alt</kbd> + <kbd>B</kbd> or click the extension icon to toggle bionic-style reading on and off.
3. Test the dark/light mode toggle and try different anchor colors (like Amber or Cyan) in the popup.
4. Try clicking the "Append New Paragraph" button on the test page to observe the dynamic `MutationObserver` processing new content seamlessly.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Alt</kbd> + <kbd>B</kbd> | Toggle bionic-style reading on the current tab |

*(Customize shortcuts anytime at `chrome://extensions/shortcuts`)*

---

## 📂 Project Structure

```
bionic-reader/
├── manifest.json         # Manifest V3 configuration & permissions
├── icons/                # Extension icons (16, 32, 48, 128px)
├── background/
│   └── background.js     # Service worker handling commands & badges
├── content/
│   ├── content.js        # Core text tokenization, TreeWalker & MutationObserver
│   └── content.css       # Typography styles, contrast modes & HUD toast
├── popup/
│   ├── popup.html        # Settings, color swatches & live preview UI
│   ├── popup.css         # Modern dark-mode popup styles
│   └── popup.js          # Live settings controls and tab communication
├── test.html             # High-contrast demo & verification test page
├── AGENTS.md             # Developer & AI agent specifications and invariants
└── README.md
```

---

## 🤖 AI Agent Guidelines

For AI coding agents working on this extension, see [`AGENTS.md`](./AGENTS.md) for architectural invariants, message protocols, and verification steps.

---

## ℹ️ Trademark Disclaimer

"Bionic Reading" is a registered trademark of Bionic Reading AG. This open-source extension provides a bionic-style reading experience and is independently developed. It is not affiliated with, sponsored by, or endorsed by Bionic Reading AG.
