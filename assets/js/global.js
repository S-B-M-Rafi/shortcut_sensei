// Shortcut Sensei - Global Header and Footer JavaScript
class ShortcutSenseiGlobal {
    constructor() {
        this.initializeGlobalFeatures();
    }

    initializeGlobalFeatures() {
        this.setupMobileMenu();
        this.setupGlobalSearch();
        this.setupNewsletterForm();
        this.setupScrollToTop();
        this.setupGlobalNavigation();
    }

    setupMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const mainNav = document.querySelector('.main-nav ul');

        if (menuToggle && mainNav) {
            menuToggle.addEventListener('click', () => {
                mainNav.classList.toggle('show');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.main-nav') && !e.target.closest('.menu-toggle')) {
                    mainNav.classList.remove('show');
                }
            });
        }
    }

    setupGlobalSearch() {
        const searchInput = document.querySelector('.search-container input[type="text"]');
        const searchButton = document.querySelector('.search-container button');

        if (searchInput && searchButton) {
            searchButton.addEventListener('click', () => {
                this.performGlobalSearch(searchInput.value);
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performGlobalSearch(searchInput.value);
                }
            });

            // Global search shortcut Ctrl/Cmd + K
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    searchInput.focus();
                    searchInput.select();
                }
            });
        }
    }

    performGlobalSearch(query) {
        if (!query.trim()) return;

        const searchTerm = query.toLowerCase().trim();
        
        // Application search mappings
        const appMappings = {
            'chrome': 'Google Chrome.html',
            'google chrome': 'Google Chrome.html',
            'excel': 'Microsoft Excell.htm',
            'word': 'Microsoft Word.htm',
            'powerpoint': 'Microsoft PowerPoint.htm',
            'outlook': 'Microsoft Outlook.html',
            'teams': 'Microsoft Teams.html',
            'discord': 'Discord.html',
            'spotify': 'Spotify.html',
            'photoshop': 'Adobe PhotoShop.html'
        };

        // Check for direct app matches
        for (const [key, value] of Object.entries(appMappings)) {
            if (searchTerm.includes(key) || key.includes(searchTerm)) {
                this.navigateToPage(value);
                return;
            }
        }

        // Default to applications page with search
        this.navigateToPage(`Applications_final.htm?search=${encodeURIComponent(query)}`);
    }

    setupNewsletterForm() {
        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = newsletterForm.querySelector('input[type="email"]').value;
                if (email) {
                    this.showGlobalNotification('Thanks for subscribing! We\'ll keep you updated.', 'success');
                    newsletterForm.querySelector('input[type="email"]').value = '';
                }
            });
        }
    }

    setupScrollToTop() {
        const scrollButton = document.createElement('button');
        scrollButton.innerHTML = '↑';
        scrollButton.className = 'scroll-to-top';
        scrollButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--primary-color);
            color: white;
            border: none;
            font-size: 20px;
            cursor: pointer;
            display: none;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;

        scrollButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollButton.style.display = 'block';
            } else {
                scrollButton.style.display = 'none';
            }
        });

        document.body.appendChild(scrollButton);
    }

    setupGlobalNavigation() {
        // Handle navigation links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (!link) return;

            const href = link.getAttribute('href');
            
            // Skip external links and anchors
            if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) {
                return;
            }

            // Handle internal navigation
            if (href.endsWith('.html') || href.endsWith('.htm')) {
                e.preventDefault();
                this.navigateToPage(href);
            }
        });
    }

    navigateToPage(url) {
        // Add loading animation
        this.showPageTransition();
        
        setTimeout(() => {
            window.location.href = url;
        }, 300);
    }

    showPageTransition() {
        const loader = document.createElement('div');
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
            z-index: 10001;
            animation: loading 1s ease-in-out;
        `;

        // Add animation keyframes
        if (!document.getElementById('loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = `
                @keyframes loading {
                    0% { width: 0%; }
                    50% { width: 70%; }
                    100% { width: 100%; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(loader);

        setTimeout(() => {
            if (loader.parentNode) {
                loader.remove();
            }
        }, 1000);
    }

    showGlobalNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : 'var(--primary-color)';
        
        notification.style.cssText = `
            position: fixed;
            top: 120px;
            left: 50%;
            transform: translateX(-50%);
            background: ${bgColor};
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            animation: slideDown 0.3s ease-out;
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// Initialize global features when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ShortcutSenseiGlobal();
});

// Export for use in other scripts
window.ShortcutSenseiGlobal = ShortcutSenseiGlobal;
