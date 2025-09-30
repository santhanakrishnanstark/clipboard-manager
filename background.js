// Background service worker for Clipboard Manager
class ClipboardManager {
  constructor() {
    this.lastClipboardText = '';
    this.clipboardPollingInterval = null;
    this.init();
  }

  async init() {
    // Initialize storage with default settings
    const result = await chrome.storage.local.get(['settings', 'clipboardHistory', 'snippets']);
    
    if (!result.settings) {
      await chrome.storage.local.set({
        settings: {
          maxHistorySize: 50,
          excludedSites: [],
          enableQuickPaste: true,
          enableContextMenu: true,
          theme: 'auto', // auto, light, dark
          sortOrder: 'newest' // newest, oldest, pinned
        }
      });
    }

    if (!result.clipboardHistory) {
      await chrome.storage.local.set({ clipboardHistory: [] });
    }

    if (!result.snippets) {
      await chrome.storage.local.set({ snippets: [] });
    }

    this.setupContextMenu();
    this.setupKeyboardShortcuts();
    this.setupTabListeners();
    this.startClipboardPolling();
  }

  async setupContextMenu() {
    try {
      // Remove existing context menus
      await chrome.contextMenus.removeAll();

      // Create main context menu
      chrome.contextMenus.create({
        id: 'clipboard-manager',
        title: 'Clipboard Manager',
        contexts: ['all']
      });

      chrome.contextMenus.create({
        id: 'paste-from-history',
        parentId: 'clipboard-manager',
        title: 'Paste from History',
        contexts: ['editable']
      });

      chrome.contextMenus.create({
        id: 'save-as-snippet',
        parentId: 'clipboard-manager',
        title: 'Save Selection as Snippet',
        contexts: ['selection']
      });

      chrome.contextMenus.create({
        id: 'clear-history',
        parentId: 'clipboard-manager',
        title: 'Clear History',
        contexts: ['all']
      });

      // Add recent items to context menu
      await this.updateContextMenuHistory();
    } catch (error) {
      console.error('Clipboard Manager Background: Error setting up context menu:', error);
    }
  }

  async updateContextMenuHistory() {
    try {
      const { clipboardHistory } = await chrome.storage.local.get(['clipboardHistory']);
      const history = clipboardHistory || [];

      // Remove existing history items (but not the main menu structure)
      // First, remove any existing paste-item entries
      for (let i = 0; i < 10; i++) {
        try {
          await chrome.contextMenus.remove(`paste-item-${i}`);
        } catch (e) {
          // Item doesn't exist, ignore
        }
      }

      // Add recent items (max 5)
      const recentItems = history.slice(0, 5);
      recentItems.forEach((item, index) => {
        const title = item.text.length > 50 ? item.text.substring(0, 50) + '...' : item.text;
        try {
          chrome.contextMenus.create({
            id: `paste-item-${index}`,
            parentId: 'paste-from-history',
            title: title,
            contexts: ['editable']
          });
        } catch (error) {
          console.error('Clipboard Manager Background: Error creating context menu item:', error);
        }
      });
    } catch (error) {
      console.error('Clipboard Manager Background: Error updating context menu history:', error);
    }
  }

  setupKeyboardShortcuts() {
    chrome.commands.onCommand.addListener(async (command) => {
      switch (command) {
        case 'open-popup':
          // Open popup (handled by browser)
          break;
        case 'quick-paste':
          await this.showQuickPasteMenu();
          break;
        case 'paste-last':
          await this.pasteLastItem();
          break;
      }
    });
  }

