// Bionic Reader Background Service Worker

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

// Initialize settings on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (items) => {
    chrome.storage.sync.set({ ...DEFAULT_SETTINGS, ...items });
  });
  console.log('Bionic Reader extension installed.');
});

// Update extension badge
function updateBadge(tabId, isActive) {
  if (!tabId) return;
  chrome.action.setBadgeText({
    tabId: tabId,
    text: isActive ? 'ON' : ''
  });
  chrome.action.setBadgeBackgroundColor({
    tabId: tabId,
    color: '#4f46e5'
  });
}

// Handle keyboard shortcuts (Alt+B)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-bionic') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'toggleShortcut' }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('Could not send shortcut to tab:', chrome.runtime.lastError.message);
          return;
        }
        if (response) {
          updateBadge(tab.id, response.active);
        }
      });
    }
  }
});

// Handle status updates from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'statusChanged' && sender.tab?.id) {
    updateBadge(sender.tab.id, message.active);
  }
  return false;
});

// Sync badge when tab changes or finishes loading
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  chrome.tabs.sendMessage(activeInfo.tabId, { action: 'getStatus' }, (response) => {
    if (chrome.runtime.lastError || !response) {
      updateBadge(activeInfo.tabId, false);
      return;
    }
    updateBadge(activeInfo.tabId, response.active);
  });
});
