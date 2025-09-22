// Analytics & Usage Tracking System
// This module handles all analytics collection without affecting frontend UI

class AnalyticsManager {
    constructor() {
        this.initializeAnalytics();
    }

    initializeAnalytics() {
        // Initialize Firebase Analytics if not already done
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            this.db = firebase.firestore();
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // Track shortcut copy events
        document.addEventListener('click', (e) => {
            const shortcutElement = e.target.closest('.key-combo, .shortcut-key, [data-shortcut]');
            if (shortcutElement) {
                const shortcut = shortcutElement.textContent || shortcutElement.dataset.shortcut;
                const appName = this.getAppNameFromPage();
                this.trackShortcutCopy(appName, shortcut);
            }
        });

        // Track page visits
        this.trackPageVisit();

        // Track search queries
        this.trackSearchEvents();

        // Track user engagement
        this.trackUserEngagement();
    }

    // 1. Track Shortcut Copy Events
    trackShortcutCopy(app, shortcut) {
        const event = {
            event: 'shortcut_copied',
            app: app,
            shortcut: shortcut,
            userId: firebase.auth().currentUser?.uid || 'anonymous',
            sessionId: this.getSessionId(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userAgent: navigator.userAgent,
            platform: this.detectPlatform()
        };

        this.db.collection('analytics').add(event).catch(console.error);
        
        // Also track in user activity
        this.updateUserActivity('shortcuts_copied', 1);
    }

    // 2. Track Application Page Visits
    trackPageVisit() {
        const appName = this.getAppNameFromPage();
        const event = {
            event: 'page_visit',
            app: appName,
            page: window.location.pathname,
            userId: firebase.auth().currentUser?.uid || 'anonymous',
            sessionId: this.getSessionId(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            referrer: document.referrer,
            timeOnPage: 0 // Will be updated on page leave
        };

        this.db.collection('analytics').add(event).then(docRef => {
            this.currentPageEventId = docRef.id;
        }).catch(console.error);

        // Track time on page
        this.startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            this.updateTimeOnPage();
        });
    }

