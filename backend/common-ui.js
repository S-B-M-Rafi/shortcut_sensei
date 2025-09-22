/*
 * Shortcut Sensei - Backend System
 * 
 * File: Common Header/Footer Template
 * Version: 1.0.0
 * Last Updated: August 31, 2025
 * 
 * Description: Standard header and footer components for all backend modules
 * Dependencies: None
 * 
 * Usage: Include this file before backend module files to ensure consistent UI elements
 */

class CommonUIComponents {
    constructor() {
        this.setupCommonStyles();
    }

    setupCommonStyles() {
        // Add common styles for backend UI components
        if (!document.querySelector('#shortcut-sensei-common-styles')) {
            const styles = document.createElement('style');
            styles.id = 'shortcut-sensei-common-styles';
            styles.textContent = `
                /* Common Backend UI Styles */
                .ss-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 1rem;
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }

                .ss-header h1 {
                    margin: 0;
                    font-size: 1.5rem;
                    font-weight: 600;
                }

                .ss-header .subtitle {
                    font-size: 0.9rem;
                    opacity: 0.9;
                    margin-top: 0.25rem;
                }

                .ss-footer {
                    background: #2c3e50;
                    color: white;
                    padding: 2rem 1rem 1rem;
                    margin-top: 3rem;
                    text-align: center;
                }

                .ss-footer-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 2rem;
                    text-align: left;
                }

                .ss-footer-section h3 {
                    color: #3498db;
                    margin-bottom: 1rem;
                    font-size: 1.1rem;
                }

                .ss-footer-section ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .ss-footer-section li {
                    margin-bottom: 0.5rem;
                }

                .ss-footer-section a {
                    color: #bdc3c7;
                    text-decoration: none;
                    transition: color 0.3s ease;
                }

                .ss-footer-section a:hover {
                    color: #3498db;
                }

                .ss-footer-bottom {
                    margin-top: 2rem;
                    padding-top: 1rem;
                    border-top: 1px solid #34495e;
                    text-align: center;
                    font-size: 0.9rem;
                    color: #95a5a6;
                }

                .ss-nav-breadcrumb {
                    background: #ecf0f1;
                    padding: 0.75rem 1rem;
                    font-size: 0.9rem;
                    border-bottom: 1px solid #d5dbdb;
                }

                .ss-nav-breadcrumb a {
                    color: #3498db;
                    text-decoration: none;
                }

                .ss-nav-breadcrumb a:hover {
                    text-decoration: underline;
                }

                .ss-nav-breadcrumb .separator {
                    margin: 0 0.5rem;
                    color: #7f8c8d;
                }

                /* Backend Component Styles */
                .ss-backend-indicator {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    background: rgba(52, 152, 219, 0.9);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    z-index: 1000;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.2);
                }

                .ss-backend-indicator.active {
                    background: rgba(46, 204, 113, 0.9);
                }

                .ss-backend-indicator.error {
                    background: rgba(231, 76, 60, 0.9);
                }

                /* Notification Styles */
                .ss-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    max-width: 350px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    z-index: 10000;
                    animation: slideInRight 0.3s ease-out;
                }

                .ss-notification.success { border-left: 4px solid #27ae60; }
                .ss-notification.error { border-left: 4px solid #e74c3c; }
                .ss-notification.warning { border-left: 4px solid #f39c12; }
                .ss-notification.info { border-left: 4px solid #3498db; }

                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }

                /* Button Styles */
                .ss-btn {
                    display: inline-block;
                    padding: 0.5rem 1rem;
                    background: #3498db;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    text-decoration: none;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                }

                .ss-btn:hover {
                    background: #2980b9;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }

                .ss-btn.small {
                    padding: 0.25rem 0.5rem;
                    font-size: 0.8rem;
                }

                .ss-btn.large {
                    padding: 0.75rem 1.5rem;
                    font-size: 1rem;
                }

                /* Dark theme support */
                .dark-theme .ss-header {
                    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                }

                .dark-theme .ss-footer {
                    background: #1a1a1a;
                }

                .dark-theme .ss-nav-breadcrumb {
                    background: #2c3e50;
                    color: #ecf0f1;
                    border-bottom-color: #34495e;
                }

                .dark-theme .ss-notification {
                    background: #2c3e50;
                    color: #ecf0f1;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    createHeader(title, subtitle = '') {
        const header = document.createElement('header');
        header.className = 'ss-header';
        header.innerHTML = `
            <h1>${title}</h1>
            ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
        `;
        return header;
    }

    createBreadcrumb(items) {
        const breadcrumb = document.createElement('nav');
        breadcrumb.className = 'ss-nav-breadcrumb';
        
        const breadcrumbHTML = items.map((item, index) => {
            if (index === items.length - 1) {
                return `<span>${item.text}</span>`;
            } else {
                return `<a href="${item.href || '#'}">${item.text}</a><span class="separator">/</span>`;
            }
        }).join('');
        
        breadcrumb.innerHTML = breadcrumbHTML;
        return breadcrumb;
    }

    createFooter() {
        const footer = document.createElement('footer');
        footer.className = 'ss-footer';
        footer.innerHTML = `
            <div class="ss-footer-content">
                <div class="ss-footer-section">
                    <h3>Shortcut Sensei</h3>
                    <ul>
                        <li><a href="home-page.html">Home</a></li>
                        <li><a href="about.htm">About</a></li>
                        <li><a href="user_profile.htm">Profile</a></li>
                        <li><a href="user_com.htm">Community</a></li>
                    </ul>
                </div>
                <div class="ss-footer-section">
                    <h3>Applications</h3>
                    <ul>
                        <li><a href="Google Chrome.html">Google Chrome</a></li>
                        <li><a href="Microsoft Word.htm">Microsoft Word</a></li>
                        <li><a href="Microsoft Excell.htm">Microsoft Excel</a></li>
                        <li><a href="Microsoft PowerPoint.htm">PowerPoint</a></li>
                    </ul>
                </div>
                <div class="ss-footer-section">
                    <h3>Resources</h3>
                    <ul>
                        <li><a href="Html Cheat Sheet.html">HTML Cheat Sheet</a></li>
                        <li><a href="Applications_final.htm">All Applications</a></li>
                        <li><a href="blogs.html">Blog</a></li>
                        <li><a href="test-navigation.html">Navigation Test</a></li>
                    </ul>
                </div>
                <div class="ss-footer-section">
                    <h3>Support</h3>
                    <ul>
                        <li><a href="mailto:support@shortcutsensei.com">Contact</a></li>
                        <li><a href="#" onclick="window.shortcutSenseiBackend?.testAllModules()">System Test</a></li>
                        <li><a href="#" onclick="localStorage.clear(); location.reload()">Reset Data</a></li>
                        <li><a href="#" onclick="window.achievementSystem?.displayCurrentAchievements()">Achievements</a></li>
                    </ul>
                </div>
            </div>
            <div class="ss-footer-bottom">
                <p>&copy; 2025 Shortcut Sensei. All rights reserved. | Enhanced with advanced backend systems.</p>
            </div>
        `;
        return footer;
    }

    createBackendIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'ss-backend-indicator';
        indicator.innerHTML = 'Backend: Initializing...';
        
        // Update indicator based on backend status
        document.addEventListener('backend_initialized', () => {
            indicator.className = 'ss-backend-indicator active';
            indicator.innerHTML = 'Backend: Active';
        });

        window.addEventListener('error', () => {
            indicator.className = 'ss-backend-indicator error';
            indicator.innerHTML = 'Backend: Error';
        });

        return indicator;
    }

    enhanceExistingPage() {
        // Only add header/footer if they don't exist
        if (!document.querySelector('.ss-header') && !document.querySelector('header')) {
            const title = document.title || 'Shortcut Sensei';
            const header = this.createHeader(title, 'Keyboard Shortcuts and Productivity Tips');
            document.body.insertBefore(header, document.body.firstChild);

            // Add breadcrumb if we can determine current page
            const currentPage = this.getCurrentPageInfo();
            if (currentPage) {
                const breadcrumb = this.createBreadcrumb([
                    { text: 'Home', href: 'home-page.html' },
                    { text: currentPage.category, href: currentPage.categoryHref },
                    { text: currentPage.name }
                ]);
                header.after(breadcrumb);
            }
        }

        if (!document.querySelector('.ss-footer') && !document.querySelector('footer')) {
            const footer = this.createFooter();
            document.body.appendChild(footer);
        }

        // Always add backend indicator
        const indicator = this.createBackendIndicator();
        document.body.appendChild(indicator);
    }

    getCurrentPageInfo() {
        const path = window.location.pathname;
        const fileName = path.split('/').pop();
        
        const pageMapping = {
            'Google Chrome.html': { name: 'Google Chrome', category: 'Browsers', categoryHref: 'Applications_final.htm' },
            'Microsoft Excell.htm': { name: 'Microsoft Excel', category: 'Office', categoryHref: 'Applications_final.htm' },
            'Microsoft Word.htm': { name: 'Microsoft Word', category: 'Office', categoryHref: 'Applications_final.htm' },
            'Microsoft PowerPoint.htm': { name: 'PowerPoint', category: 'Office', categoryHref: 'Applications_final.htm' },
            'Adobe PhotoShop.html': { name: 'Adobe Photoshop', category: 'Creative', categoryHref: 'Applications_final.htm' },
            'Visual Studio.html': { name: 'Visual Studio', category: 'Development', categoryHref: 'Applications_final.htm' },
            'Spotify.html': { name: 'Spotify', category: 'Media', categoryHref: 'Applications_final.htm' },
            'about.htm': { name: 'About', category: 'Info', categoryHref: 'home-page.html' },
            'user_profile.htm': { name: 'Profile', category: 'Account', categoryHref: 'home-page.html' },
            'user_com.htm': { name: 'Community', category: 'Social', categoryHref: 'home-page.html' }
        };

        return pageMapping[fileName] || null;
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `ss-notification ${type}`;
        notification.innerHTML = `
            <div style="padding: 1rem;">
                <div style="font-weight: 600; margin-bottom: 0.5rem;">
                    ${type.charAt(0).toUpperCase() + type.slice(1)}
                </div>
                <div>${message}</div>
                <button onclick="this.closest('.ss-notification').remove()" 
                        style="position: absolute; top: 0.5rem; right: 0.5rem; background: none; border: none; font-size: 1.2rem; cursor: pointer; color: inherit; opacity: 0.7;">
                    &times;
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, duration);
    }

    // Utility method to check if a page needs enhancement
    static shouldEnhancePage() {
        // Don't enhance if this is a special admin page or if already enhanced
        const isAlreadyEnhanced = document.querySelector('.ss-header') || document.querySelector('.ss-footer');
        const isAdminPage = window.location.pathname.includes('admin') || window.location.pathname.includes('backend');
        
        return !isAlreadyEnhanced && !isAdminPage;
    }
}

// Auto-initialize common UI components
if (typeof window !== 'undefined') {
    window.CommonUIComponents = CommonUIComponents;
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (CommonUIComponents.shouldEnhancePage()) {
                window.commonUI = new CommonUIComponents();
                window.commonUI.enhanceExistingPage();
            }
        });
    } else {
        if (CommonUIComponents.shouldEnhancePage()) {
            window.commonUI = new CommonUIComponents();
            window.commonUI.enhanceExistingPage();
        }
    }
}

export default CommonUIComponents;
