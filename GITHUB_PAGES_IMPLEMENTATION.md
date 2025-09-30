# GitHub Pages Implementation Guide

## Complete File Structure and Content

This document contains all the code and content needed to create a professional GitHub Pages site for the Clipboard Manager Chrome Extension.

## 1. Jekyll Configuration (_config.yml)

```yaml
# Site settings
title: Clipboard Manager
description: A powerful Chrome extension for managing clipboard history with macOS-style design
url: https://yourusername.github.io
baseurl: /clipboard-manager

# Build settings
markdown: kramdown
highlighter: rouge
theme: minima

# Plugins
plugins:
  - jekyll-feed
  - jekyll-sitemap
  - jekyll-seo-tag

# Collections
collections:
  docs:
    output: true
    permalink: /:collection/:name/

# Defaults
defaults:
  - scope:
      path: ""
      type: "pages"
    values:
      layout: "default"
  - scope:
      path: "_docs"
      type: "docs"
    values:
      layout: "doc"

# SEO
author: Your Name
twitter:
  username: yourusername
social:
  name: Clipboard Manager
  links:
    - https://github.com/yourusername/clipboard-manager

# Exclude from processing
exclude:
  - README.md
  - GITHUB_PAGES_PLAN.md
  - GITHUB_PAGES_IMPLEMENTATION.md
  - GITHUB_FILES_CHECKLIST.md
  - node_modules
  - vendor
```