    // 3. Track Search Events
    trackSearchEvents() {
        // Track search input events
        const searchInputs = document.querySelectorAll('input[type="text"], input[type="search"], .search-input');
        
        searchInputs.forEach(input => {
            let searchTimeout;
            
            input.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (e.target.value.length > 2) {
                        this.trackSearch(e.target.value, 'typing');
                    }
                }, 500);
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                    this.trackSearch(e.target.value, 'enter');
                }
            });
        });

        // Track search button clicks
        const searchButtons = document.querySelectorAll('.search-btn, .search-button, button[type="submit"]');
        searchButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const form = e.target.closest('form');
                if (form) {
                    const input = form.querySelector('input[type="text"], input[type="search"]');
                    if (input && input.value.trim()) {
                        this.trackSearch(input.value, 'button_click');
                    }
                }
            });
        });
    }

    // 4. Track Search Query
    trackSearch(query, method) {
        const event = {
            event: 'search_performed',
            query: query.toLowerCase().trim(),
            method: method,
            resultsFound: this.countSearchResults(query),
            userId: firebase.auth().currentUser?.uid || 'anonymous',
            sessionId: this.getSessionId(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            page: window.location.pathname
        };

        this.db.collection('search_analytics').add(event).catch(console.error);
        this.updateUserActivity('searches_performed', 1);
    }

    // 5. Track User Engagement
    trackUserEngagement() {
        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
            }
        });

        // Track clicks and interactions
        let clickCount = 0;
        document.addEventListener('click', () => {
            clickCount++;
        });

        // Send engagement data on page unload
        window.addEventListener('beforeunload', () => {
            this.trackEngagementSummary(maxScroll, clickCount);
        });

        // Track feature usage
        this.trackFeatureUsage();
    }

    // 6. Track Feature Usage
    trackFeatureUsage() {
        // Track dark mode toggle
        const themeToggles = document.querySelectorAll('.theme-toggle, .dark-mode-toggle');
        themeToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                this.trackFeatureUse('dark_mode_toggle');
            });
        });

        // Track favorites
        const favoriteButtons = document.querySelectorAll('.favorite-btn, .bookmark-btn, .star-btn');
        favoriteButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.trackFeatureUse('favorite_added');
            });
        });

        // Track export features
        const exportButtons = document.querySelectorAll('.export-btn, .download-btn, .print-btn');
        exportButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.trackFeatureUse('content_exported');
            });
        });
    }

    // Helper Methods
    getAppNameFromPage() {
        const path = window.location.pathname;
        const fileName = path.split('/').pop();
        
        // App name mapping
        const appMapping = {
            'Google Chrome.html': 'Chrome',
            'Microsoft Excell.htm': 'Excel',
            'Microsoft Word.htm': 'Word',
            'Microsoft PowerPoint.htm': 'PowerPoint',
            'Microsoft Edge.html': 'Edge',
            'Applications_final.htm': 'Applications_Hub',
            'home-page.html': 'Homepage',
            'home-page-after_signup.html': 'Homepage_Logged_In',
            'Discord.html': 'Discord',
            'Spotify.html': 'Spotify',
            'Adobe PhotoShop.html': 'Photoshop'
        };

        return appMapping[fileName] || fileName.replace(/\.(html|htm)$/, '');
    }

    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return this.sessionId;
    }

    detectPlatform() {
        const platform = navigator.platform.toLowerCase();
        if (platform.includes('mac')) return 'Mac';
        if (platform.includes('win')) return 'Windows';
        if (platform.includes('linux')) return 'Linux';
        return 'Unknown';
    }

    countSearchResults(query) {
        // Count visible search results on the page
        const resultElements = document.querySelectorAll('.search-result, .app-card:not([style*="display: none"])');
        return resultElements.length;
    }

    updateTimeOnPage() {
        if (this.currentPageEventId && this.startTime) {
            const timeOnPage = Date.now() - this.startTime;
            this.db.collection('analytics').doc(this.currentPageEventId).update({
                timeOnPage: timeOnPage
            }).catch(console.error);
        }
    }

    trackEngagementSummary(scrollDepth, clickCount) {
        const event = {
            event: 'engagement_summary',
            scrollDepth: scrollDepth,
            clickCount: clickCount,
            timeOnPage: Date.now() - this.startTime,
            userId: firebase.auth().currentUser?.uid || 'anonymous',
            sessionId: this.getSessionId(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            page: window.location.pathname
        };

        this.db.collection('analytics').add(event).catch(console.error);
    }

    trackFeatureUse(feature) {
        const event = {
            event: 'feature_used',
            feature: feature,
            userId: firebase.auth().currentUser?.uid || 'anonymous',
            sessionId: this.getSessionId(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            page: window.location.pathname
        };

        this.db.collection('analytics').add(event).catch(console.error);
        this.updateUserActivity('features_used', 1);
    }

    updateUserActivity(activity, increment = 1) {
        const userId = firebase.auth().currentUser?.uid;
        if (!userId) return;

        const userActivityRef = this.db.collection('user_activity').doc(userId);
        const update = {};
        update[activity] = firebase.firestore.FieldValue.increment(increment);
        update.lastActivity = firebase.firestore.FieldValue.serverTimestamp();

        userActivityRef.set(update, { merge: true }).catch(console.error);
    }

    // Analytics Reporting Methods
    async getPopularShortcuts(limit = 10) {
        try {
            const snapshot = await this.db.collection('analytics')
                .where('event', '==', 'shortcut_copied')
                .orderBy('timestamp', 'desc')
                .limit(1000)
                .get();

            const shortcuts = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                const key = `${data.app}:${data.shortcut}`;
                shortcuts[key] = (shortcuts[key] || 0) + 1;
            });

            return Object.entries(shortcuts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, limit)
                .map(([key, count]) => {
                    const [app, shortcut] = key.split(':');
                    return { app, shortcut, count };
                });
        } catch (error) {
            console.error('Error getting popular shortcuts:', error);
            return [];
        }
    }

    async getPopularApps(limit = 10) {
        try {
            const snapshot = await this.db.collection('analytics')
                .where('event', '==', 'page_visit')
                .orderBy('timestamp', 'desc')
                .limit(1000)
                .get();

            const apps = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                apps[data.app] = (apps[data.app] || 0) + 1;
            });

            return Object.entries(apps)
                .sort(([,a], [,b]) => b - a)
                .slice(0, limit)
                .map(([app, count]) => ({ app, visits: count }));
        } catch (error) {
            console.error('Error getting popular apps:', error);
            return [];
        }
    }

    async getUserStats(userId) {
        try {
            const activityDoc = await this.db.collection('user_activity').doc(userId).get();
            return activityDoc.exists ? activityDoc.data() : {};
        } catch (error) {
            console.error('Error getting user stats:', error);
            return {};
        }
    }
}

// Initialize Analytics Manager
if (typeof window !== 'undefined') {
    window.AnalyticsManager = AnalyticsManager;
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.analyticsManager = new AnalyticsManager();
        });
    } else {
        window.analyticsManager = new AnalyticsManager();
    }
}

export default AnalyticsManager;