  async showQuickPasteMenu() {
    // Send message to content script to show quick paste menu
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { action: 'showQuickPaste' });
    }
  }

  async pasteLastItem() {
    const { clipboardHistory } = await chrome.storage.local.get(['clipboardHistory']);
    const history = clipboardHistory || [];
    
    if (history.length > 0) {
      const lastItem = history[0];
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        chrome.tabs.sendMessage(tab.id, { 
          action: 'pasteText', 
          text: lastItem.text 
        });
      }
    }
  }

  async addToHistory(text, source = 'unknown') {
    console.log('Clipboard Manager Background: Adding to history:', text.substring(0, 50) + '...', 'from', source);
    
    if (!text || text.trim().length === 0) {
      console.log('Clipboard Manager Background: Empty text, skipping');
      return;
    }

    const { clipboardHistory, settings } = await chrome.storage.local.get(['clipboardHistory', 'settings']);
    const history = clipboardHistory || [];
    const maxSize = settings?.maxHistorySize || 50;

    // Check if this text is already the most recent item
    if (history.length > 0 && history[0].text === text) {
      console.log('Clipboard Manager Background: Duplicate text, skipping');
      return; // Don't add duplicates consecutively
    }

    // Create new history item
    const newItem = {
      id: Date.now().toString(),
      text: text,
      timestamp: new Date().toISOString(),
      source: source,
      pinned: false
    };

    // Remove any existing instances of this text
    const filteredHistory = history.filter(item => item.text !== text);

    // Add to beginning and limit size
    const updatedHistory = [newItem, ...filteredHistory].slice(0, maxSize);

    await chrome.storage.local.set({ clipboardHistory: updatedHistory });
    await this.updateContextMenuHistory();

    console.log('Clipboard Manager Background: Successfully added to history. Total items:', updatedHistory.length);

    // Notify popup if open
    this.notifyPopup('historyUpdated');
  }

  async removeFromHistory(itemId) {
    const { clipboardHistory } = await chrome.storage.local.get(['clipboardHistory']);
    const history = clipboardHistory || [];
    
    const updatedHistory = history.filter(item => item.id !== itemId);
    await chrome.storage.local.set({ clipboardHistory: updatedHistory });
    await this.updateContextMenuHistory();
    
    this.notifyPopup('historyUpdated');
  }

  async togglePin(itemId) {
    const { clipboardHistory } = await chrome.storage.local.get(['clipboardHistory']);
    const history = clipboardHistory || [];
    
    const updatedHistory = history.map(item => {
      if (item.id === itemId) {
        return { ...item, pinned: !item.pinned };
      }
      return item;
    });

    await chrome.storage.local.set({ clipboardHistory: updatedHistory });
    this.notifyPopup('historyUpdated');
  }

  async clearHistory() {
    await chrome.storage.local.set({ clipboardHistory: [] });
    await this.updateContextMenuHistory();
    this.notifyPopup('historyUpdated');
  }

  async addSnippet(text, title) {
    const { snippets } = await chrome.storage.local.get(['snippets']);
    const currentSnippets = snippets || [];

    const newSnippet = {
      id: Date.now().toString(),
      title: title,
      text: text,
      timestamp: new Date().toISOString(),
      useCount: 0
    };

    const updatedSnippets = [newSnippet, ...currentSnippets];
    await chrome.storage.local.set({ snippets: updatedSnippets });
    
    this.notifyPopup('snippetsUpdated');
  }

  async removeSnippet(snippetId) {
    const { snippets } = await chrome.storage.local.get(['snippets']);
    const currentSnippets = snippets || [];
    
    const updatedSnippets = currentSnippets.filter(snippet => snippet.id !== snippetId);
    await chrome.storage.local.set({ snippets: updatedSnippets });
    
    this.notifyPopup('snippetsUpdated');
  }

  startClipboardPolling() {
    console.log('Clipboard Manager Background: Starting clipboard polling');
    
    // Poll clipboard every 1 second
    this.clipboardPollingInterval = setInterval(async () => {
      await this.checkClipboard();
    }, 1000);
    
    // Also check immediately
    this.checkClipboard();
  }

  async checkClipboard() {
    try {
      // Get current active tab to determine source
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const source = activeTab ? new URL(activeTab.url).hostname : 'unknown';
      
      // Check if current site should be excluded
      const { settings } = await chrome.storage.local.get(['settings']);
      const excludedSites = settings?.excludedSites || [];
      
      const isExcluded = excludedSites.some(site => {
        if (site.includes('*')) {
          const pattern = site.replace(/\*/g, '.*');
          const regex = new RegExp(pattern, 'i');
          return regex.test(source);
        }
        return source.includes(site.toLowerCase());
      });
      
      if (isExcluded) {
        return; // Skip clipboard check for excluded sites
      }
      
      // Read clipboard content
      const clipboardText = await navigator.clipboard.readText();
      
      // Check if clipboard content has changed
      if (clipboardText && clipboardText !== this.lastClipboardText && clipboardText.trim().length > 0) {
        console.log('Clipboard Manager Background: New clipboard content detected:', clipboardText.substring(0, 50) + '...');
        this.lastClipboardText = clipboardText;
        await this.addToHistory(clipboardText, source);
      }
    } catch (error) {
      // Clipboard access might fail in some contexts, this is normal
      // console.log('Clipboard Manager Background: Clipboard check failed:', error.message);
    }
  }

  stopClipboardPolling() {
    if (this.clipboardPollingInterval) {
      clearInterval(this.clipboardPollingInterval);
      this.clipboardPollingInterval = null;
      console.log('Clipboard Manager Background: Stopped clipboard polling');
    }
  }

  setupTabListeners() {
    // Listen for tab activation (switching tabs)
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
      console.log('Clipboard Manager Background: Tab activated:', activeInfo.tabId);
      await this.injectContentScriptIfNeeded(activeInfo.tabId);
    });

    // Listen for tab updates (page navigation)
    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        console.log('Clipboard Manager Background: Tab updated:', tabId, tab.url);
        await this.injectContentScriptIfNeeded(tabId);
      }
    });
  }

  async injectContentScriptIfNeeded(tabId) {
    try {
      const tab = await chrome.tabs.get(tabId);
      
      // Skip special pages
      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://')) {
        return;
      }

      // Try to inject content script
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });
      
      console.log('Clipboard Manager Background: Content script injected into tab:', tabId);
    } catch (error) {
      // Content script might already be injected or tab might not allow injection
      console.log('Clipboard Manager Background: Could not inject content script into tab:', tabId, error.message);
    }
  }

  async refreshExtension() {
    console.log('Clipboard Manager Background: Refreshing extension...');
    
    try {
      // Reinject content scripts into all tabs
      const tabs = await chrome.tabs.query({});
      
      for (const tab of tabs) {
        if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
          await this.injectContentScriptIfNeeded(tab.id);
        }
      }
      
      // Restart clipboard polling
      this.stopClipboardPolling();
      this.startClipboardPolling();
      
      // Recreate context menus
      await this.setupContextMenu();
      
      console.log('Clipboard Manager Background: Extension refreshed successfully');
      
    } catch (error) {
      console.error('Clipboard Manager Background: Error refreshing extension:', error);
    }
  }

  notifyPopup(action) {
    // Try to send message to popup if it's open
    chrome.runtime.sendMessage({ action }).catch(() => {
      // Popup might not be open, ignore error
    });
  }
}

