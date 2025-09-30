// Popup functionality for Clipboard Manager
class ClipboardPopup {
  constructor() {
    this.currentTab = 'history';
    this.searchQuery = '';
    this.sortOrder = 'newest';
    this.clipboardHistory = [];
    this.snippets = [];
    this.settings = {};
    
    this.init();
  }

  async init() {
    await this.loadData();
    this.setupEventListeners();
    this.setupMessageListener();
    this.renderCurrentTab();
    this.updateCounts();
  }

  async loadData() {
    try {
      const result = await chrome.storage.local.get(['clipboardHistory', 'snippets', 'settings']);
      this.clipboardHistory = result.clipboardHistory || [];
      this.snippets = result.snippets || [];
      this.settings = result.settings || {};
      
      // Set sort order from settings
      if (this.settings.sortOrder) {
        this.sortOrder = this.settings.sortOrder;
        document.getElementById('sortSelect').value = this.sortOrder;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this.renderCurrentTab();
      
      // Show/hide clear button
      clearSearchBtn.style.display = this.searchQuery ? 'flex' : 'none';
    });

    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      this.searchQuery = '';
      clearSearchBtn.style.display = 'none';
      this.renderCurrentTab();
      searchInput.focus();
    });

    // Sort functionality
    document.getElementById('sortSelect').addEventListener('change', (e) => {
      this.sortOrder = e.target.value;
      this.saveSortOrder();
      this.renderCurrentTab();
    });

    // Header actions
    document.getElementById('refreshBtn').addEventListener('click', () => {
      this.refreshExtension();
    });

    document.getElementById('testBtn').addEventListener('click', () => {
      this.testClipboard();
    });

    document.getElementById('settingsBtn').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });

    document.getElementById('clearAllBtn').addEventListener('click', () => {
      this.showConfirmModal(
        'Clear All History',
        'Are you sure you want to clear all clipboard history? This action cannot be undone.',
        () => this.clearAllHistory()
      );
    });

    // Add snippet button
    document.getElementById('addSnippetBtn').addEventListener('click', () => {
      this.showAddSnippetModal();
    });

    // Footer actions
    document.getElementById('importBtn').addEventListener('click', () => {
      this.importData();
    });

    document.getElementById('exportBtn').addEventListener('click', () => {
      this.exportData();
    });

    // Modal event listeners
    this.setupModalEventListeners();
  }

  setupModalEventListeners() {
    // Add snippet modal
    const addSnippetModal = document.getElementById('addSnippetModal');
    const closeSnippetModal = document.getElementById('closeSnippetModal');
    const cancelSnippetBtn = document.getElementById('cancelSnippetBtn');
    const saveSnippetBtn = document.getElementById('saveSnippetBtn');

    [closeSnippetModal, cancelSnippetBtn].forEach(btn => {
      btn.addEventListener('click', () => {
        this.hideAddSnippetModal();
      });
    });

    saveSnippetBtn.addEventListener('click', () => {
      this.saveSnippet();
    });

    // Confirm modal
    const confirmModal = document.getElementById('confirmModal');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    const confirmActionBtn = document.getElementById('confirmActionBtn');

    confirmCancelBtn.addEventListener('click', () => {
      this.hideConfirmModal();
    });

    // Close modals on overlay click
    [addSnippetModal, confirmModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });

    // Handle escape key for modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (addSnippetModal.classList.contains('active')) {
          this.hideAddSnippetModal();
        }
        if (confirmModal.classList.contains('active')) {
          this.hideConfirmModal();
        }
      }
    });

    // Import file input
    document.getElementById('importFileInput').addEventListener('change', (e) => {
      this.handleImportFile(e.target.files[0]);
    });
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'historyUpdated') {
        this.loadData().then(() => {
          this.renderCurrentTab();
          this.updateCounts();
        });
      } else if (message.action === 'snippetsUpdated') {
        this.loadData().then(() => {
          this.renderCurrentTab();
          this.updateCounts();
        });
      }
    });
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}Tab`);
    });

    this.currentTab = tabName;
    this.renderCurrentTab();
  }

  renderCurrentTab() {
    if (this.currentTab === 'history') {
      this.renderHistory();
    } else if (this.currentTab === 'snippets') {
      this.renderSnippets();
    }
  }

  renderHistory() {
    const container = document.getElementById('historyContainer');
    const emptyState = document.getElementById('historyEmptyState');
    
    let filteredHistory = this.filterItems(this.clipboardHistory);
    filteredHistory = this.sortItems(filteredHistory);

    if (filteredHistory.length === 0) {
      container.innerHTML = '';
      if (emptyState) {
        container.appendChild(emptyState);
      }
      return;
    }

    // Hide empty state before clearing container
    if (emptyState) {
      emptyState.style.display = 'none';
    }
    container.innerHTML = '';

    filteredHistory.forEach(item => {
      const itemElement = this.createHistoryItem(item);
      container.appendChild(itemElement);
    });
  }

  renderSnippets() {
    const container = document.getElementById('snippetsContainer');
    const emptyState = document.getElementById('snippetsEmptyState');
    
    let filteredSnippets = this.filterItems(this.snippets);

    if (filteredSnippets.length === 0) {
      container.innerHTML = '';
      if (emptyState) {
        container.appendChild(emptyState);
      }
      return;
    }

    // Hide empty state before clearing container
    if (emptyState) {
      emptyState.style.display = 'none';
    }
    container.innerHTML = '';

    filteredSnippets.forEach(snippet => {
      const snippetElement = this.createSnippetItem(snippet);
      container.appendChild(snippetElement);
    });
  }

  createHistoryItem(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = `clipboard-item ${item.pinned ? 'pinned' : ''}`;
    itemDiv.tabIndex = 0;

    const timestamp = this.formatTimestamp(item.timestamp);
    const source = item.source || 'Unknown';

    itemDiv.innerHTML = `
      <div class="item-content">
        <div class="item-text">${this.escapeHtml(item.text)}</div>
        <div class="item-meta">
          <span class="item-timestamp">${timestamp}</span>
          <span class="item-source">${this.escapeHtml(source)}</span>
        </div>
      </div>
      <div class="item-actions">
        <button class="action-button pin-button ${item.pinned ? 'pinned' : ''}" title="${item.pinned ? 'Unpin' : 'Pin'}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        </button>
        <button class="action-button copy-button" title="Copy">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        <button class="action-button delete-button" title="Delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
          </svg>
        </button>
      </div>
    `;

    // Event listeners
    itemDiv.addEventListener('click', (e) => {
      if (!e.target.closest('.action-button')) {
        this.copyToClipboard(item.text);
      }
    });

    itemDiv.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.target.closest('.action-button')) {
        this.copyToClipboard(item.text);
      }
    });

    // Action button listeners
    const pinButton = itemDiv.querySelector('.pin-button');
    const copyButton = itemDiv.querySelector('.copy-button');
    const deleteButton = itemDiv.querySelector('.delete-button');

    pinButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.togglePin(item.id);
    });

    copyButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.copyToClipboard(item.text);
    });

    deleteButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteHistoryItem(item.id);
    });

    return itemDiv;
  }

  createSnippetItem(snippet) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'snippet-item';
    itemDiv.tabIndex = 0;

    const timestamp = this.formatTimestamp(snippet.timestamp);

    itemDiv.innerHTML = `
      <div class="snippet-header">
        <div class="snippet-title">${this.escapeHtml(snippet.title)}</div>
        <div class="snippet-actions">
          <button class="action-button copy-button" title="Copy">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button class="action-button delete-button" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="snippet-text">${this.escapeHtml(snippet.text)}</div>
      <div class="snippet-meta">
        <span>Created ${timestamp}</span>
        <span>Used ${snippet.useCount || 0} times</span>
      </div>
    `;

    // Event listeners
    itemDiv.addEventListener('click', (e) => {
      if (!e.target.closest('.action-button')) {
        this.copySnippet(snippet);
      }
    });

    itemDiv.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.target.closest('.action-button')) {
        this.copySnippet(snippet);
      }
    });

    // Action button listeners
    const copyButton = itemDiv.querySelector('.copy-button');
    const deleteButton = itemDiv.querySelector('.delete-button');

    copyButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.copySnippet(snippet);
    });

    deleteButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteSnippet(snippet.id);
    });

    return itemDiv;
  }

  filterItems(items) {
    if (!this.searchQuery) return items;

    return items.filter(item => {
      const searchText = item.text.toLowerCase();
      const searchTitle = (item.title || '').toLowerCase();
      return searchText.includes(this.searchQuery) || searchTitle.includes(this.searchQuery);
    });
  }

  sortItems(items) {
    const sorted = [...items];

    switch (this.sortOrder) {
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      case 'pinned':
        return sorted.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
  }

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('Copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      this.showToast('Failed to copy', 'error');
    }
  }

  async copySnippet(snippet) {
    try {
      await navigator.clipboard.writeText(snippet.text);
      
      // Increment use count
      snippet.useCount = (snippet.useCount || 0) + 1;
      await chrome.storage.local.set({ snippets: this.snippets });
      
      this.showToast('Snippet copied');
      this.renderSnippets();
    } catch (error) {
      console.error('Error copying snippet:', error);
      this.showToast('Failed to copy snippet', 'error');
    }
  }

  async togglePin(itemId) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'togglePin',
        itemId: itemId
      });
      
      if (response && response.success) {
        // Reload data and refresh UI
        await this.loadData();
        this.renderCurrentTab();
        this.updateCounts();
        this.showToast('Pin status updated');
      } else {
        throw new Error(response?.error || 'Failed to toggle pin');
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      this.showToast('Failed to toggle pin', 'error');
    }
  }

  async deleteHistoryItem(itemId) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'removeFromHistory',
        itemId: itemId
      });
      
      if (response && response.success) {
        // Reload data and refresh UI
        await this.loadData();
        this.renderCurrentTab();
        this.updateCounts();
        this.showToast('Item deleted');
      } else {
        throw new Error(response?.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      this.showToast('Failed to delete item', 'error');
    }
  }

  async deleteSnippet(snippetId) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'removeSnippet',
        snippetId: snippetId
      });
      
      if (response && response.success) {
        // Reload data and refresh UI
        await this.loadData();
        this.renderCurrentTab();
        this.updateCounts();
        this.showToast('Snippet deleted');
      } else {
        throw new Error(response?.error || 'Failed to delete snippet');
      }
    } catch (error) {
      console.error('Error deleting snippet:', error);
      this.showToast('Failed to delete snippet', 'error');
    }
  }

  async clearAllHistory() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'clearHistory' });
      
      if (response && response.success) {
        // Reload data and refresh UI
        await this.loadData();
        this.renderCurrentTab();
        this.updateCounts();
        this.hideConfirmModal();
        this.showToast('History cleared');
      } else {
        throw new Error(response?.error || 'Failed to clear history');
      }
    } catch (error) {
      console.error('Error clearing history:', error);
      this.showToast('Failed to clear history', 'error');
    }
  }

  showAddSnippetModal() {
    document.getElementById('snippetTitle').value = '';
    document.getElementById('snippetText').value = '';
    document.getElementById('addSnippetModal').classList.add('active');
    document.getElementById('snippetTitle').focus();
  }

  hideAddSnippetModal() {
    document.getElementById('addSnippetModal').classList.remove('active');
  }

  async saveSnippet() {
    const title = document.getElementById('snippetTitle').value.trim();
    const text = document.getElementById('snippetText').value.trim();

    if (!title || !text) {
      this.showToast('Please fill in both title and content', 'error');
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'addSnippet',
        title: title,
        text: text
      });
      
      if (response && response.success) {
        // Reload data and refresh UI
        await this.loadData();
        this.renderCurrentTab();
        this.updateCounts();
        this.hideAddSnippetModal();
        this.showToast('Snippet saved');
      } else {
        throw new Error(response?.error || 'Failed to save snippet');
      }
    } catch (error) {
      console.error('Error saving snippet:', error);
      this.showToast('Failed to save snippet', 'error');
    }
  }

  showConfirmModal(title, message, onConfirm) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmModal').classList.add('active');
    
    const confirmBtn = document.getElementById('confirmActionBtn');
    confirmBtn.onclick = onConfirm;
  }

  hideConfirmModal() {
    document.getElementById('confirmModal').classList.remove('active');
  }

  async saveSortOrder() {
    try {
      const settings = { ...this.settings, sortOrder: this.sortOrder };
      await chrome.storage.local.set({ settings });
      this.settings = settings;
    } catch (error) {
      console.error('Error saving sort order:', error);
    }
  }

  updateCounts() {
    document.getElementById('historyCount').textContent = 
      `${this.clipboardHistory.length} item${this.clipboardHistory.length !== 1 ? 's' : ''}`;
    document.getElementById('snippetsCount').textContent = 
      `${this.snippets.length} snippet${this.snippets.length !== 1 ? 's' : ''}`;
  }

  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showToast(message, type = 'success') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#FF3B30' : '#34C759'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  async refreshExtension() {
    try {
      this.showToast('Refreshing extension and reinjecting scripts...', 'success');
      
      // Send refresh command to background script
      await chrome.runtime.sendMessage({
        action: 'refreshExtension'
      });
      
      // Refresh the popup data
      await this.loadData();
      this.renderCurrentTab();
      this.updateCounts();
      
      this.showToast('Extension refreshed successfully!', 'success');
      
    } catch (error) {
      console.error('Error refreshing extension:', error);
      this.showToast('Refresh failed: ' + error.message, 'error');
    }
  }

  async testClipboard() {
    try {
      const testText = `Test clipboard entry - ${new Date().toLocaleTimeString()}`;
      
      // Send directly to background script
      await chrome.runtime.sendMessage({
        action: 'addToHistory',
        text: testText,
        source: 'popup-test'
      });
      
      this.showToast('Test entry added to clipboard history');
      
      // Refresh the display
      await this.loadData();
      this.renderCurrentTab();
      this.updateCounts();
      
    } catch (error) {
      console.error('Error testing clipboard:', error);
      this.showToast('Test failed: ' + error.message, 'error');
    }
  }

  async exportData() {
    try {
      const data = {
        clipboardHistory: this.clipboardHistory,
        snippets: this.snippets,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `clipboard-manager-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      this.showToast('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      this.showToast('Failed to export data', 'error');
    }
  }

  importData() {
    document.getElementById('importFileInput').click();
  }

  async handleImportFile(file) {
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.clipboardHistory && !data.snippets) {
        throw new Error('Invalid file format');
      }

      // Merge with existing data
      const existingHistory = this.clipboardHistory;
      const existingSnippets = this.snippets;

      const newHistory = [...existingHistory];
      const newSnippets = [...existingSnippets];

      // Import history
      if (data.clipboardHistory) {
        data.clipboardHistory.forEach(item => {
          if (!newHistory.find(h => h.text === item.text)) {
            newHistory.push({
              ...item,
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
            });
          }
        });
      }

      // Import snippets
      if (data.snippets) {
        data.snippets.forEach(snippet => {
          if (!newSnippets.find(s => s.title === snippet.title)) {
            newSnippets.push({
              ...snippet,
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
            });
          }
        });
      }

      // Save to storage
      await chrome.storage.local.set({
        clipboardHistory: newHistory,
        snippets: newSnippets
      });

      // Reload data and refresh UI
      await this.loadData();
      this.renderCurrentTab();
      this.updateCounts();

      this.showToast('Data imported successfully');
    } catch (error) {
      console.error('Error importing data:', error);
      this.showToast('Failed to import data', 'error');
    }

    // Reset file input
    document.getElementById('importFileInput').value = '';
  }
}

// Add toast animations to CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }
`;
document.head.appendChild(style);

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ClipboardPopup();
});