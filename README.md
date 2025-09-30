# 📋 Clipboard Manager Chrome Extension

A powerful, elegant clipboard manager Chrome extension with macOS-style design that captures and manages all your copied text with advanced features like snippets, search, import/export, and privacy controls.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome](https://img.shields.io/badge/chrome-extension-yellow.svg)

## ✨ Features

### Core Features
- 📋 **Automatic Clipboard Capture** - Captures all copied text automatically
- 🕒 **Clipboard History** - Maintains a history of recent copied items (default: 50 items)
- 💾 **Persistent Storage** - Uses Chrome's local storage to persist data
- 🎨 **macOS-Style UI** - Clean, minimalistic, and highly polished interface
- 🔄 **One-Click Copy** - Re-copy any stored item with a single click
- 🚫 **Duplicate Prevention** - Avoids storing the same text consecutively
- ⚙️ **Customizable History Size** - Set your own limit (10-1000 items)

### Enhanced Features
- 🔍 **Search & Filter** - Quickly find items in your clipboard history
- 🗑️ **Individual Item Deletion** - Remove specific items from history
- 📌 **Pin/Favorite Items** - Keep important items always at the top
- 🧹 **Clear All History** - One-click to clear entire history
- ⏰ **Timestamps** - See when each item was copied
- 🔄 **Sorting Options** - Sort by newest, oldest, or pinned first
- ⌨️ **Keyboard Shortcuts** - Quick access via keyboard
- 🖱️ **Context Menu Integration** - Right-click access to clipboard features

### Advanced Features
- 📤 **Export/Import** - Backup and restore clipboard data (CSV/JSON)
- 📝 **Snippets Management** - Save and manage frequently used text templates
- ⚡ **Quick Paste Menu** - Floating menu for quick selection (Ctrl+Shift+V)
- 🔒 **Privacy & Security** - Exclude sensitive sites (banking, medical)
- 🌓 **Dark/Light Mode** - Auto-detect system theme or manual selection
- 📊 **Usage Statistics** - Track snippet usage counts
- 🔄 **Cross-Device Sync** - Optional sync across Chrome instances

## 🚀 Installation

### From Chrome Web Store (Recommended)
*Coming soon - extension will be published to Chrome Web Store*

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension folder
5. The Clipboard Manager icon should appear in your Chrome toolbar

## 🎯 Usage

### Basic Usage
1. **Copy text** anywhere on any website - it's automatically captured
2. **Click the extension icon** to open the clipboard manager
3. **Click any item** to copy it back to your clipboard
4. **Use the search bar** to quickly find specific items

### Keyboard Shortcuts
- `Ctrl+Shift+C` (Windows/Linux) / `⌘+Shift+C` (Mac) - Open clipboard manager
- `Ctrl+Shift+V` (Windows/Linux) / `⌘+Shift+V` (Mac) - Show quick paste menu
- `Ctrl+Shift+Z` (Windows/Linux) / `⌘+Shift+Z` (Mac) - Paste last copied item

### Advanced Features
- **Pin items**: Click the star icon to keep items at the top
- **Create snippets**: Save frequently used text for quick access
- **Export data**: Backup your clipboard history and snippets
- **Configure settings**: Customize history size, excluded sites, and more

## ⚙️ Configuration

### Settings Page
Access the settings by clicking the gear icon in the popup or right-clicking the extension icon and selecting "Options".

#### General Settings
- **Maximum History Size**: Set how many items to keep (10-1000)
- **Enable Context Menu**: Show clipboard options in right-click menu
- **Enable Quick Paste**: Allow quick paste menu with keyboard shortcut
- **Theme**: Choose Auto (system), Light, or Dark mode

#### Privacy & Security
- **Excluded Sites**: List of domains where clipboard data won't be captured
  ```
  example.com
  *.banking.com
  secure-site.org
  ```

#### Data Management
- **Export Data**: Download your clipboard history and snippets
- **Import Data**: Restore from a backup file
- **Clear All Data**: Remove all clipboard history and snippets

## 🏗️ Technical Architecture

### File Structure
```
clipboard-manager/
├── manifest.json          # Extension manifest (Manifest V3)
├── background.js          # Service worker for storage and logic
├── content.js            # Content script for copy event capture
├── popup.html            # Main popup UI structure
├── popup.js              # Popup functionality and interactions
├── options.html          # Settings page structure
├── options.js            # Settings page functionality
├── styles.css            # macOS-style CSS styling
├── icons/                # Extension icons (16, 32, 48, 128px)
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

### Key Technologies
- **Manifest V3** - Latest Chrome extension standard
- **Chrome Storage API** - For persistent data storage
- **Chrome Context Menus API** - For right-click integration
- **Chrome Commands API** - For keyboard shortcuts
- **Modern JavaScript** - ES6+ features and async/await
- **CSS Grid & Flexbox** - For responsive layouts
- **CSS Custom Properties** - For theming support

### Security Features
- **Site Exclusions** - Prevent clipboard capture on sensitive sites
- **Local Storage Only** - Data stays on your device
- **No External Requests** - No data sent to external servers
- **Manifest V3 Compliance** - Enhanced security model

## 🎨 Design Philosophy

The extension follows **macOS design principles**:

- **Minimalistic** - Clean, uncluttered interface
- **Elegant** - Smooth animations and transitions
- **Highly Polished** - Attention to detail in every interaction
- **Consistent** - Familiar patterns and behaviors
- **Accessible** - Keyboard navigation and screen reader support

### Visual Elements
- Smooth rounded corners and subtle shadows
- Neutral, soft color palette with dark mode support
- Modern typography (SF Pro style)
- Smooth transitions and animations
- Native-feeling controls and interactions

## 🔧 Development

### Prerequisites
- Chrome browser (latest version)
- Basic knowledge of HTML, CSS, and JavaScript
- Understanding of Chrome Extension APIs

### Development Setup
1. Clone the repository
2. Make your changes
3. Load the extension in developer mode
4. Test thoroughly across different websites
5. Submit pull requests for improvements

### Building for Production
The extension is ready to use as-is. For distribution:
1. Ensure all files are present and properly formatted
2. Test on multiple Chrome versions
3. Validate with Chrome Extension validation tools
4. Package for Chrome Web Store submission

## 🐛 Troubleshooting

### Common Issues

**Extension not capturing clipboard data:**
- Check if the site is in your excluded sites list
- Ensure the extension has proper permissions
- Try refreshing the page and copying again

**Quick paste menu not appearing:**
- Verify keyboard shortcuts are enabled in Chrome
- Check if another extension is using the same shortcut
- Try the alternative shortcut or use the popup instead

**Data not persisting:**
- Check Chrome storage permissions
- Ensure you're not in incognito mode (unless enabled for incognito)
- Try clearing extension data and starting fresh

**Performance issues:**
- Reduce maximum history size in settings
- Clear old clipboard history
- Restart Chrome if issues persist

### Support
For issues, feature requests, or contributions:
1. Check existing issues in the repository
2. Create a new issue with detailed description
3. Include Chrome version and extension version
4. Provide steps to reproduce the problem

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines
- Follow existing code style and patterns
- Test thoroughly before submitting
- Update documentation as needed
- Ensure macOS design principles are maintained

## 🙏 Acknowledgments

- Inspired by macOS clipboard managers
- Built with modern web technologies
- Designed for privacy and security
- Community feedback and contributions

## 📈 Roadmap

### Upcoming Features
- [ ] Cloud sync across devices
- [ ] Rich text and image support
- [ ] Advanced snippet templates with variables
- [ ] Clipboard history analytics
- [ ] Integration with popular productivity tools
- [ ] Mobile companion app

### Version History
- **v1.0.0** - Initial release with core features
  - Automatic clipboard capture
  - macOS-style UI
  - Search and filtering
  - Snippets management
  - Import/export functionality
  - Privacy controls

---

**Made with ❤️ for productivity enthusiasts**