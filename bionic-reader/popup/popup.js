// Bionic Reader Popup Script

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
let activeTabId = null;
let currentHostname = '';
let isTabActive = false;

// DOM Elements
const mainToggle = document.getElementById('mainToggle');
const masterSubtitle = document.getElementById('masterSubtitle');
const statusIndicator = document.getElementById('statusIndicator');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

const fixationSlider = document.getElementById('fixationSlider');
const fixationValue = document.getElementById('fixationValue');

const boldWeightGroup = document.getElementById('boldWeightGroup');
const boldWeightValue = document.getElementById('boldWeightValue');

const restOpacitySlider = document.getElementById('restOpacitySlider');
const restOpacityValue = document.getElementById('restOpacityValue');

const minWordGroup = document.getElementById('minWordGroup');
const minWordValue = document.getElementById('minWordValue');

const colorPalette = document.getElementById('colorPalette');
const anchorColorValue = document.getElementById('anchorColorValue');

const domainAutoRunToggle = document.getElementById('domainAutoRunToggle');
const currentDomainText = document.getElementById('currentDomainText');
const globalAutoRunToggle = document.getElementById('globalAutoRunToggle');

const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');
const previewText = document.getElementById('previewText');

const COLOR_NAMES = {
  default: 'Monochrome (White)',
  amber: 'Warm Amber (Night Mode)',
  cyan: 'Electric Cyan',
  emerald: 'Mint Emerald',
  purple: 'Lilac Purple'
};

const COLOR_HEX = {
  default: '#ffffff',
  amber: '#fbbf24',
  cyan: '#38bdf8',
  emerald: '#34d399',
  purple: '#c084fc'
};

function getBoldLength(length, fixation) {
  if (length <= 1) return 1;
  return Math.max(1, Math.min(length - 1, Math.ceil(length * fixation)));
}

function updatePreview() {
  const sampleWords = ['Bionic', 'reading', 'guides', 'your', 'eyes', 'smoothly'];
  const boldColor = COLOR_HEX[currentSettings.anchorColor] || '#ffffff';

  const formatted = sampleWords.map(word => {
    if (word.length < currentSettings.minWordLength) {
      return word;
    }
    const boldLen = getBoldLength(word.length, currentSettings.fixation);
    const bold = word.slice(0, boldLen);
    const rest = word.slice(boldLen);
    return `<b class="bionic-bold" style="font-weight: ${currentSettings.boldWeight}; color: ${boldColor}; -webkit-text-stroke: 0.35px currentColor;">${bold}</b><span class="bionic-rest" style="opacity: ${currentSettings.restOpacity}; font-weight: normal;">${rest}</span>`;
  }).join(' ');

  previewText.innerHTML = formatted + '.';
}

function updateUI() {
  // Main toggle and status
  mainToggle.checked = isTabActive;
  if (isTabActive) {
    statusIndicator.classList.add('active');
    statusText.textContent = 'Active';
    masterSubtitle.textContent = 'Reading mode is ON';
  } else {
    statusIndicator.classList.remove('active');
    statusText.textContent = 'Inactive';
    masterSubtitle.textContent = 'Turn on for this page';
  }

  // Rest Opacity / Reading Contrast
  const opacityPercent = Math.round(currentSettings.restOpacity * 100);
  restOpacitySlider.value = opacityPercent;
  let contrastLabel = 'High';
  if (opacityPercent <= 50) contrastLabel = 'Maximum';
  else if (opacityPercent >= 85) contrastLabel = 'Subtle';
  restOpacityValue.textContent = `${contrastLabel} (${opacityPercent}%)`;

  // Anchor Color
  anchorColorValue.textContent = COLOR_NAMES[currentSettings.anchorColor] || 'Monochrome (White)';
  document.querySelectorAll('#colorPalette .color-swatch').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.color === currentSettings.anchorColor);
  });

  // Bold Weight
  boldWeightValue.textContent = `${currentSettings.boldWeight}`;
  document.querySelectorAll('#boldWeightGroup .segment-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.weight, 10) === currentSettings.boldWeight);
  });

  // Fixation Slider
  const fixPercent = Math.round(currentSettings.fixation * 100);
  fixationSlider.value = fixPercent;
  let fixLabel = 'Balanced';
  if (fixPercent <= 30) fixLabel = 'Light';
  else if (fixPercent >= 60) fixLabel = 'Strong';
  fixationValue.textContent = `${fixLabel} (${fixPercent}%)`;

  // Min Word Length
  minWordValue.textContent = currentSettings.minWordLength === 1 ? 'All words' : `${currentSettings.minWordLength}+ letters`;
  document.querySelectorAll('#minWordGroup .segment-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.len, 10) === currentSettings.minWordLength);
  });

  // Auto-run settings
  if (currentHostname) {
    currentDomainText.textContent = currentHostname;
    const domains = Array.isArray(currentSettings.autoRunDomains) ? currentSettings.autoRunDomains : [];
    domainAutoRunToggle.checked = domains.includes(currentHostname);
  } else {
    currentDomainText.textContent = 'Not applicable';
    domainAutoRunToggle.disabled = true;
  }
  globalAutoRunToggle.checked = !!currentSettings.autoRunGlobal;

  updatePreview();
}

