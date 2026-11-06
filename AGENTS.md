# AGENTS.md — chrome-extensions

> Instructions for AI coding agents working in this repo. Plain-English, no build step.

## What this is

A small collection of Chrome extensions. Currently contains one extension:

- **Bionic Reader** (`bionic-reader/`, v1.1.1, Manifest V3) — reformats page text into
  Bionic Reading style (bold fixation anchors + dimmed rest letters) to guide eye saccades.
  Vanilla JS/CSS/HTML only. No dependencies, no bundler, no test framework.

Supporting files at repo root: desktop installers (`install-mac.command`,
`install-windows.bat`), a no-install `bookmarklet.html` variant, packaged zips
(`bionic-reader.zip`), and Chrome Web Store art in `store-assets/`.

## Layout

```
bionic-reader/
├── manifest.json          # MV3 config, permissions (storage, activeTab), Alt+B command
├── background/background.js  # Service worker: shortcuts, badge, settings init
├── content/content.js     # Core: TreeWalker tokenization, MutationObserver, theming
├── content/content.css    # Anchor/rest styles, CSS vars, toast
├── popup/popup.html|css|js  # Settings UI, live preview, per-tab messaging
├── icons/                 # 16/32/48/128px PNGs
└── test.html              # Manual demo/verification page (dark/light, dynamic append)
```

## How to verify (no automated tests)

1. `chrome://extensions` → Developer mode → **Load unpacked** → select `bionic-reader/`.
2. Open `bionic-reader/test.html` in Chrome (or `Cmd+O` / drag-drop the file).
3. Toggle with `Alt+B` or the popup; check light/dark themes, anchor colors,
   sliders, and the "Append New Paragraph" button (exercises the MutationObserver).
4. Toggle OFF must restore the page byte-for-byte without refresh.

There is no linter/test runner configured. If you add one, keep it zero-config and
document it in both READMEs.

## Invariants — do not break these

- **Settings shape is triplicated.** `DEFAULT_SETTINGS` exists in `background.js`,
  `content.js`, and `popup.js`. Any key added/removed/renamed must be updated in
  all three, plus the popup UI and `applyCSSVariables`/`updateSettings` handling.
- **Version lives in 7 spots.** Bump `manifest.json`, `popup.html` (`.version`
  badge), `test.html` (badge), both `README.md` badges, and both `AGENTS.md`
  version lines together.
- **Non-destructive DOM contract.** Original text is stored in `data-bionic-orig`
  on `span.bionic-reader-text`; `disableBionic()` must fully restore it and remove
  all CSS vars/attributes/classes it added. Never leave formatting residue behind.
- **Never format protected content.** `IGNORED_TAGS`, `ALWAYS_IGNORED_SELECTORS`
  (app/nav chrome, headings, KaTeX/MathJax equations, Notion sidebar/topbar),
  and editable regions (`contenteditable`, `textbox` role, plus Notion exception
  via `isKnownReaderApp`) must keep working. On reader apps only the actively
  edited block is skipped (`isNodeInActiveEdit`) — never the whole editor
  subtree. Keep `bookmarklet.html`'s embedded ignore logic in parity.
- **MV3 service worker limits.** `background.js` has no DOM access and no persistent
  state — badge/shortcut logic only, state lives in `chrome.storage.sync`.
- **Permissions are minimal** (`storage`, `activeTab`). Do not add host permissions
  or `<all_urls>`-requiring APIs without asking; content-script `<all_urls>` matches
  are already declared and sufficient.

## Message protocol (popup/background ↔ content)

Actions handled in `content.js`: `getStatus`, `toggle {enabled, settings}`,
`toggleShortcut`, `updateSettings {settings}`. Content notifies via
`statusChanged {active}`. `updateSettings` re-runs full formatting only on
structural changes (`fixation`, `minWordLength`, `saccadeInterval`); everything
else is CSS-var-only. Keep that split — full re-format on every slider tick kills
scroll performance.

## Performance rules

- Text collection via `TreeWalker` + `requestIdleCallback` batches of ~400 nodes.
  Keep batching; never format synchronously in a tight loop over large docs.
- MutationObserver path is debounced (~120ms) and must ignore our own classes
  (`bionic-reader-text`, `bionic-bold`, `bionic-reader-toast`) to avoid loops.

## Conventions

- Vanilla JS, no modules/bundlers in `bionic-reader/`. Match existing style:
  plain functions, `const`/`let`, early returns, `//` section comments.
- CSS theming goes through the `--bionic-*` custom properties; popup preview
  rendering should mirror `content.css` behavior.
- Keep the tokenizer's Unicode-aware word regex and URL passthrough; escape all
  injected HTML via `escapeHTML`.
- Small, focused diffs. Update `test.html` when adding a user-visible behavior so
  it stays a one-page verification harness.
- Do not regenerate/commit `*.zip` files or `store-assets/*.png` unless the task
  is explicitly a release/packaging task.
- Installers copy `bionic-reader/` to a stable local path — never hardcode
  machine-specific paths outside the existing `$HOME`/`%LOCALAPPDATA%` logic.
