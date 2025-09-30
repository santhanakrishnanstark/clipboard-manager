# Contributing to Clipboard Manager

Thank you for your interest in contributing to Clipboard Manager! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Chrome browser (latest version)
- Basic knowledge of HTML, CSS, and JavaScript
- Understanding of Chrome Extension APIs
- Git and GitHub account

### Development Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/yourusername/clipboard-manager.git
   cd clipboard-manager
   ```

2. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the project folder
   - The extension should appear in your Chrome toolbar

3. **Make your changes**
   - Create a new branch for your feature/fix
   - Make your changes
   - Test thoroughly

4. **Test your changes**
   - Reload the extension in `chrome://extensions/`
   - Test all functionality
   - Check for console errors
   - Test on multiple websites

## 🎯 How to Contribute

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates.

**Bug Report Template:**
- **Description:** Clear description of the bug
- **Steps to Reproduce:** Detailed steps to reproduce the issue
- **Expected Behavior:** What should happen
- **Actual Behavior:** What actually happens
- **Environment:** Chrome version, OS, extension version
- **Screenshots:** If applicable

### Suggesting Features

We welcome feature suggestions! Please:
- Check existing issues and discussions first
- Provide a clear use case for the feature
- Explain how it would benefit users
- Consider implementation complexity

### Code Contributions

#### Types of Contributions Welcome
- **Bug fixes:** Fix reported issues
- **Feature implementations:** Add new functionality
- **Performance improvements:** Optimize existing code
- **UI/UX enhancements:** Improve user interface
- **Documentation:** Improve docs and comments
- **Tests:** Add or improve test coverage

#### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make your changes**
   - Follow the coding standards below
   - Add comments for complex logic
   - Update documentation if needed

3. **Test thoroughly**
   - Test the extension manually
   - Verify no console errors
   - Test edge cases
   - Test on different websites

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   # or
   git commit -m "fix: resolve issue with clipboard capture"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub

#### Commit Message Convention

We use conventional commits for clear history:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add keyboard shortcut customization
fix: resolve clipboard capture on dynamic content
docs: update installation instructions
style: improve code formatting in popup.js
```

## 📝 Coding Standards

### JavaScript Style Guide

- **ES6+:** Use modern JavaScript features
- **Async/Await:** Prefer over Promises when possible
- **Error Handling:** Always handle errors gracefully
- **Comments:** Document complex logic and APIs

```javascript
// Good
async function addToHistory(text) {
  try {
    const { clipboardHistory } = await chrome.storage.local.get(['clipboardHistory']);
    // Process clipboard history...
  } catch (error) {
    console.error('Failed to add to history:', error);
  }
}

// Avoid
function addToHistory(text) {
  chrome.storage.local.get(['clipboardHistory'], (result) => {
    // No error handling...
  });
}
```

### HTML/CSS Guidelines

- **Semantic HTML:** Use appropriate HTML elements
- **CSS Custom Properties:** Use CSS variables for theming
- **Responsive Design:** Ensure UI works on different screen sizes
- **Accessibility:** Include proper ARIA labels and keyboard navigation

### Chrome Extension Best Practices

- **Manifest V3:** Follow latest Chrome extension standards
- **Permissions:** Request minimal necessary permissions
- **Performance:** Optimize for speed and memory usage
- **Security:** Validate all inputs and sanitize data

## 🧪 Testing Guidelines

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] Extension loads without errors
- [ ] All features work as expected
- [ ] Clipboard capture works on various websites
- [ ] Settings persist correctly
- [ ] Keyboard shortcuts function properly
- [ ] Context menu integration works
- [ ] No console errors or warnings
- [ ] Performance is acceptable

### Test Scenarios

1. **Basic Functionality**
   - Copy text on different websites
   - Verify clipboard history updates
   - Test search and filtering
   - Verify snippet creation and usage

2. **Edge Cases**
   - Very long text (>10,000 characters)
   - Special characters and Unicode
   - Empty clipboard operations
   - Rapid copy operations

3. **Settings and Configuration**
   - Change history size limits
   - Add/remove excluded sites
   - Toggle features on/off
   - Import/export functionality

## 🎨 UI/UX Guidelines

### Design Principles

- **macOS-inspired:** Maintain the clean, elegant aesthetic
- **Consistency:** Use existing patterns and components
- **Accessibility:** Ensure keyboard navigation and screen reader support
- **Performance:** Smooth animations and responsive interactions

### Color Scheme

- **Light Mode:** Use existing CSS custom properties
- **Dark Mode:** Ensure proper contrast ratios
- **Accent Colors:** Use system colors when possible

## 📚 Documentation

### Code Documentation

- **JSDoc comments** for functions and classes
- **Inline comments** for complex logic
- **README updates** for new features
- **API documentation** for public interfaces

### User Documentation

- Update README.md for user-facing changes
- Add screenshots for new UI features
- Update installation instructions if needed
- Document new keyboard shortcuts or settings

## 🔍 Code Review Process

### What We Look For

- **Functionality:** Does the code work as intended?
- **Code Quality:** Is the code clean and maintainable?
- **Performance:** Are there any performance implications?
- **Security:** Are there any security concerns?
- **Documentation:** Is the code properly documented?

### Review Timeline

- Initial review within 2-3 days
- Follow-up reviews within 1-2 days
- Merge after approval and CI passes

## 🏷️ Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR:** Breaking changes
- **MINOR:** New features (backward compatible)
- **PATCH:** Bug fixes (backward compatible)

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version number bumped
- [ ] Changelog updated
- [ ] Release notes prepared

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help newcomers get started
- Focus on the project's goals

### Communication

- **GitHub Issues:** For bugs and feature requests
- **Pull Requests:** For code contributions
- **Discussions:** For general questions and ideas

## 🆘 Getting Help

### Resources

- **Chrome Extension Documentation:** https://developer.chrome.com/docs/extensions/
- **MDN Web Docs:** https://developer.mozilla.org/
- **Project Issues:** Check existing issues for similar problems

### Contact

- Create an issue for bugs or feature requests
- Start a discussion for questions
- Tag maintainers for urgent issues

## 🎉 Recognition

Contributors will be:
- Listed in the project README
- Mentioned in release notes
- Credited in the Chrome Web Store listing (when published)

Thank you for contributing to Clipboard Manager! Your help makes this project better for everyone. 🚀