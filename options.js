// Options page functionality for Clipboard Manager
class OptionsManager {
  constructor() {
    this.settings = {};
    this.defaultSettings = {
      maxHistorySize: 50,
      excludedSites: [],
      enableQuickPaste: true,
      enableContextMenu: true,
      theme: 'auto',
      sortOrder: 'newest'
    };
    
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupEventListeners();
    this.populateForm();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get(['settings']);
      this.settings = { ...this.defaultSettings, ...result.settings };
    } catch (error) {
      console.error('Error loading settings:', error);
      this.settings = { ...this.defaultSettings };
    }
  }

  setupEventListeners() {
    // Toggle switches
    this.setupToggleSwitch('enableContextMenu');
    this.setupToggleSwitch('enableQuickPaste');

    // Number input
    document.getElementById('maxHistorySize').addEventListener('change', (e) => {
      const value = parseInt(e.target.value);
      if (value >= 10 && value <= 1000) {
        this.settings.maxHistorySize = value;
      } else {
        e.target.value = this.settings.maxHistorySize;
        this.showStatus('History size must be between 10 and 1000', 'error');
      }
    });

    // Theme select
    document.getElementById('themeSelect').addEventListener('change', (e) => {
      this.settings.theme = e.target.value;
    });

    // Excluded sites textarea
    document.getElementById('excludedSites').addEventListener('change', (e) => {
      const sites = e.target.value
        .split('\n')
        .map(site => site.trim())
        .filter(site => site.length > 0);
      this.settings.excludedSites = sites;
    });

    // Action buttons
    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
      this.saveSettings();
    });

    document.getElementById('resetSettingsBtn').addEventListener('click', () => {
      this.resetSettings();
    });

    document.getElementById('exportDataBtn').addEventListener('click', () => {
      this.exportData();
    });

    document.getElementById('importDataBtn').addEventListener('click', () => {
      this.importData();
    });

    document.getElementById('clearAllDataBtn').addEventListener('click', () => {
      this.clearAllData();
    });

    // Import file input
    document.getElementById('importFileInput').addEventListener('change', (e) => {
      this.handleImportFile(e.target.files[0]);
    });

    // Auto-save on input changes
    this.setupAutoSave();
  }

  setupToggleSwitch(settingKey) {
    const toggle = document.getElementById(settingKey);
    
    toggle.addEventListener('click', () => {
      const isActive = toggle.classList.contains('active');
      toggle.classList.toggle('active', !isActive);
      this.settings[settingKey] = !isActive;
    });
  }

  setupAutoSave() {
    // Auto-save settings after a delay when user stops typing
    let saveTimeout;
    const inputs = [
      'maxHistorySize',
      'themeSelect',
      'excludedSites'
    ];

    inputs.forEach(inputId => {
      const element = document.getElementById(inputId);
      element.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          this.saveSettings(true); // Silent save
        }, 1000);
      });
    });

    // Auto-save for toggles
    ['enableContextMenu', 'enableQuickPaste'].forEach(toggleId => {
      document.getElementById(toggleId).addEventListener('click', () => {
        setTimeout(() => {
          this.saveSettings(true); // Silent save
        }, 100);
      });
    });
  }

  populateForm() {
    // Set toggle switches
    document.getElementById('enableContextMenu').classList.toggle('active', this.settings.enableContextMenu);
    document.getElementById('enableQuickPaste').classList.toggle('active', this.settings.enableQuickPaste);

    // Set number input
    document.getElementById('maxHistorySize').value = this.settings.maxHistorySize;

    // Set theme select
    document.getElementById('themeSelect').value = this.settings.theme;

    // Set excluded sites
    document.getElementById('excludedSites').value = this.settings.excludedSites.join('\n');
  }

  async saveSettings(silent = false) {
    try {
      // Validate settings
      if (this.settings.maxHistorySize < 10 || this.settings.maxHistorySize > 1000) {
        throw new Error('History size must be between 10 and 1000');
      }

      // Save to storage
      await chrome.storage.local.set({ settings: this.settings });

      if (!silent) {
        this.showStatus('Settings saved successfully', 'success');
      }

      // Update save button state
      const saveBtn = document.getElementById('saveSettingsBtn');
      saveBtn.textContent = 'Saved!';
      saveBtn.disabled = true;
      
      setTimeout(() => {
        saveBtn.textContent = 'Save Settings';
        saveBtn.disabled = false;
      }, 2000);

    } catch (error) {
      console.error('Error saving settings:', error);
      this.showStatus('Failed to save settings: ' + error.message, 'error');
    }
  }

  async resetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      try {
        this.settings = { ...this.defaultSettings };
        await chrome.storage.local.set({ settings: this.settings });
        this.populateForm();
        this.showStatus('Settings reset to defaults', 'success');
      } catch (error) {
        console.error('Error resetting settings:', error);
        this.showStatus('Failed to reset settings', 'error');
      }
    }
  }

  async exportData() {
    try {
      // Get all data from storage
      const result = await chrome.storage.local.get(['clipboardHistory', 'snippets', 'settings']);
      
      const exportData = {
        clipboardHistory: result.clipboardHistory || [],
        snippets: result.snippets || [],
        settings: result.settings || {},
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        extensionName: 'Clipboard Manager'
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `clipboard-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      
      this.showStatus('Data exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      this.showStatus('Failed to export data', 'error');
    }
  }

  importData() {
    document.getElementById('importFileInput').click();
  }

  async handleImportFile(file) {
    if (!file) return;

    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      // Validate import data structure
      if (!importData.clipboardHistory && !importData.snippets && !importData.settings) {
        throw new Error('Invalid backup file format');
      }

      // Confirm import
      const confirmMessage = `Import data from backup file?\n\n` +
        `• Clipboard History: ${(importData.clipboardHistory || []).length} items\n` +
        `• Snippets: ${(importData.snippets || []).length} items\n` +
        `• Settings: ${importData.settings ? 'Yes' : 'No'}\n\n` +
        `This will merge with your existing data.`;

      if (!confirm(confirmMessage)) {
        return;
      }

      // Get current data
      const currentData = await chrome.storage.local.get(['clipboardHistory', 'snippets', 'settings']);
      
      // Merge clipboard history
      const mergedHistory = [...(currentData.clipboardHistory || [])];
      if (importData.clipboardHistory) {
        importData.clipboardHistory.forEach(item => {
          // Avoid duplicates based on text content
          if (!mergedHistory.find(h => h.text === item.text)) {
            mergedHistory.push({
              ...item,
              id: this.generateId(),
              timestamp: item.timestamp || new Date().toISOString()
            });
          }
        });
      }

      // Merge snippets
      const mergedSnippets = [...(currentData.snippets || [])];
      if (importData.snippets) {
        importData.snippets.forEach(snippet => {
          // Avoid duplicates based on title
          if (!mergedSnippets.find(s => s.title === snippet.title)) {
            mergedSnippets.push({
              ...snippet,
              id: this.generateId(),
              timestamp: snippet.timestamp || new Date().toISOString(),
              useCount: snippet.useCount || 0
            });
          }
        });
      }

      // Merge settings
      const mergedSettings = { 
        ...this.defaultSettings,
        ...currentData.settings,
        ...importData.settings 
      };

      // Save merged data
      await chrome.storage.local.set({
        clipboardHistory: mergedHistory,
        snippets: mergedSnippets,
        settings: mergedSettings
      });

      // Update local settings and form
      this.settings = mergedSettings;
      this.populateForm();

      this.showStatus(`Import successful! Added ${importData.clipboardHistory?.length || 0} history items and ${importData.snippets?.length || 0} snippets`, 'success');

    } catch (error) {
      console.error('Error importing data:', error);
      this.showStatus('Failed to import data: ' + error.message, 'error');
    }

    // Reset file input
    document.getElementById('importFileInput').value = '';
  }

  async clearAllData() {
    const confirmMessage = 'Are you sure you want to clear ALL data?\n\n' +
      'This will permanently delete:\n' +
      '• All clipboard history\n' +
      '• All saved snippets\n' +
      '• All settings (reset to defaults)\n\n' +
      'This action cannot be undone!';

    if (confirm(confirmMessage)) {
      try {
        // Clear all data and reset settings
        await chrome.storage.local.clear();
        await chrome.storage.local.set({ settings: this.defaultSettings });
        
        // Reset local state
        this.settings = { ...this.defaultSettings };
        this.populateForm();
        
        this.showStatus('All data cleared successfully', 'success');
      } catch (error) {
        console.error('Error clearing data:', error);
        this.showStatus('Failed to clear data', 'error');
      }
    }
  }

  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  showStatus(message, type = 'success') {
    const statusElement = document.getElementById('statusMessage');
    statusElement.textContent = message;
    statusElement.className = `status-message ${type}`;
    statusElement.classList.add('show');

    // Hide after 4 seconds
    setTimeout(() => {
      statusElement.classList.remove('show');
    }, 4000);
  }

  // Utility method to validate excluded sites
  validateExcludedSites(sites) {
    const validSites = [];
    const invalidSites = [];

    sites.forEach(site => {
      // Basic validation for domain format
      if (site.match(/^[\w\-\*\.]+\.[a-zA-Z]{2,}$/) || site.match(/^[\w\-\*]+\.[\w\-\*\.]+$/)) {
        validSites.push(site);
      } else {
        invalidSites.push(site);
      }
    });

    if (invalidSites.length > 0) {
      this.showStatus(`Invalid site formats: ${invalidSites.join(', ')}`, 'error');
    }

    return validSites;
  }
}

// Utility functions for theme management
function applyTheme(theme) {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark-theme');
  } else if (theme === 'light') {
    root.classList.remove('dark-theme');
  } else {
    // Auto theme - use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark-theme', prefersDark);
  }
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  // Only apply if theme is set to auto
  chrome.storage.local.get(['settings']).then(result => {
    const settings = result.settings || {};
    if (settings.theme === 'auto') {
      applyTheme('auto');
    }
  });
});

// Initialize options manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new OptionsManager();
  
  // Apply initial theme
  chrome.storage.local.get(['settings']).then(result => {
    const settings = result.settings || {};
    applyTheme(settings.theme || 'auto');
  });
});

// Handle keyboard shortcuts for accessibility
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + S to save settings
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    document.getElementById('saveSettingsBtn').click();
  }
  
  // Escape to close any open dialogs
  if (e.key === 'Escape') {
    // Close any open file dialogs or confirmations
    const fileInput = document.getElementById('importFileInput');
    if (fileInput.value) {
      fileInput.value = '';
    }
  }
});

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Add focus management for better accessibility
document.addEventListener('focusin', (e) => {
  // Add focus ring for keyboard navigation
  if (e.target.matches('button, input, select, textarea')) {
    e.target.classList.add('keyboard-focus');
  }
});

document.addEventListener('focusout', (e) => {
  e.target.classList.remove('keyboard-focus');
});

// Handle mouse clicks to remove keyboard focus styling
document.addEventListener('mousedown', (e) => {
  if (e.target.matches('button, input, select, textarea')) {
    e.target.classList.remove('keyboard-focus');
  }
});