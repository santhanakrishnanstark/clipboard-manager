// Content script for capturing clipboard events
// Prevent multiple initializations
if (typeof window.ClipboardCapture !== 'undefined') {
  console.log('Clipboard Manager: Content script already loaded, skipping initialization');
} else {

class ClipboardCapture {
  constructor() {
    this.excludedSites = [];
    this.quickPasteMenu = null;
    this.selectionToolbar = null;
    this.selectionTimeout = null;
    this.lastSelection = null;
    this.init();
  }

  async init() {
    console.log('Clipboard Manager: Initializing content script on', window.location.hostname);
    
    // Load settings to check for excluded sites
    await this.loadSettings();
    
    // Check if current site is excluded
    if (this.isCurrentSiteExcluded()) {
      console.log('Clipboard Manager: Site excluded from clipboard capture');
      return;
    }

    this.setupClipboardCapture();
    this.setupMessageListener();
    this.setupQuickPasteMenu();
    this.setupSelectionToolbar();
    
    console.log('Clipboard Manager: Content script initialized successfully');
  }

  async loadSettings() {
    try {
      // Check if extension context is still valid
      if (!chrome.storage || !chrome.storage.local) {
        console.log('Clipboard Manager: Extension context invalidated, using default settings');
        return;
      }

      const result = await chrome.storage.local.get(['settings']);
      this.settings = result.settings || {};
      if (result.settings && result.settings.excludedSites) {
        this.excludedSites = result.settings.excludedSites;
      }
    } catch (error) {
      if (error.message && error.message.includes('Extension context invalidated')) {
        console.log('Clipboard Manager: Extension context invalidated while loading settings');
        return;
      }
      console.error('Error loading settings:', error);
    }
  }

  isCurrentSiteExcluded() {
    const currentDomain = window.location.hostname;
    return this.excludedSites.some(site => {
      // Support wildcards and exact matches
      if (site.includes('*')) {
        const pattern = site.replace(/\*/g, '.*');
        const regex = new RegExp(pattern, 'i');
        return regex.test(currentDomain);
      }
      return currentDomain.includes(site.toLowerCase());
    });
  }

  setupClipboardCapture() {
    // Capture copy events
    document.addEventListener('copy', (event) => {
      this.handleCopyEvent(event);
    });

    // Capture cut events
    document.addEventListener('cut', (event) => {
      this.handleCopyEvent(event);
    });

    // Also monitor clipboard API usage
    this.monitorClipboardAPI();
  }

  handleCopyEvent(event) {
    try {
      console.log('Clipboard Manager: Copy event detected', event.type);
      let copiedText = '';

      // Try to get text from clipboard data
      if (event.clipboardData) {
        copiedText = event.clipboardData.getData('text/plain');
        console.log('Clipboard Manager: Got text from clipboardData:', copiedText.substring(0, 50) + '...');
      }

      // Fallback: get selected text
      if (!copiedText) {
        const selection = window.getSelection();
        if (selection && selection.toString()) {
          copiedText = selection.toString();
          console.log('Clipboard Manager: Got text from selection:', copiedText.substring(0, 50) + '...');
        }
      }

      // If we have text, send it to background script
      if (copiedText && copiedText.trim().length > 0) {
        console.log('Clipboard Manager: Sending text to background:', copiedText.length, 'characters');
        try {
          this.sendToBackground(copiedText);
        } catch (error) {
          if (error.message && error.message.includes('Extension context invalidated')) {
            console.log('Clipboard Manager: Extension context invalidated, skipping clipboard capture');
          } else {
            console.error('Clipboard Manager: Error in sendToBackground:', error);
          }
        }
      } else {
        console.log('Clipboard Manager: No text found to capture');
      }
    } catch (error) {
      console.error('Clipboard Manager: Error handling copy event:', error);
    }
  }

  monitorClipboardAPI() {
    // Override navigator.clipboard.writeText to capture programmatic copies
    if (navigator.clipboard && navigator.clipboard.writeText) {
      const originalWriteText = navigator.clipboard.writeText.bind(navigator.clipboard);
      
      navigator.clipboard.writeText = async (text) => {
        try {
          const result = await originalWriteText(text);
          if (text && text.trim().length > 0) {
            this.sendToBackground(text);
          }
          return result;
        } catch (error) {
          throw error;
        }
      };
    }
  }

  sendToBackground(text) {
    // Multiple layers of context validation
    try {
      // First check: Basic chrome object existence
      if (typeof chrome === 'undefined') {
        console.log('Clipboard Manager: Chrome APIs not available');
        return;
      }

      // Second check: Runtime object existence
      if (!chrome.runtime) {
        console.log('Clipboard Manager: Chrome runtime not available');
        return;
      }

      // Third check: SendMessage function existence
      if (typeof chrome.runtime.sendMessage !== 'function') {
        console.log('Clipboard Manager: Chrome runtime sendMessage not available');
        return;
      }

      // Fourth check: Extension ID exists (indicates valid context)
      if (!chrome.runtime.id) {
        console.log('Clipboard Manager: Extension context invalidated (no runtime ID)');
        return;
      }

      console.log('Clipboard Manager: Attempting to send message to background script');
      
      chrome.runtime.sendMessage({
        action: 'addToHistory',
        text: text,
        source: window.location.hostname
      }, (response) => {
        // Callback validation
        if (!chrome.runtime || !chrome.runtime.id) {
          console.log('Clipboard Manager: Extension context invalidated during callback');
          return;
        }
        
        if (chrome.runtime.lastError) {
          const errorMsg = chrome.runtime.lastError.message || '';
          if (errorMsg.includes('Extension context invalidated') ||
              errorMsg.includes('message port closed') ||
              errorMsg.includes('receiving end does not exist')) {
            console.log('Clipboard Manager: Extension context invalidated:', errorMsg);
            return;
          }
          console.error('Clipboard Manager: Error sending message:', chrome.runtime.lastError);
        } else {
          console.log('Clipboard Manager: Successfully sent text to background script');
        }
      });
    } catch (error) {
      // Final catch-all for any remaining errors
      const errorMsg = error.message || '';
      if (errorMsg.includes('Extension context invalidated') ||
          errorMsg.includes('message port closed') ||
          errorMsg.includes('Cannot access') ||
          errorMsg.includes('chrome.runtime')) {
        console.log('Clipboard Manager: Extension context invalidated -', errorMsg);
        return;
      }
      // Only log as error if it's not a context invalidation issue
      console.error('Clipboard Manager: Unexpected error sending to background:', error);
    }
  }

  setupMessageListener() {
    try {
      // Check if extension context is still valid
      if (!chrome.runtime || !chrome.runtime.onMessage) {
        console.log('Clipboard Manager: Extension context invalidated, skipping message listener setup');
        return;
      }

      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.action) {
          case 'showQuickPaste':
            this.showQuickPasteMenu();
            break;
          case 'pasteText':
            this.pasteText(message.text);
            break;
          case 'hideQuickPaste':
            this.hideQuickPasteMenu();
            break;
        }
      });
    } catch (error) {
      if (error.message && error.message.includes('Extension context invalidated')) {
        console.log('Clipboard Manager: Extension context invalidated while setting up message listener');
        return;
      }
      console.error('Error setting up message listener:', error);
    }
  }

  setupQuickPasteMenu() {
    // Create quick paste menu container
    this.quickPasteMenu = document.createElement('div');
    this.quickPasteMenu.id = 'clipboard-quick-paste';
    this.quickPasteMenu.style.cssText = `
      position: fixed;
      top: -1000px;
      left: -1000px;
      z-index: 2147483647;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      padding: 8px;
      min-width: 300px;
      max-width: 400px;
      max-height: 300px;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      display: none;
      transition: all 0.2s ease;
    `;

    // Add dark mode support
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.quickPasteMenu.style.background = 'rgba(30, 30, 30, 0.95)';
      this.quickPasteMenu.style.border = '1px solid rgba(255, 255, 255, 0.1)';
      this.quickPasteMenu.style.color = '#ffffff';
    }

    document.body.appendChild(this.quickPasteMenu);

    // Handle clicks outside to close
    document.addEventListener('click', (event) => {
      if (!this.quickPasteMenu.contains(event.target)) {
        this.hideQuickPasteMenu();
      }
    });

    // Handle escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.quickPasteMenu.style.display !== 'none') {
        this.hideQuickPasteMenu();
      }
    });
  }

  setupSelectionToolbar() {
    // Check if selection toolbar is enabled in settings
    const settings = this.settings || {};
    if (settings.enableSelectionToolbar === false) {
      return; // Don't create toolbar if disabled
    }
    this.createSelectionToolbar();
  }

  createSelectionToolbar() {
    // Prevent multiple toolbars
    if (this.selectionToolbar) {
      return;
    }

    // Create selection toolbar container
    this.selectionToolbar = document.createElement('div');
    this.selectionToolbar.id = 'clipboard-selection-toolbar';
    this.selectionToolbar.style.cssText = `
      position: fixed;
      top: -1000px;
      left: -1000px;
      z-index: 2147483647;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 6px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      padding: 4px;
      display: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      transition: all 0.15s ease;
      opacity: 0;
      transform: translateY(2px);
      pointer-events: none;
    `;

    // Add dark mode support
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.selectionToolbar.style.background = 'rgba(30, 30, 30, 0.95)';
      this.selectionToolbar.style.border = '1px solid rgba(255, 255, 255, 0.1)';
      this.selectionToolbar.style.color = '#ffffff';
    }

    // Create toolbar content
    this.createToolbarContent();
    
    document.body.appendChild(this.selectionToolbar);

    // Setup selection detection
    this.setupSelectionDetection();
  }

  createToolbarContent() {
    this.selectionToolbar.innerHTML = `
      <div class="toolbar-content" style="display: flex; align-items: center; gap: 2px;">
        <button class="copy-btn" style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: transparent;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          color: inherit;
          transition: background-color 0.15s ease;
        " title="Copy to clipboard">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        <div class="toolbar-divider" style="
          width: 1px;
          height: 16px;
          background: rgba(0, 0, 0, 0.1);
          margin: 0 1px;
        "></div>
        <button class="menu-btn" style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: transparent;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          color: inherit;
          transition: background-color 0.15s ease;
        " title="More options">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </button>
      </div>
      <div class="toolbar-menu" style="
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 4px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        padding: 4px;
        min-width: 160px;
        display: none;
        opacity: 0;
        transform: translateY(-4px);
        transition: all 0.15s ease;
      ">
        <button class="menu-item snippet-btn" style="
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
          padding: 6px 10px;
          background: transparent;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          color: inherit;
          text-align: left;
          transition: background-color 0.15s ease;
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          </svg>
          Save as Snippet
        </button>
        <button class="menu-item pin-btn" style="
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
          padding: 6px 10px;
          background: transparent;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          color: inherit;
          text-align: left;
          transition: background-color 0.15s ease;
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
          Pin to History
        </button>
      </div>
    `;

    // Add dark mode styles for menu
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      const menu = this.selectionToolbar.querySelector('.toolbar-menu');
      menu.style.background = 'rgba(30, 30, 30, 0.95)';
      menu.style.border = '1px solid rgba(255, 255, 255, 0.1)';
      
      const divider = this.selectionToolbar.querySelector('.toolbar-divider');
      divider.style.background = 'rgba(255, 255, 255, 0.1)';
    }

    // Setup event listeners
    this.setupToolbarEventListeners();
  }

  setupToolbarEventListeners() {
    const copyBtn = this.selectionToolbar.querySelector('.copy-btn');
    const menuBtn = this.selectionToolbar.querySelector('.menu-btn');
    const snippetBtn = this.selectionToolbar.querySelector('.snippet-btn');
    const pinBtn = this.selectionToolbar.querySelector('.pin-btn');
    const menu = this.selectionToolbar.querySelector('.toolbar-menu');

    // Hover effects
    [copyBtn, menuBtn, ...this.selectionToolbar.querySelectorAll('.menu-item')].forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        btn.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.backgroundColor = 'transparent';
      });
    });

    // Copy button
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.copySelectedText();
    });

    // Menu button
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleToolbarMenu();
    });

    // Snippet button
    snippetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.saveSelectedTextAsSnippet();
    });

    // Pin button
    pinBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.pinSelectedText();
    });

    // Close menu when clicking outside
    document.addEventListener('click', () => {
      this.hideToolbarMenu();
    });
  }

  setupSelectionDetection() {
    let selectionTimeout;

    // Handle text selection
    const handleSelection = () => {
      clearTimeout(selectionTimeout);
      selectionTimeout = setTimeout(() => {
        this.handleTextSelection();
      }, 150); // Debounce selection events
    };

    // Listen for selection events
    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', (e) => {
      // Only handle selection-related keys
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
          e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
          e.key === 'Shift' || e.key === 'Control' || e.key === 'Meta') {
        handleSelection();
      }
    });

    // Hide toolbar on scroll
    document.addEventListener('scroll', () => {
      this.hideSelectionToolbar();
    }, { passive: true });

    // Hide toolbar on window resize
    window.addEventListener('resize', () => {
      this.hideSelectionToolbar();
    });
  }

  handleTextSelection() {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText && selectedText.length > 0) {
      // Check if selection has changed
      if (this.lastSelection !== selectedText) {
        this.lastSelection = selectedText;
        this.showSelectionToolbar(selection);
      }
    } else {
      this.hideSelectionToolbar();
      this.lastSelection = null;
    }
  }

  showSelectionToolbar(selection) {
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Calculate toolbar position
    const toolbarRect = this.selectionToolbar.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let x = rect.left + (rect.width / 2) - (toolbarRect.width / 2);
    let y = rect.top - toolbarRect.height - 8;
    
    // Adjust for viewport boundaries
    if (x < 8) x = 8;
    if (x + toolbarRect.width > viewportWidth - 8) {
      x = viewportWidth - toolbarRect.width - 8;
    }
    
    // If toolbar would be above viewport, show below selection
    if (y < 8) {
      y = rect.bottom + 8;
    }
    
    // Position toolbar
    this.selectionToolbar.style.left = x + 'px';
    this.selectionToolbar.style.top = y + 'px';
    this.selectionToolbar.style.display = 'block';
    this.selectionToolbar.style.pointerEvents = 'auto';
    
    // Animate in
    requestAnimationFrame(() => {
      this.selectionToolbar.style.opacity = '1';
      this.selectionToolbar.style.transform = 'translateY(0)';
    });
  }

  hideSelectionToolbar() {
    if (this.selectionToolbar.style.display === 'none') return;
    
    this.selectionToolbar.style.opacity = '0';
    this.selectionToolbar.style.transform = 'translateY(4px)';
    this.selectionToolbar.style.pointerEvents = 'none';
    
    setTimeout(() => {
      this.selectionToolbar.style.display = 'none';
      this.hideToolbarMenu();
    }, 200);
  }

  toggleToolbarMenu() {
    const menu = this.selectionToolbar.querySelector('.toolbar-menu');
    const isVisible = menu.style.display === 'block';
    
    if (isVisible) {
      this.hideToolbarMenu();
    } else {
      this.showToolbarMenu();
    }
  }

  showToolbarMenu() {
    const menu = this.selectionToolbar.querySelector('.toolbar-menu');
    menu.style.display = 'block';
    
    requestAnimationFrame(() => {
      menu.style.opacity = '1';
      menu.style.transform = 'translateY(0)';
    });
  }

  hideToolbarMenu() {
    const menu = this.selectionToolbar.querySelector('.toolbar-menu');
    if (menu.style.display === 'none') return;
    
    menu.style.opacity = '0';
    menu.style.transform = 'translateY(-4px)';
    
    setTimeout(() => {
      menu.style.display = 'none';
    }, 150);
  }

  async copySelectedText() {
    const selectedText = window.getSelection().toString().trim();
    if (!selectedText) return;

    try {
      await navigator.clipboard.writeText(selectedText);
      
      // Send to background script for history
      this.sendToBackground(selectedText);
      
      // Show feedback
      this.showToolbarFeedback('Copied!');
      
      // Hide toolbar after short delay
      setTimeout(() => {
        this.hideSelectionToolbar();
      }, 1000);
      
    } catch (error) {
      console.error('Error copying selected text:', error);
      this.showToolbarFeedback('Copy failed', true);
    }
  }

  async saveSelectedTextAsSnippet() {
    const selectedText = window.getSelection().toString().trim();
    if (!selectedText) return;

    // Create a simple prompt for snippet title
    const title = prompt('Enter a title for this snippet:',
      selectedText.length > 30 ? selectedText.substring(0, 30) + '...' : selectedText);
    
    if (title && title.trim()) {
      try {
        // Send to background script
        const response = await this.sendMessageToBackground({
          action: 'addSnippet',
          text: selectedText,
          title: title.trim()
        });
        
        if (response && response.success) {
          this.showToolbarFeedback('Snippet saved!');
        } else {
          throw new Error('Failed to save snippet');
        }
      } catch (error) {
        console.error('Error saving snippet:', error);
        this.showToolbarFeedback('Save failed', true);
      }
    }
    
    this.hideToolbarMenu();
    setTimeout(() => {
      this.hideSelectionToolbar();
    }, 1000);
  }

  async pinSelectedText() {
    const selectedText = window.getSelection().toString().trim();
    if (!selectedText) return;

    try {
      // First add to history, then pin it
      this.sendToBackground(selectedText);
      
      // Note: We'll need to modify the background script to support pinning new items
      this.showToolbarFeedback('Added to history!');
      
    } catch (error) {
      console.error('Error pinning selected text:', error);
      this.showToolbarFeedback('Pin failed', true);
    }
    
    this.hideToolbarMenu();
    setTimeout(() => {
      this.hideSelectionToolbar();
    }, 1000);
  }

  showToolbarFeedback(message, isError = false) {
    const copyBtn = this.selectionToolbar.querySelector('.copy-btn');
    const originalContent = copyBtn.innerHTML;
    const originalTitle = copyBtn.title;
    
    copyBtn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${isError ?
          '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>' :
          '<polyline points="20,6 9,17 4,12"></polyline>'
        }
      </svg>
    `;
    
    copyBtn.title = message;
    copyBtn.style.color = isError ? '#FF3B30' : '#34C759';
    
    setTimeout(() => {
      copyBtn.innerHTML = originalContent;
      copyBtn.title = originalTitle;
      copyBtn.style.color = 'inherit';
    }, 1500);
  }

  async sendMessageToBackground(message) {
    return new Promise((resolve) => {
      try {
        if (!chrome.runtime || !chrome.runtime.id) {
          resolve({ success: false, error: 'Extension context invalidated' });
          return;
        }

        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            resolve({ success: false, error: chrome.runtime.lastError.message });
          } else {
            resolve(response);
          }
        });
      } catch (error) {
        resolve({ success: false, error: error.message });
      }
    });
  }

  async showQuickPasteMenu() {
    try {
      // Check if extension context is still valid
      if (!chrome.storage || !chrome.storage.local) {
        console.log('Clipboard Manager: Extension context invalidated, cannot show quick paste menu');
        return;
      }

      // Get clipboard history
      const result = await chrome.storage.local.get(['clipboardHistory']);
      const history = result.clipboardHistory || [];

      if (history.length === 0) {
        this.showEmptyMessage();
        return;
      }

      // Get cursor position or use center of screen
      const rect = this.getCursorPosition();
      
      // Populate menu
      this.populateQuickPasteMenu(history);
      
      // Position and show menu
      this.positionQuickPasteMenu(rect.x, rect.y);
      this.quickPasteMenu.style.display = 'block';
      
      // Focus first item
      const firstItem = this.quickPasteMenu.querySelector('.quick-paste-item');
      if (firstItem) {
        firstItem.focus();
      }
    } catch (error) {
      if (error.message && error.message.includes('Extension context invalidated')) {
        console.log('Clipboard Manager: Extension context invalidated while showing quick paste menu');
        return;
      }
      console.error('Error showing quick paste menu:', error);
    }
  }

  populateQuickPasteMenu(history) {
    this.quickPasteMenu.innerHTML = '';

    // Add header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 8px 12px;
      font-weight: 600;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      margin-bottom: 4px;
      color: #666;
    `;
    header.textContent = 'Clipboard History';
    this.quickPasteMenu.appendChild(header);

    // Add items (max 10)
    const items = history.slice(0, 10);
    items.forEach((item, index) => {
      const itemElement = document.createElement('div');
      itemElement.className = 'quick-paste-item';
      itemElement.tabIndex = 0;
      itemElement.style.cssText = `
        padding: 8px 12px;
        cursor: pointer;
        border-radius: 6px;
        margin: 2px 0;
        transition: background-color 0.1s ease;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      `;

      // Hover and focus styles
      itemElement.addEventListener('mouseenter', () => {
        itemElement.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
      });
      itemElement.addEventListener('mouseleave', () => {
        itemElement.style.backgroundColor = 'transparent';
      });
      itemElement.addEventListener('focus', () => {
        itemElement.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
      });
      itemElement.addEventListener('blur', () => {
        itemElement.style.backgroundColor = 'transparent';
      });

      // Display text (truncated)
      const displayText = item.text.length > 60 ? 
        item.text.substring(0, 60) + '...' : 
        item.text;
      itemElement.textContent = displayText;

      // Click handler
      itemElement.addEventListener('click', () => {
        this.pasteText(item.text);
        this.hideQuickPasteMenu();
      });

      // Keyboard handler
      itemElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          this.pasteText(item.text);
          this.hideQuickPasteMenu();
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          const next = itemElement.nextElementSibling;
          if (next && next.classList.contains('quick-paste-item')) {
            next.focus();
          }
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          const prev = itemElement.previousElementSibling;
          if (prev && prev.classList.contains('quick-paste-item')) {
            prev.focus();
          }
        }
      });

      this.quickPasteMenu.appendChild(itemElement);
    });
  }

  showEmptyMessage() {
    this.quickPasteMenu.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #666;">
        No clipboard history available
      </div>
    `;
    
    const rect = this.getCursorPosition();
    this.positionQuickPasteMenu(rect.x, rect.y);
    this.quickPasteMenu.style.display = 'block';
    
    setTimeout(() => {
      this.hideQuickPasteMenu();
    }, 2000);
  }

  getCursorPosition() {
    // Try to get active element position
    const activeElement = document.activeElement;
    if (activeElement && activeElement.getBoundingClientRect) {
      const rect = activeElement.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.bottom + 10
      };
    }

    // Fallback to center of screen
    return {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };
  }

  positionQuickPasteMenu(x, y) {
    const menuRect = this.quickPasteMenu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust position to keep menu in viewport
    let finalX = x - menuRect.width / 2;
    let finalY = y;

    if (finalX < 10) finalX = 10;
    if (finalX + menuRect.width > viewportWidth - 10) {
      finalX = viewportWidth - menuRect.width - 10;
    }

    if (finalY + menuRect.height > viewportHeight - 10) {
      finalY = y - menuRect.height - 10;
    }

    this.quickPasteMenu.style.left = finalX + 'px';
    this.quickPasteMenu.style.top = finalY + 'px';
  }

  hideQuickPasteMenu() {
    this.quickPasteMenu.style.display = 'none';
  }

  async pasteText(text) {
    try {
      // Copy to clipboard first
      await navigator.clipboard.writeText(text);

      // Try to paste into active element
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.contentEditable === 'true')) {
        if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
          const start = activeElement.selectionStart;
          const end = activeElement.selectionEnd;
          const currentValue = activeElement.value;
          
          activeElement.value = currentValue.substring(0, start) + text + currentValue.substring(end);
          activeElement.selectionStart = activeElement.selectionEnd = start + text.length;
          
          // Trigger input event
          activeElement.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (activeElement.contentEditable === 'true') {
          // For contentEditable elements
          document.execCommand('insertText', false, text);
        }
      }
    } catch (error) {
      console.error('Error pasting text:', error);
    }
  }
}

// Initialize clipboard capture when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.ClipboardCapture = ClipboardCapture;
    new ClipboardCapture();
  });
} else {
  window.ClipboardCapture = ClipboardCapture;
  new ClipboardCapture();
}

} // Close the conditional block that prevents multiple initializations