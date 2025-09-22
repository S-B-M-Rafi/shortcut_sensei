// Global script loader for all backend modules
// Include this script in every HTML page to automatically load all backend functionality

(function() {
    'use strict';
    
    // Configuration
    const BACKEND_CONFIG = {
        version: '1.0.0',
        debug: true,
        autoLoad: true,
        modules: [
            'backend/common-ui.js',
            'backend/analytics.js',
            'backend/preferences.js', 
            'backend/search-enhancement.js',
            'backend/achievements.js',
            'backend/notifications.js',
            'backend/content-management.js',
            'backend/ai-recommendations.js',
            'backend/integration.js',
            'backend/system-verifier.js'
        ],
        dependencies: [
            'https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js',
            'https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js',
            'https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js',
            'https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js',
            'https://www.gstatic.com/firebasejs/8.10.0/firebase-analytics.js'
        ]
    };

    // Utility functions
    function log(message, type = 'info') {
        if (BACKEND_CONFIG.debug) {
            const prefix = {
                'info': '[INFO]',
                'success': '[SUCCESS]',
                'error': '[ERROR]',
                'warning': '[WARNING]'
            };
            console.log(`${prefix[type]} Shortcut Sensei: ${message}`);
        }
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => resolve(src);
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
        });
    }

    function loadCSS(href) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = () => resolve(href);
            link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
            document.head.appendChild(link);
        });
    }

    // Firebase configuration
    function initializeFirebase() {
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase not loaded');
        }

        // Firebase config (replace with your actual config)
        const firebaseConfig = {
            apiKey: "your-api-key",
            authDomain: "shortcut-sensei.firebaseapp.com",
            databaseURL: "https://shortcut-sensei-default-rtdb.firebaseio.com",
            projectId: "shortcut-sensei",
            storageBucket: "shortcut-sensei.appspot.com",
            messagingSenderId: "123456789",
            appId: "your-app-id",
            measurementId: "your-measurement-id"
        };

        // Initialize Firebase if not already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            log('Firebase initialized', 'success');
        }

        // Initialize Firebase Analytics
        if (firebase.analytics && typeof firebase.analytics === 'function') {
            try {
                firebase.analytics();
                log('Firebase Analytics initialized', 'success');
            } catch (error) {
                log('Firebase Analytics initialization failed: ' + error.message, 'warning');
            }
        }
    }

    // Enhanced navigation functionality
    function enhanceNavigation() {
        log('Enhancing navigation...');
        
        // Add smooth scrolling to all anchor links
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

        // Add active state to navigation items
        const currentPage = window.location.pathname.split('/').pop();
        document.querySelectorAll('nav a, .navigation a').forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });

        // Add keyboard navigation support
        document.addEventListener('keydown', (e) => {
            // Alt + H for home
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                window.location.href = 'home-page.html';
            }
            
            // Alt + B for back
            if (e.altKey && e.key === 'b') {
                e.preventDefault();
                window.history.back();
            }
            
            // Alt + F for search
            if (e.altKey && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.querySelector('#search-input, .search-input, input[type="search"]');
                if (searchInput) {
                    searchInput.focus();
                }
            }
        });

        log('Navigation enhanced', 'success');
    }

    // UI Enhancements
    function enhanceUI() {
        log('Enhancing UI...');
        
        // Add loading states
        addLoadingStates();
        
        // Add tooltips
        addTooltips();
        
        // Add keyboard shortcuts display
        addKeyboardShortcutsHelper();
        
        // Add copy functionality
        addCopyFunctionality();
        
        // Add theme toggle if not exists
        addThemeToggle();
        
        log('UI enhanced', 'success');
    }

    function addLoadingStates() {
        // Add loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            backdrop-filter: blur(5px);
        `;
        
        loadingOverlay.innerHTML = `
            <div style="text-align: center;">
                <div style="width: 50px; height: 50px; border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                <p style="margin-top: 15px; color: #666;">Loading Shortcut Sensei...</p>
            </div>
        `;
        
        // Add spin animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(loadingOverlay);
        
        // Remove loading overlay when everything is loaded
        window.addEventListener('backend_initialized', () => {
            setTimeout(() => {
                loadingOverlay.style.opacity = '0';
                loadingOverlay.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    if (loadingOverlay.parentNode) {
                        loadingOverlay.parentNode.removeChild(loadingOverlay);
                    }
                }, 500);
            }, 1000);
        });
    }

    function addTooltips() {
        // Add tooltips to shortcut elements
        document.querySelectorAll('.key-combo, .shortcut-key, [data-shortcut]').forEach(element => {
            if (!element.title) {
                element.title = 'Click to copy shortcut';
                element.style.cursor = 'pointer';
            }
        });
    }

    function addKeyboardShortcutsHelper() {
        // Add keyboard shortcuts help
        const helpButton = document.createElement('button');
        helpButton.id = 'keyboard-help-btn';
        helpButton.innerHTML = 'Help';
        helpButton.title = 'Keyboard Shortcuts (Alt + ?)';
        helpButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: #3498db;
            color: white;
            font-size: 20px;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
        `;
        
        helpButton.addEventListener('click', showKeyboardHelp);
        document.body.appendChild(helpButton);
        
        // Alt + ? to show help
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === '?') {
                e.preventDefault();
                showKeyboardHelp();
            }
        });
    }

    function showKeyboardHelp() {
        const helpModal = document.createElement('div');
        helpModal.id = 'keyboard-help-modal';
        helpModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        helpModal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; max-height: 80vh; overflow-y: auto;">
                <h2 style="margin-top: 0; color: #333;">Keyboard Shortcuts</h2>
                <div style="display: grid; gap: 10px;">
                    <div><strong>Alt + H</strong> - Go to Home</div>
                    <div><strong>Alt + B</strong> - Go Back</div>
                    <div><strong>Alt + F</strong> - Focus Search</div>
                    <div><strong>Alt + ?</strong> - Show this help</div>
                    <div><strong>Escape</strong> - Close modals</div>
                    <div><strong>Tab</strong> - Navigate elements</div>
                </div>
                <button onclick="this.closest('#keyboard-help-modal').remove()" style="margin-top: 20px; padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
            </div>
        `;
        
        // Close on escape or click outside
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.remove();
            }
        });
        
        document.addEventListener('keydown', function escapeHandler(e) {
            if (e.key === 'Escape') {
                helpModal.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        });
        
        document.body.appendChild(helpModal);
    }

    function addCopyFunctionality() {
        // Add copy functionality to all shortcuts
        document.addEventListener('click', (e) => {
            const shortcutElement = e.target.closest('.key-combo, .shortcut-key, [data-shortcut]');
            if (shortcutElement) {
                const shortcutText = shortcutElement.textContent.trim() || shortcutElement.dataset.shortcut;
                
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(shortcutText).then(() => {
                        showCopyNotification(shortcutText);
                    });
                } else {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = shortcutText;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    showCopyNotification(shortcutText);
                }
            }
        });
    }

    function showCopyNotification(text) {
        const notification = document.createElement('div');
        notification.textContent = `Copied: ${text}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #27ae60;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            animation: slideInOut 2s ease-in-out;
        `;
        
        // Add animation
        if (!document.querySelector('#copy-notification-style')) {
            const style = document.createElement('style');
            style.id = 'copy-notification-style';
            style.textContent = `
                @keyframes slideInOut {
                    0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                    20%, 80% { opacity: 1; transform: translateX(-50%) translateY(0); }
                    100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    }

    function addThemeToggle() {
        if (document.getElementById('theme-toggle')) return; // Already exists
        
        const themeToggle = document.createElement('button');
        themeToggle.id = 'theme-toggle';
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.title = 'Toggle Dark Mode';
        themeToggle.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: none;
            background: #3498db;
            color: white;
            font-size: 16px;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
        `;
        
        themeToggle.addEventListener('click', toggleTheme);
        document.body.appendChild(themeToggle);
        
        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            enableDarkMode();
        }
    }

    function toggleTheme() {
        const isDark = document.body.classList.contains('dark-theme');
        
        if (isDark) {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
    }

    function enableDarkMode() {
        document.body.classList.add('dark-theme');
        document.getElementById('theme-toggle').innerHTML = 'Light';
        localStorage.setItem('theme', 'dark');
        
        // Add dark mode styles if not exists
        if (!document.getElementById('dark-mode-styles')) {
            const darkStyles = document.createElement('style');
            darkStyles.id = 'dark-mode-styles';
            darkStyles.textContent = `
                .dark-theme {
                    background-color: #1a1a1a !important;
                    color: #e0e0e0 !important;
                }
                .dark-theme table,
                .dark-theme tr,
                .dark-theme td,
                .dark-theme th {
                    background-color: #2d2d2d !important;
                    color: #e0e0e0 !important;
                    border-color: #444 !important;
                }
                .dark-theme .key-combo,
                .dark-theme .shortcut-key {
                    background-color: #444 !important;
                    color: #fff !important;
                    border-color: #666 !important;
                }
                .dark-theme h1,
                .dark-theme h2,
                .dark-theme h3,
                .dark-theme h4,
                .dark-theme h5,
                .dark-theme h6 {
                    color: #fff !important;
                }
            `;
            document.head.appendChild(darkStyles);
        }
    }

    function disableDarkMode() {
        document.body.classList.remove('dark-theme');
        document.getElementById('theme-toggle').innerHTML = 'Dark';
        localStorage.setItem('theme', 'light');
    }

    // Main initialization function
    async function initialize() {
        log('Starting Shortcut Sensei initialization...');
        
        try {
            // Load dependencies first
            log('Loading Firebase dependencies...');
            for (const dependency of BACKEND_CONFIG.dependencies) {
                try {
                    await loadScript(dependency);
                    log(`Loaded: ${dependency.split('/').pop()}`, 'success');
                } catch (error) {
                    log(`Failed to load: ${dependency}`, 'error');
                }
            }
            
            // Initialize Firebase
            initializeFirebase();
            
            // Enhance UI immediately
            enhanceUI();
            enhanceNavigation();
            
            // Load backend modules
            if (BACKEND_CONFIG.autoLoad) {
                log('Loading backend modules...');
                for (const module of BACKEND_CONFIG.modules) {
                    try {
                        await loadScript(module);
                        log(`Loaded: ${module}`, 'success');
                    } catch (error) {
                        log(`Failed to load: ${module}`, 'warning');
                        // Continue loading other modules
                    }
                }
            }
            
            log('Initialization complete!', 'success');
            
        } catch (error) {
            log(`Initialization error: ${error.message}`, 'error');
        }
    }

    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Expose global API
    window.ShortcutSenseiBoot = {
        version: BACKEND_CONFIG.version,
        initialize: initialize,
        loadScript: loadScript,
        log: log
    };

})();