function saveSettings(changed) {
  currentSettings = { ...currentSettings, ...changed };
  chrome.storage.sync.set(currentSettings);

  if (activeTabId) {
    chrome.tabs.sendMessage(activeTabId, {
      action: 'updateSettings',
      settings: currentSettings
    }).catch(() => {});
  }

  updatePreview();
}

// Event Listeners
mainToggle.addEventListener('change', () => {
  const willEnable = mainToggle.checked;
  isTabActive = willEnable;
  updateUI();

  if (activeTabId) {
    chrome.tabs.sendMessage(activeTabId, {
      action: 'toggle',
      enabled: willEnable,
      settings: currentSettings
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('Could not toggle:', chrome.runtime.lastError.message);
        return;
      }
      if (response) {
        isTabActive = response.active;
        updateUI();
      }
    });
  }
});

restOpacitySlider.addEventListener('input', (e) => {
  const val = parseInt(e.target.value, 10) / 100;
  currentSettings.restOpacity = val;
  const opacityPercent = Math.round(val * 100);
  let contrastLabel = 'High';
  if (opacityPercent <= 50) contrastLabel = 'Maximum';
  else if (opacityPercent >= 85) contrastLabel = 'Subtle';
  restOpacityValue.textContent = `${contrastLabel} (${opacityPercent}%)`;
  updatePreview();
});

restOpacitySlider.addEventListener('change', () => {
  saveSettings({ restOpacity: currentSettings.restOpacity });
});

colorPalette.addEventListener('click', (e) => {
  const btn = e.target.closest('.color-swatch');
  if (!btn) return;
  const color = btn.dataset.color;
  anchorColorValue.textContent = COLOR_NAMES[color] || 'Monochrome (White)';
  document.querySelectorAll('#colorPalette .color-swatch').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  saveSettings({ anchorColor: color });
});

boldWeightGroup.addEventListener('click', (e) => {
  const btn = e.target.closest('.segment-btn');
  if (!btn) return;
  const weight = parseInt(btn.dataset.weight, 10);
  boldWeightValue.textContent = `${weight}`;
  document.querySelectorAll('#boldWeightGroup .segment-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  saveSettings({ boldWeight: weight });
});

fixationSlider.addEventListener('input', (e) => {
  const val = parseInt(e.target.value, 10) / 100;
  currentSettings.fixation = val;
  const fixPercent = Math.round(val * 100);
  let fixLabel = 'Balanced';
  if (fixPercent <= 30) fixLabel = 'Light';
  else if (fixPercent >= 60) fixLabel = 'Strong';
  fixationValue.textContent = `${fixLabel} (${fixPercent}%)`;
  updatePreview();
});

fixationSlider.addEventListener('change', () => {
  saveSettings({ fixation: currentSettings.fixation });
});

minWordGroup.addEventListener('click', (e) => {
  const btn = e.target.closest('.segment-btn');
  if (!btn) return;
  const len = parseInt(btn.dataset.len, 10);
  document.querySelectorAll('#minWordGroup .segment-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  saveSettings({ minWordLength: len });
});

domainAutoRunToggle.addEventListener('change', () => {
  if (!currentHostname) return;
  let domains = Array.isArray(currentSettings.autoRunDomains) ? [...currentSettings.autoRunDomains] : [];
  if (domainAutoRunToggle.checked) {
    if (!domains.includes(currentHostname)) domains.push(currentHostname);
  } else {
    domains = domains.filter(d => d !== currentHostname);
  }
  saveSettings({ autoRunDomains: domains });
});

globalAutoRunToggle.addEventListener('change', () => {
  saveSettings({ autoRunGlobal: globalAutoRunToggle.checked });
});

resetDefaultsBtn.addEventListener('click', () => {
  currentSettings = { ...DEFAULT_SETTINGS };
  chrome.storage.sync.set(DEFAULT_SETTINGS, () => {
    updateUI();
    if (activeTabId) {
      chrome.tabs.sendMessage(activeTabId, {
        action: 'updateSettings',
        settings: DEFAULT_SETTINGS
      }).catch(() => {});
    }
  });
});

// Initialization
async function init() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (stored) => {
    currentSettings = { ...DEFAULT_SETTINGS, ...stored };
    updateUI();
  });

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;
  activeTabId = tab.id;

  if (tab.url) {
    try {
      const url = new URL(tab.url);
      if (url.protocol.startsWith('http')) {
        currentHostname = url.hostname;
      }
    } catch (e) {}
  }

  chrome.tabs.sendMessage(activeTabId, { action: 'getStatus' }, (response) => {
    if (chrome.runtime.lastError) {
      masterSubtitle.textContent = 'Unavailable on system page';
      mainToggle.disabled = true;
      return;
    }
    if (response) {
      isTabActive = !!response.active;
      if (response.settings) {
        currentSettings = { ...currentSettings, ...response.settings };
      }
      updateUI();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