// Initialize clipboard manager
const clipboardManager = new ClipboardManager();

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Clipboard Manager Background: Received message:', message.action, 'from', sender.tab ? 'content script' : 'popup');
  
  switch (message.action) {
    case 'addToHistory':
      clipboardManager.addToHistory(message.text, message.source);
      sendResponse({ success: true });
      break;
    case 'removeFromHistory':
      clipboardManager.removeFromHistory(message.itemId);
      sendResponse({ success: true });
      break;
    case 'togglePin':
      clipboardManager.togglePin(message.itemId);
      sendResponse({ success: true });
      break;
    case 'clearHistory':
      clipboardManager.clearHistory();
      sendResponse({ success: true });
      break;
    case 'addSnippet':
      clipboardManager.addSnippet(message.text, message.title);
      sendResponse({ success: true });
      break;
    case 'removeSnippet':
      clipboardManager.removeSnippet(message.snippetId);
      sendResponse({ success: true });
      break;
    case 'refreshExtension':
      clipboardManager.refreshExtension().then(() => {
        sendResponse({ success: true });
      }).catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
      break;
    default:
      console.log('Clipboard Manager Background: Unknown action:', message.action);
      sendResponse({ success: false, error: 'Unknown action' });
  }
  
  return true; // Keep message channel open for async response
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'clear-history') {
    await clipboardManager.clearHistory();
  } else if (info.menuItemId === 'save-as-snippet') {
    if (info.selectionText) {
      const title = info.selectionText.length > 30 ? 
        info.selectionText.substring(0, 30) + '...' : 
        info.selectionText;
      await clipboardManager.addSnippet(info.selectionText, title);
    }
  } else if (info.menuItemId.startsWith('paste-item-')) {
    const index = parseInt(info.menuItemId.split('-')[2]);
    const { clipboardHistory } = await chrome.storage.local.get(['clipboardHistory']);
    const history = clipboardHistory || [];
    
    if (history[index]) {
      chrome.tabs.sendMessage(tab.id, { 
        action: 'pasteText', 
        text: history[index].text 
      });
    }
  }
});

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Clipboard Manager installed');
});