## 2. Homepage (index.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clipboard Manager - Chrome Extension</title>
    <meta name="description" content="A powerful Chrome extension for managing clipboard history with macOS-style design, snippets, and privacy controls.">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://yourusername.github.io/clipboard-manager/">
    <meta property="og:title" content="Clipboard Manager - Chrome Extension">
    <meta property="og:description" content="A powerful Chrome extension for managing clipboard history with macOS-style design">
    <meta property="og:image" content="https://yourusername.github.io/clipboard-manager/assets/images/og-image.png">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://yourusername.github.io/clipboard-manager/">
    <meta property="twitter:title" content="Clipboard Manager - Chrome Extension">
    <meta property="twitter:description" content="A powerful Chrome extension for managing clipboard history with macOS-style design">
    <meta property="twitter:image" content="https://yourusername.github.io/clipboard-manager/assets/images/og-image.png">

    <!-- Favicon -->
    <link rel="icon" type="image/png" sizes="32x32" href="./icons/icon32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="./icons/icon16.png">
    
    <!-- Stylesheets -->
    <link rel="stylesheet" href="./assets/css/style.css">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <img src="./icons/icon32.png" alt="Clipboard Manager" class="logo-icon">
                <span class="logo-text">Clipboard Manager</span>
            </div>
            <ul class="nav-menu">
                <li class="nav-item">
                    <a href="#features" class="nav-link">Features</a>
                </li>
                <li class="nav-item">
                    <a href="#installation" class="nav-link">Installation</a>
                </li>
                <li class="nav-item">
                    <a href="./docs/usage.html" class="nav-link">Docs</a>
                </li>
                <li class="nav-item">
                    <a href="https://github.com/yourusername/clipboard-manager" class="nav-link" target="_blank">GitHub</a>
                </li>
            </ul>
            <div class="nav-toggle">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <div class="hero-content">
                <div class="hero-text">
                    <h1 class="hero-title">
                        Powerful Clipboard Manager for Chrome
                    </h1>
                    <p class="hero-description">
                        Capture, organize, and manage your clipboard history with a beautiful macOS-style interface. 
                        Never lose important copied text again.
                    </p>
                    <div class="hero-buttons">
                        <a href="#installation" class="btn btn-primary">
                            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7,10 12,15 17,10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Install Extension
                        </a>
                        <a href="https://github.com/yourusername/clipboard-manager" class="btn btn-secondary" target="_blank">
                            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                            </svg>
                            View Source
                        </a>
                    </div>
                </div>
                <div class="hero-image">
                    <img src="./assets/images/hero-screenshot.png" alt="Clipboard Manager Interface" class="screenshot">
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Powerful Features</h2>
                <p class="section-description">
                    Everything you need to manage your clipboard efficiently and securely
                </p>
            </div>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                        </svg>
                    </div>
                    <h3 class="feature-title">Automatic Capture</h3>
                    <p class="feature-description">
                        Automatically captures all copied text across websites with smart duplicate prevention
                    </p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="M21 21l-4.35-4.35"></path>
                        </svg>
                    </div>
                    <h3 class="feature-title">Smart Search</h3>
                    <p class="feature-description">
                        Quickly find any item in your clipboard history with powerful search and filtering
                    </p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                            <polyline points="14,2 14,8 20,8"></polyline>
                        </svg>
                    </div>
                    <h3 class="feature-title">Snippets Manager</h3>
                    <p class="feature-description">
                        Save and organize frequently used text templates for quick access
                    </p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <circle cx="12" cy="16" r="1"></circle>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                    <h3 class="feature-title">Privacy First</h3>
                    <p class="feature-description">
                        Local storage only, site exclusions, and no external data transmission
                    </p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27,6.96 12,12.01 20.73,6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                    </div>
                    <h3 class="feature-title">macOS Design</h3>
                    <p class="feature-description">
                        Beautiful, polished interface with smooth animations and dark mode support
                    </p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"></path>
                            <polyline points="9,11 12,14 15,11"></polyline>
                            <line x1="12" y1="14" x2="12" y2="2"></line>
                        </svg>
                    </div>
                    <h3 class="feature-title">Export & Import</h3>
                    <p class="feature-description">
                        Backup and restore your clipboard data with CSV/JSON export functionality
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- Installation Section -->
    <section id="installation" class="installation">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Easy Installation</h2>
                <p class="section-description">
                    Get started with Clipboard Manager in just a few clicks
                </p>
            </div>
            <div class="installation-steps">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h3 class="step-title">Download Extension</h3>
                        <p class="step-description">Download the extension files from GitHub or Chrome Web Store</p>
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h3 class="step-title">Enable Developer Mode</h3>
                        <p class="step-description">Go to chrome://extensions/ and enable Developer mode</p>
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h3 class="step-title">Load Extension</h3>
                        <p class="step-description">Click "Load unpacked" and select the extension folder</p>
                    </div>
                </div>
            </div>
            <div class="installation-buttons">
                <a href="https://github.com/yourusername/clipboard-manager/archive/main.zip" class="btn btn-primary">
                    Download Latest Release
                </a>
                <a href="./docs/installation.html" class="btn btn-secondary">
                    Detailed Instructions
                </a>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <div class="footer-logo">
                        <img src="./icons/icon32.png" alt="Clipboard Manager" class="logo-icon">
                        <span class="logo-text">Clipboard Manager</span>
                    </div>
                    <p class="footer-description">
                        A powerful Chrome extension for managing clipboard history with privacy and security in mind.
                    </p>
                </div>
                <div class="footer-section">
                    <h4 class="footer-title">Documentation</h4>
                    <ul class="footer-links">
                        <li><a href="./docs/installation.html">Installation</a></li>
                        <li><a href="./docs/usage.html">Usage Guide</a></li>
                        <li><a href="./docs/features.html">Features</a></li>
                        <li><a href="./docs/troubleshooting.html">Troubleshooting</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4 class="footer-title">Links</h4>
                    <ul class="footer-links">
                        <li><a href="https://github.com/yourusername/clipboard-manager" target="_blank">GitHub</a></li>
                        <li><a href="https://github.com/yourusername/clipboard-manager/issues" target="_blank">Report Bug</a></li>
                        <li><a href="https://github.com/yourusername/clipboard-manager/discussions" target="_blank">Discussions</a></li>
                        <li><a href="./PRIVACY_POLICY.md">Privacy Policy</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4 class="footer-title">Connect</h4>
                    <div class="social-links">
                        <a href="https://github.com/yourusername" target="_blank" class="social-link">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 Clipboard Manager. Licensed under MIT License.</p>
            </div>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="./assets/js/main.js"></script>
</body>
</html>
```

## 3. Main Stylesheet (assets/css/style.css)

```css
/* Reset and Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    /* Colors */
    --primary-color: #007AFF;
    --secondary-color: #5856D6;
    --accent-color: #FF9500;
    --success-color: #34C759;
    --warning-color: #FF9500;
    --error-color: #FF3B30;
    
    /* Neutral Colors */
    --gray-50: #F9FAFB;
    --gray-100: #F3F4F6;
    --gray-200: #E5E7EB;
    --gray-300: #D1D5DB;
    --gray-400: #9CA3AF;
    --gray-500: #6B7280;
    --gray-600: #4B5563;
    --gray-700: #374151;
    --gray-800: #1F2937;
    --gray-900: #111827;
    
    /* Background Colors */
    --bg-primary: #FFFFFF;
    --bg-secondary: #F9FAFB;
    --bg-tertiary: #F3F4F6;
    
    /* Text Colors */
    --text-primary: #111827;
    --text-secondary: #6B7280;
    --text-tertiary: #9CA3AF;
    
    /* Border Colors */
    --border-light: #E5E7EB;
    --border-medium: #D1D5DB;
    --border-dark: #9CA3AF;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    
    /* Typography */
    --font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif;
    --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
    
    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 3rem;
    --spacing-3xl: 4rem;
    
    /* Border Radius */
    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
    
    /* Transitions */
    --transition-fast: 150ms ease-in-out;
    --transition-normal: 250ms ease-in-out;
    --transition-slow: 350ms ease-in-out;
}

