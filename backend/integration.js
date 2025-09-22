// Master Backend Integration Script
// Initializes and coordinates all backend modules for Shortcut Sensei

class ShortcutSenseiBackend {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
        this.initializationOrder = [
            'commonUI',
            'analytics',
            'preferences', 
            'search',
            'achievements',
            'notifications',
            'contentManagement',
            'aiRecommendations'
        ];
        
        this.initialize();
    }

    async initialize() {
        console.log('Initializing Shortcut Sensei Backend...');
        
        try {
            // Check Firebase availability
            await this.checkFirebaseConnection();
            
            // Initialize modules in order
            await this.initializeModules();
            
            // Setup inter-module communication
            this.setupModuleCommunication();
            
            // Setup global event handlers
            this.setupGlobalEventHandlers();
            
            // Start background processes
            this.startBackgroundProcesses();
            
            this.isInitialized = true;
            console.log('Shortcut Sensei Backend initialized successfully');
            
            // Dispatch initialization complete event
            window.dispatchEvent(new CustomEvent('backend_initialized', {
                detail: { modules: Object.keys(this.modules) }
            }));
            
        } catch (error) {
            console.error('Backend initialization failed:', error);
            this.handleInitializationError(error);
        }
    }

    async checkFirebaseConnection() {
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase not loaded');
        }

        // Wait for auth state to be ready
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Firebase auth timeout'));
            }, 10000);

            firebase.auth().onAuthStateChanged((user) => {
                clearTimeout(timeout);
                console.log('Firebase auth state:', user ? 'authenticated' : 'anonymous');
                resolve();
            });
        });
    }

    async initializeModules() {
        console.log('Loading backend modules...');
        
        for (const moduleName of this.initializationOrder) {
            try {
                await this.loadModule(moduleName);
                console.log(`${moduleName} module loaded`);
            } catch (error) {
                console.error(`Failed to load ${moduleName} module:`, error);
                // Continue with other modules
            }
        }
    }

    async loadModule(moduleName) {
        const moduleMap = {
            'commonUI': () => new CommonUIComponents(),
            'analytics': () => new AnalyticsTracker(),
            'preferences': () => new UserPreferences(),
            'search': () => new SearchEnhancement(),
            'achievements': () => new AchievementSystem(),
            'notifications': () => new NotificationSystem(),
            'contentManagement': () => new ContentManagement(),
            'aiRecommendations': () => new RecommendationEngine()
        };

        const moduleLoader = moduleMap[moduleName];
        if (moduleLoader) {
            this.modules[moduleName] = moduleLoader();
            
            // Wait for module initialization if it has an async init method
            if (this.modules[moduleName].initialize) {
                await this.modules[moduleName].initialize();
            }
        }
    }

    setupModuleCommunication() {
        console.log('Setting up module communication...');
        
        // Analytics <-> Achievements integration
        this.setupAnalyticsAchievementsIntegration();
        
        // Search <-> Analytics integration
        this.setupSearchAnalyticsIntegration();
        
        // Preferences <-> All modules integration
        this.setupPreferencesIntegration();
        
        // Notifications <-> All modules integration
        this.setupNotificationsIntegration();
        
        // AI Recommendations <-> Analytics integration
        this.setupAIRecommendationsIntegration();
        
        // Content Management <-> All modules integration
        this.setupContentManagementIntegration();
    }

    setupAnalyticsAchievementsIntegration() {
        // When analytics tracks an event, check for achievements
        document.addEventListener('analytics_event', (e) => {
            if (this.modules.achievements) {
                this.modules.achievements.checkAchievements(e.detail);
            }
        });

        // When achievement is unlocked, track it in analytics
        document.addEventListener('achievement_unlocked', (e) => {
            if (this.modules.analytics) {
                this.modules.analytics.trackEvent('achievement', {
                    type: 'unlocked',
                    achievementId: e.detail.id,
                    achievementName: e.detail.name
                });
            }
        });
    }

    setupSearchAnalyticsIntegration() {
        // Track search events
        document.addEventListener('search_performed', (e) => {
            if (this.modules.analytics) {
                this.modules.analytics.trackSearch(e.detail.query, e.detail.results);
            }
        });

        // Track search suggestion clicks
        document.addEventListener('search_suggestion_clicked', (e) => {
            if (this.modules.analytics) {
                this.modules.analytics.trackEvent('search', {
                    type: 'suggestion_clicked',
                    suggestion: e.detail.suggestion,
                    query: e.detail.originalQuery
                });
            }
        });
    }

    setupPreferencesIntegration() {
        // When preferences change, notify all modules
        document.addEventListener('preferences_changed', (e) => {
            const { preference, value } = e.detail;
            
            // Notify all modules about preference changes
            Object.values(this.modules).forEach(module => {
                if (module.onPreferenceChanged) {
                    module.onPreferenceChanged(preference, value);
                }
            });
        });

        // Apply current preferences to all modules
        if (this.modules.preferences) {
            const currentPrefs = this.modules.preferences.getAllPreferences();
            Object.entries(currentPrefs).forEach(([key, value]) => {
                this.applyPreferenceToModules(key, value);
            });
        }
    }

    setupNotificationsIntegration() {
        // All modules can send notifications
        document.addEventListener('send_notification', (e) => {
            if (this.modules.notifications) {
                this.modules.notifications.showNotification(e.detail);
            }
        });

        // Track notification interactions
        document.addEventListener('notification_clicked', (e) => {
            if (this.modules.analytics) {
                this.modules.analytics.trackEvent('notification', {
                    type: 'clicked',
                    notificationId: e.detail.id
                });
            }
        });
    }

    setupAIRecommendationsIntegration() {
        // Track when recommendations are displayed
        document.addEventListener('recommendations_displayed', (e) => {
            if (this.modules.analytics) {
                this.modules.analytics.trackEvent('ai_recommendations', {
                    type: 'displayed',
                    count: e.detail.recommendations.length,
                    context: e.detail.context
                });
            }
        });

        // Track recommendation interactions
        document.addEventListener('recommendation_clicked', (e) => {
            if (this.modules.analytics) {
                this.modules.analytics.trackEvent('ai_recommendations', {
                    type: 'clicked',
                    recommendation: e.detail.recommendation
                });
            }
        });
    }

    setupContentManagementIntegration() {
        // When content is updated, clear caches and notify modules
        document.addEventListener('content_updated', (e) => {
            // Clear search cache
            if (this.modules.search && this.modules.search.clearCache) {
                this.modules.search.clearCache();
            }

            // Update AI recommendations data
            if (this.modules.aiRecommendations && this.modules.aiRecommendations.refreshShortcutDatabase) {
                this.modules.aiRecommendations.refreshShortcutDatabase();
            }

            // Track content update
            if (this.modules.analytics) {
                this.modules.analytics.trackEvent('content', {
                    type: 'updated',
                    contentType: e.detail.type,
                    contentId: e.detail.id
                });
            }
        });
    }

    setupGlobalEventHandlers() {
        console.log('Setting up global event handlers...');
        
        // Global shortcut tracking
        this.setupGlobalShortcutTracking();
        
        // Global navigation tracking
        this.setupGlobalNavigationTracking();
        
        // Global error handling
        this.setupGlobalErrorHandling();
        
        // Global performance monitoring
        this.setupGlobalPerformanceMonitoring();
    }

    setupGlobalShortcutTracking() {
        document.addEventListener('click', (e) => {
            const shortcutElement = e.target.closest('.key-combo, .shortcut-key, [data-shortcut]');
            if (shortcutElement) {
                const shortcutData = this.extractShortcutData(shortcutElement);
                
                // Track in analytics
                if (this.modules.analytics) {
                    this.modules.analytics.trackShortcutClick(shortcutData);
                }
                
                // Check achievements
                if (this.modules.achievements) {
                    this.modules.achievements.checkShortcutAchievements(shortcutData);
                }
                
                // Update AI recommendations
                if (this.modules.aiRecommendations) {
                    this.modules.aiRecommendations.recordShortcutInteraction(shortcutElement);
                }
            }
        });
    }

    setupGlobalNavigationTracking() {
        // Track page visits
        window.addEventListener('load', () => {
            const pageData = this.extractPageData();
            
            if (this.modules.analytics) {
                this.modules.analytics.trackPageVisit(pageData);
            }
        });

        // Track navigation between pages
        window.addEventListener('beforeunload', () => {
            const sessionData = this.extractSessionData();
            
            if (this.modules.analytics) {
                this.modules.analytics.trackSessionEnd(sessionData);
            }
        });
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (e) => {
            if (this.modules.analytics) {
                this.modules.analytics.trackError({
                    message: e.message,
                    filename: e.filename,
                    lineno: e.lineno,
                    colno: e.colno,
                    stack: e.error?.stack
                });
            }
        });

        window.addEventListener('unhandledrejection', (e) => {
            if (this.modules.analytics) {
                this.modules.analytics.trackError({
                    type: 'unhandledPromiseRejection',
                    reason: e.reason,
                    stack: e.reason?.stack
                });
            }
        });
    }

    setupGlobalPerformanceMonitoring() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                const performance = this.getPerformanceMetrics();
                
                if (this.modules.analytics) {
                    this.modules.analytics.trackPerformance(performance);
                }
            }, 1000);
        });
    }

    startBackgroundProcesses() {
        console.log('Starting background processes...');
        
        // Start periodic data sync
        this.startPeriodicSync();
        
        // Start performance monitoring
        this.startPerformanceMonitoring();
        
        // Start recommendation updates
        this.startRecommendationUpdates();
        
        // Start achievement checks
        this.startAchievementChecks();
    }

    startPeriodicSync() {
        // Sync data every 5 minutes
        setInterval(() => {
            this.syncAllModules();
        }, 5 * 60 * 1000);
    }

    startPerformanceMonitoring() {
        // Monitor performance every minute
        setInterval(() => {
            const metrics = this.getPerformanceMetrics();
            
            if (this.modules.analytics) {
                this.modules.analytics.trackPerformanceMetrics(metrics);
            }
        }, 60 * 1000);
    }

    startRecommendationUpdates() {
        // Update recommendations every 10 minutes
        setInterval(() => {
            if (this.modules.aiRecommendations) {
                this.modules.aiRecommendations.refreshRecommendations();
            }
        }, 10 * 60 * 1000);
    }

    startAchievementChecks() {
        // Check for new achievements every 30 seconds
        setInterval(() => {
            if (this.modules.achievements) {
                this.modules.achievements.checkPendingAchievements();
            }
        }, 30 * 1000);
    }

    // Utility Methods
    extractShortcutData(element) {
        return {
            shortcut: element.textContent || element.dataset.shortcut,
            app: this.getCurrentApp(),
            category: this.getShortcutCategory(element),
            difficulty: this.getShortcutDifficulty(element),
            timestamp: Date.now()
        };
    }

    extractPageData() {
        return {
            url: window.location.href,
            title: document.title,
            app: this.getCurrentApp(),
            timestamp: Date.now(),
            referrer: document.referrer
        };
    }

    extractSessionData() {
        return {
            timeSpent: Date.now() - (window.sessionStartTime || Date.now()),
            interactions: window.sessionInteractions || 0,
            app: this.getCurrentApp()
        };
    }

    getCurrentApp() {
        const path = window.location.pathname;
        const fileName = path.split('/').pop();
        
        const appMapping = {
            'Google Chrome.html': 'Chrome',
            'Microsoft Excell.htm': 'Excel',
            'Microsoft Word.htm': 'Word',
            'Microsoft PowerPoint.htm': 'PowerPoint',
            'Adobe PhotoShop.html': 'Photoshop',
            'Visual Studio.html': 'Visual Studio',
            'Spotify.html': 'Spotify'
        };

        return appMapping[fileName] || fileName.replace(/\.(html|htm)$/, '');
    }

    getShortcutCategory(element) {
        const section = element.closest('section, .shortcuts-section');
        if (section) {
            const title = section.querySelector('h1, h2, h3, .section-title');
            if (title) {
                return title.textContent.toLowerCase().replace(/[^a-z0-9]/g, '_');
            }
        }
        return 'general';
    }

    getShortcutDifficulty(element) {
        const difficultyElement = element.closest('tr')?.querySelector('.difficulty, [data-difficulty]');
        return difficultyElement?.textContent?.toLowerCase() || 
               difficultyElement?.dataset?.difficulty || 
               'intermediate';
    }

    getPerformanceMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        return {
            loadTime: navigation?.loadEventEnd - navigation?.loadEventStart,
            domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
            firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
            firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
            memoryUsage: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null
        };
    }

    applyPreferenceToModules(preference, value) {
        Object.values(this.modules).forEach(module => {
            if (module.onPreferenceChanged) {
                module.onPreferenceChanged(preference, value);
            }
        });
    }

    async syncAllModules() {
        console.log('Syncing all modules...');
        
        for (const [name, module] of Object.entries(this.modules)) {
            try {
                if (module.sync) {
                    await module.sync();
                }
            } catch (error) {
                console.error(`Error syncing ${name} module:`, error);
            }
        }
    }

    handleInitializationError(error) {
        // Show user-friendly error message
        const errorMessage = this.createErrorNotification(error);
        document.body.appendChild(errorMessage);

        // Try to initialize in safe mode
        this.initializeSafeMode();
    }

    createErrorNotification(error) {
        const notification = document.createElement('div');
        notification.className = 'backend-error-notification';
        notification.innerHTML = `
            <div class="error-content">
                <h3>Backend Initialization Error</h3>
                <p>Some features may not work properly. Please refresh the page.</p>
                <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4757;
            color: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 300px;
        `;
        
        return notification;
    }

    initializeSafeMode() {
        console.log('Initializing in safe mode...');
        
        // Initialize only critical modules
        const criticalModules = ['analytics', 'preferences'];
        
        criticalModules.forEach(async (moduleName) => {
            try {
                await this.loadModule(moduleName);
                console.log(`Safe mode: ${moduleName} loaded`);
            } catch (error) {
                console.error(`Safe mode: Failed to load ${moduleName}:`, error);
            }
        });
    }

    // Public API Methods
    getModule(name) {
        return this.modules[name];
    }

    isModuleLoaded(name) {
        return !!this.modules[name];
    }

    async reloadModule(name) {
        if (this.modules[name]) {
            delete this.modules[name];
        }
        
        await this.loadModule(name);
        console.log(`Module ${name} reloaded`);
    }

    getModuleStatus() {
        const status = {};
        
        this.initializationOrder.forEach(name => {
            status[name] = {
                loaded: !!this.modules[name],
                error: null // Could track errors here
            };
        });
        
        return status;
    }

    async testAllModules() {
        console.log('Testing all modules...');
        
        const results = {};
        
        for (const [name, module] of Object.entries(this.modules)) {
            try {
                if (module.test) {
                    results[name] = await module.test();
                } else {
                    results[name] = { status: 'ok', message: 'No test method' };
                }
            } catch (error) {
                results[name] = { status: 'error', error: error.message };
            }
        }
        
        console.log('Module test results:', results);
        return results;
    }
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.ShortcutSenseiBackend = ShortcutSenseiBackend;
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.shortcutSenseiBackend = new ShortcutSenseiBackend();
        });
    } else {
        window.shortcutSenseiBackend = new ShortcutSenseiBackend();
    }
}

export default ShortcutSenseiBackend;
