(() => {
  // Prevent multiple injections
  if (window.__bionicReaderInjected) return;
  window.__bionicReaderInjected = true;

  const DEFAULT_SETTINGS = {
    fixation: 0.45,
    boldWeight: 800,
    restOpacity: 0.65,
    minWordLength: 2,
    saccadeInterval: 1,
    highContrast: true,
    anchorColor: 'default',
    autoRunGlobal: false,
    autoRunDomains: []
  };

  let currentSettings = { ...DEFAULT_SETTINGS };
  let isActive = false;
  let observer = null;
  let pendingMutationNodes = [];
  let mutationDebounceTimer = null;
  let toastTimeout = null;

  const IGNORED_TAGS = new Set([
    'HEAD', 'STYLE', 'SCRIPT', 'NOSCRIPT', 'TEXTAREA', 'INPUT',
    'SELECT', 'OPTION', 'CODE', 'PRE', 'KBD', 'SAMP', 'VAR',
    'SVG', 'CANVAS', 'IFRAME', 'VIDEO', 'AUDIO', 'OBJECT', 'EMBED', 'MATH'
  ]);

  // Selectors that should ALWAYS be ignored (code editors, bionic elements)
  const ALWAYS_IGNORED_SELECTORS = [
    '.monaco-editor',
    '.CodeMirror',
    '.ace_editor',
    '.notranslate',
    '[translate="no"]',
    '.bionic-reader-text',
    '.bionic-reader-toast',
    '[data-bionic-ignore]'
  ];

  // Selectors ignored only on non-whitelisted sites (contenteditable regions)
  const EDITABLE_SELECTORS = [
    '[contenteditable="true"]',
    '[contenteditable=""]',
    '[role="textbox"]',
    '[role="combobox"]',
    '[role="searchbox"]'
  ];

  // Known reader apps where contenteditable wraps the whole page
  function isKnownReaderApp() {
    try {
      const host = window.location.hostname;
      return /(^|\.)(notion\.(so|com|site))$/i.test(host);
    } catch (e) {
      return false;
    }
  }

  const isReaderApp = isKnownReaderApp();
  const IGNORED_SELECTORS = [
    ...ALWAYS_IGNORED_SELECTORS,
    ...(isReaderApp ? [] : EDITABLE_SELECTORS)
  ].join(', ');

  function detectPageTheme() {
    try {
      const candidates = [document.body, document.documentElement];
      for (const el of candidates) {
        if (!el) continue;
        const bg = window.getComputedStyle(el).backgroundColor;
        if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') continue;
        const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (m) {
          const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])];
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          return luminance < 0.5 ? 'dark' : 'light';
        }
      }
    } catch (e) {}
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  function getBoldLength(length, fixation) {
    if (length <= 1) return 1;
    return Math.max(1, Math.min(length - 1, Math.ceil(length * fixation)));
  }

  function formatStringToBionicHTML(text, settings) {
    const TOKEN_REGEX = /(https?:\/\/[^\s<]+|www\.[^\s<]+)|([\p{L}\p{N}]+(?:['\u2019][\p{L}\p{N}]+)?)/gu;
    let lastIndex = 0;
    let result = '';
    let wordCount = 0;
    let match;

    while ((match = TOKEN_REGEX.exec(text)) !== null) {
      if (match.index > lastIndex) {
        result += escapeHTML(text.slice(lastIndex, match.index));
      }

      const urlMatch = match[1];
      const wordMatch = match[2];

      if (urlMatch) {
        result += escapeHTML(urlMatch);
      } else if (wordMatch) {
        const hasLetter = /\p{L}/u.test(wordMatch);
        const meetsMinLength = wordMatch.length >= settings.minWordLength;
        wordCount++;
        const shouldBold = hasLetter && meetsMinLength && (wordCount % settings.saccadeInterval === 0);

        if (shouldBold) {
          const boldLen = getBoldLength(wordMatch.length, settings.fixation);
          const boldPart = wordMatch.slice(0, boldLen);
          const restPart = wordMatch.slice(boldLen);

          result += `<b class="bionic-bold">${escapeHTML(boldPart)}</b>`;
          if (restPart) {
            result += `<span class="bionic-rest">${escapeHTML(restPart)}</span>`;
          }
        } else {
          result += escapeHTML(wordMatch);
        }
      }

      lastIndex = TOKEN_REGEX.lastIndex;
    }

    if (lastIndex < text.length) {
      result += escapeHTML(text.slice(lastIndex));
    }

    return result;
  }

  function isValidTextNode(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return false;
    if (!node.nodeValue || !node.nodeValue.trim()) return false;
    const parent = node.parentElement;
    if (!parent) return false;
    if (IGNORED_TAGS.has(parent.tagName)) return false;
    if (!isReaderApp && parent.isContentEditable) return false;
    if (isReaderApp && document.activeElement && document.activeElement !== document.body && document.activeElement !== document.documentElement && document.activeElement.contains(node)) {
      return false;
    }
    if (parent.closest && parent.closest(IGNORED_SELECTORS)) return false;
    return true;
  }

  function collectTextNodes(root) {
    if (!root) return [];
    const nodes = [];
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          return isValidTextNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      }
    );

    let current;
    while ((current = walker.nextNode())) {
      nodes.push(current);
    }
    return nodes;
  }

  function processNodesBatch(nodes, startIndex, batchSize, settings, onComplete) {
    const endIndex = Math.min(startIndex + batchSize, nodes.length);
    for (let i = startIndex; i < endIndex; i++) {
      const textNode = nodes[i];
      if (!textNode.parentNode) continue;
      if (textNode.parentNode.classList && textNode.parentNode.classList.contains('bionic-reader-text')) {
        continue;
      }

      const originalText = textNode.nodeValue;
      if (!/\p{L}/u.test(originalText)) continue;

      const span = document.createElement('span');
      span.className = 'bionic-reader-text';
      span.setAttribute('data-bionic-orig', originalText);
      span.innerHTML = formatStringToBionicHTML(originalText, settings);

      try {
        textNode.parentNode.replaceChild(span, textNode);
      } catch (err) {
        // Safe ignore if DOM shifted
      }
    }

    if (endIndex < nodes.length) {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => processNodesBatch(nodes, endIndex, batchSize, settings, onComplete));
      } else {
        setTimeout(() => processNodesBatch(nodes, endIndex, batchSize, settings, onComplete), 16);
      }
    } else if (onComplete) {
      onComplete();
    }
  }

  function applyCSSVariables(settings) {
    const theme = detectPageTheme();
    document.documentElement.setAttribute('data-bionic-theme', theme);

    document.documentElement.style.setProperty('--bionic-bold-weight', settings.boldWeight || 800);
    document.documentElement.style.setProperty(
      '--bionic-rest-opacity',
      settings.restOpacity !== undefined ? settings.restOpacity : 0.65
    );

    if (settings.highContrast !== false) {
      document.documentElement.classList.add('bionic-high-contrast');
      document.documentElement.style.setProperty('--bionic-bold-stroke', '0.35px');
    } else {
      document.documentElement.classList.remove('bionic-high-contrast');
      document.documentElement.style.setProperty('--bionic-bold-stroke', '0px');
    }

    const colorPresets = {
      default: theme === 'dark' ? '#ffffff' : '#0a0a0a',
      amber: '#fbbf24',
      cyan: '#38bdf8',
      emerald: '#34d399',
      purple: '#c084fc'
    };

    const chosenColor = colorPresets[settings.anchorColor] || colorPresets.default;
    document.documentElement.style.setProperty('--bionic-bold-color', chosenColor);
  }

  function enableBionic(settings) {
    if (isActive) {
      disableBionic();
    }

    currentSettings = { ...currentSettings, ...settings };
    isActive = true;
    applyCSSVariables(currentSettings);
    document.documentElement.setAttribute('data-bionic-active', 'true');

    const nodes = collectTextNodes(document.body || document.documentElement);
    processNodesBatch(nodes, 0, 400, currentSettings, () => {
      startObserver(currentSettings);
      notifyBackground(true);
    });
  }

  function disableBionic() {
    stopObserver();

    const elements = document.querySelectorAll('span.bionic-reader-text');
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const orig = el.getAttribute('data-bionic-orig');
      if (orig !== null && el.parentNode) {
        const textNode = document.createTextNode(orig);
        el.parentNode.replaceChild(textNode, el);
      }
    }

    document.documentElement.removeAttribute('data-bionic-active');
    document.documentElement.removeAttribute('data-bionic-theme');
    document.documentElement.classList.remove('bionic-high-contrast');
    document.documentElement.style.removeProperty('--bionic-bold-weight');
    document.documentElement.style.removeProperty('--bionic-rest-opacity');
    document.documentElement.style.removeProperty('--bionic-bold-color');
    document.documentElement.style.removeProperty('--bionic-bold-stroke');

    isActive = false;
    notifyBackground(false);
  }

  function startObserver(settings) {
    stopObserver();

    observer = new MutationObserver((mutations) => {
      let hasNewNodes = false;
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.classList?.contains('bionic-reader-text') ||
                node.classList?.contains('bionic-bold') ||
                node.classList?.contains('bionic-reader-toast')) {
              continue;
            }
            pendingMutationNodes.push(node);
            hasNewNodes = true;
          } else if (node.nodeType === Node.TEXT_NODE) {
            if (node.parentNode?.classList?.contains('bionic-reader-text')) {
              continue;
            }
            pendingMutationNodes.push(node);
            hasNewNodes = true;
          }
        }
      }

      if (hasNewNodes) {
        if (mutationDebounceTimer) clearTimeout(mutationDebounceTimer);
        mutationDebounceTimer = setTimeout(() => {
          const toProcess = [];
          const nodes = pendingMutationNodes;
          pendingMutationNodes = [];

          for (const item of nodes) {
            if (!item.isConnected) continue;
            if (item.nodeType === Node.TEXT_NODE) {
              if (isValidTextNode(item)) toProcess.push(item);
            } else if (item.nodeType === Node.ELEMENT_NODE) {
              toProcess.push(...collectTextNodes(item));
            }
          }

          if (toProcess.length > 0) {
            processNodesBatch(toProcess, 0, 400, settings);
          }
        }, 120);
      }
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (mutationDebounceTimer) {
      clearTimeout(mutationDebounceTimer);
      mutationDebounceTimer = null;
    }
    pendingMutationNodes = [];
  }

  function notifyBackground(active) {
    try {
      chrome.runtime.sendMessage({
        action: 'statusChanged',
        active: active
      }).catch(() => {});
    } catch (e) {}
  }

  function showToast(message, isEnabled) {
    let toast = document.querySelector('.bionic-reader-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'bionic-reader-toast';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <span class="bionic-toast-icon ${isEnabled ? 'active' : 'inactive'}"></span>
      <span>${escapeHTML(message)}</span>
    `;

    toast.classList.add('bionic-toast-visible');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('bionic-toast-visible');
    }, 1800);
  }

  // Handle messages from popup or background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
      case 'getStatus':
        sendResponse({
          active: isActive,
          settings: currentSettings,
          domain: window.location.hostname
        });
        return true;

      case 'toggle':
        if (message.enabled) {
          enableBionic(message.settings || currentSettings);
        } else {
          disableBionic();
        }
        sendResponse({ success: true, active: isActive });
        return true;

      case 'toggleShortcut': {
        const nextState = !isActive;
        if (nextState) {
          enableBionic(currentSettings);
          showToast('⚡ Bionic Reading: Active (Alt+B)', true);
        } else {
          disableBionic();
          showToast('Bionic Reading: Disabled', false);
        }
        sendResponse({ success: true, active: isActive });
        return true;
      }

      case 'updateSettings': {
        const oldSettings = { ...currentSettings };
        currentSettings = { ...currentSettings, ...message.settings };

        if (isActive) {
          const structuralChange =
            oldSettings.fixation !== currentSettings.fixation ||
            oldSettings.minWordLength !== currentSettings.minWordLength ||
            oldSettings.saccadeInterval !== currentSettings.saccadeInterval;

          if (structuralChange) {
            enableBionic(currentSettings);
          } else {
            applyCSSVariables(currentSettings);
          }
        }
        sendResponse({ success: true });
        return true;
      }

      default:
        break;
    }
  });

  // Check auto-run on initial load
  function initAutoRun() {
    try {
      chrome.storage.sync.get(DEFAULT_SETTINGS, (stored) => {
        currentSettings = { ...DEFAULT_SETTINGS, ...stored };
        const host = window.location.hostname;
        const autoRunDomains = Array.isArray(currentSettings.autoRunDomains) ? currentSettings.autoRunDomains : [];

        const shouldAutoRun = currentSettings.autoRunGlobal || autoRunDomains.includes(host);
        if (shouldAutoRun) {
          enableBionic(currentSettings);
        }
      });
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoRun);
  } else {
    initAutoRun();
  }
})();