/* Dark Mode Variables */
@media (prefers-color-scheme: dark) {
    :root {
        --bg-primary: #000000;
        --bg-secondary: #1C1C1E;
        --bg-tertiary: #2C2C2E;
        
        --text-primary: #FFFFFF;
        --text-secondary: #EBEBF5;
        --text-tertiary: #8E8E93;
        
        --border-light: #38383A;
        --border-medium: #48484A;
        --border-dark: #636366;
    }
}

/* Base Styles */
html {
    scroll-behavior: smooth;
}

body {
    font-family: var(--font-family);
    line-height: 1.6;
    color: var(--text-primary);
    background-color: var(--bg-primary);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* Container */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-md);
}

@media (min-width: 768px) {
    .container {
        padding: 0 var(--spacing-xl);
    }
}

/* Navigation */
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border-light);
    z-index: 1000;
    transition: var(--transition-normal);
}

@media (prefers-color-scheme: dark) {
    .navbar {
        background: rgba(0, 0, 0, 0.8);
    }
}

.nav-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md) 0;
    max-width: 1200px;
    margin: 0 auto;
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
}

@media (min-width: 768px) {
    .nav-container {
        padding-left: var(--spacing-xl);
        padding-right: var(--spacing-xl);
    }
}

.nav-logo {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    text-decoration: none;
    color: var(--text-primary);
    font-weight: 600;
}

.logo-icon {
    width: 24px;
    height: 24px;
}

.logo-text {
    font-size: 1.125rem;
    font-weight: 600;
}

.nav-menu {
    display: none;
    list-style: none;
    gap: var(--spacing-xl);
}

@media (min-width: 768px) {
    .nav-menu {
        display: flex;
    }
}

.nav-link {
    text-decoration: none;
    color: var(--text-secondary);
    font-weight: 500;
    transition: var(--transition-fast);
    padding: var(--spacing-sm) 0;
}

.nav-link:hover {
    color: var(--primary-color);
}

.nav-toggle {
    display: flex;
    flex-direction: column;
    cursor: pointer;
    gap: 4px;
}

@media (min-width: 768px) {
    .nav-toggle {
        display: none;
    }
}

.bar {
    width: 24px;
    height: 2px;
    background-color: var(--text-primary);
    transition: var(--transition-fast);
}

/* Hero Section */
.hero {
    padding: calc(80px + var(--spacing-3xl)) 0 var(--spacing-3xl);
    background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
}

.hero-content {
    display: grid;
    gap: var(--spacing-3xl);
    align-items: center;
}

@media (min-width: 1024px) {
    .hero-content {
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-3xl);
    }
}

.hero-title {
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: var(--spacing-lg);
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

@media (min-width: 768px) {
    .hero-title {
        font-size: 3.5rem;
    }
}

.hero-description {
    font-size: 1.25rem;
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xl);
    line-height: 1.6;
}

.hero-buttons {
    display: flex;
    gap: var(--spacing-md);
    flex-wrap: wrap;
}

.hero-image {
    text-align: center;
}

.screenshot {
    max-width: 100%;
    height: auto;
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-xl);
}

/* Buttons */
.btn {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-xl);
    border-radius: var(--radius-lg);
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    transition: var(--transition-normal);
    border: none;
    cursor: pointer;
    white-space: nowrap;
}

.btn-icon {
    width: 20px;
    height: 20px;
}

.btn-primary {
    background: var(--primary-color);
    color: white;
    box-shadow: var(--shadow-md);
}

.btn-primary:hover {
    background: #0056CC;
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.btn-secondary {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-medium);
}

.btn-secondary:hover {
    background: var(--border-light);
    transform: translateY(-2px);
}

/* Sections */
.section-header {
    text-align: center;
    margin-bottom: var(--spacing-3xl);
}

.section-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: var(--spacing-lg);
    color: var(--text-primary);
}

.section-description {
    font-size: 1.25rem;
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto;
}

/* Features Section */
.features {
    padding: var(--spacing-3xl) 0;
    background: var(--bg-secondary);
}

.features-grid {
    display: grid;
    gap: var(--spacing-xl);
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.feature-card {
    background: var(--bg-primary);
    padding: var(--spacing-xl);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-md);
    transition: var(--transition-normal);
    border: 1px solid var(--border-light);
}

.feature-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
}

.feature-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--spacing-lg);
}

.feature-icon svg {
    width: 24px;
    height: 