// User Preferences Management System
// Handles user settings, themes, favorites without affecting frontend UI

class UserPreferencesManager {
    constructor() {
        this.initializePreferences();
        this.setupPreferenceListeners();
    }

    initializePreferences() {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            this.loadUserPreferences();
        }
    }

    setupPreferenceListeners() {
        // Listen for auth state changes
        if (this.auth) {
            this.auth.onAuthStateChanged((user) => {
                if (user) {
                    this.userId = user.uid;
                    this.loadUserPreferences();
                } else {
                    this.userId = null;
                    this.preferences = this.getDefaultPreferences();
                }
            });
        }

        // Track theme changes
        this.trackThemeChanges();
        
        // Track favorite actions
        this.trackFavoriteActions();
        
        // Track other preference changes
        this.trackPreferenceChanges();
    }

    // Default preferences structure
    getDefaultPreferences() {
        return {
            theme: 'light',
            favoriteApps: [],
            customShortcuts: [],
            difficultyLevel: 'intermediate',
            notifications: true,
            autoSave: true,
            searchHistory: [],
            recentApps: [],
            language: 'en',
            tooltips: true,
            animations: true,
            soundEffects: false,
            privateMode: false,
            dataCollection: true
        };
    }

    // Load user preferences from database
    async loadUserPreferences() {
        if (!this.userId) {
            this.preferences = this.getDefaultPreferences();
            return;
        }

        try {
            const doc = await this.db.collection('user_preferences').doc(this.userId).get();
            
            if (doc.exists) {
                this.preferences = { ...this.getDefaultPreferences(), ...doc.data() };
            } else {
                this.preferences = this.getDefaultPreferences();
                await this.savePreferences();
            }

            // Apply preferences to current session
            this.applyPreferences();
            
        } catch (error) {
            console.error('Error loading user preferences:', error);
            this.preferences = this.getDefaultPreferences();
        }
    }

    // Save preferences to database
    async savePreferences(updates = {}) {
        if (!this.userId) return;

        try {
            // Update local preferences
            this.preferences = { ...this.preferences, ...updates };
            
            // Save to database
            await this.db.collection('user_preferences').doc(this.userId).set({
                ...this.preferences,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            // Apply changes immediately
            this.applyPreferences();
            
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    }

    // Apply preferences to current session
    applyPreferences() {
        if (!this.preferences) return;

        // Apply theme
        this.applyTheme();
        
        // Apply other visual preferences
        this.applyVisualPreferences();
        
        // Trigger custom event for other components
        window.dispatchEvent(new CustomEvent('preferencesUpdated', {
            detail: this.preferences
        }));
    }

    // Theme Management
    applyTheme() {
        const theme = this.preferences.theme || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update theme toggle buttons
        const themeToggles = document.querySelectorAll('.theme-toggle, .dark-mode-toggle');
        themeToggles.forEach(toggle => {
            if (theme === 'dark') {
                toggle.classList.add('active');
                toggle.innerHTML = 'Light'; // Sun icon for light mode
            } else {
                toggle.classList.remove('active');
                toggle.innerHTML = 'Dark'; // Moon icon for dark mode
            }
        });
    }

    toggleTheme() {
        const newTheme = this.preferences.theme === 'light' ? 'dark' : 'light';
        this.savePreferences({ theme: newTheme });
        
        // Track theme change
        if (window.analyticsManager) {
            window.analyticsManager.trackFeatureUse('theme_toggle');
        }
    }

    trackThemeChanges() {
        // Listen for theme toggle clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.theme-toggle, .dark-mode-toggle')) {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    // Favorites Management
    addToFavorites(appName) {
        if (!this.preferences.favoriteApps.includes(appName)) {
            const updatedFavorites = [...this.preferences.favoriteApps, appName];
            this.savePreferences({ favoriteApps: updatedFavorites });
            
            // Show feedback (without changing UI)
            this.showPreferenceUpdateFeedback(`${appName} added to favorites`);
        }
    }

    removeFromFavorites(appName) {
        const updatedFavorites = this.preferences.favoriteApps.filter(app => app !== appName);
        this.savePreferences({ favoriteApps: updatedFavorites });
        
        this.showPreferenceUpdateFeedback(`${appName} removed from favorites`);
    }

    isFavorite(appName) {
        return this.preferences.favoriteApps.includes(appName);
    }

    trackFavoriteActions() {
        // Track favorite button clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.favorite-btn, .bookmark-btn, .star-btn')) {
                const appName = this.getAppNameFromElement(e.target);
                
                if (this.isFavorite(appName)) {
                    this.removeFromFavorites(appName);
                } else {
                    this.addToFavorites(appName);
                }
                
                // Update button appearance
                this.updateFavoriteButton(e.target, this.isFavorite(appName));
            }
        });
    }

    updateFavoriteButton(button, isFavorite) {
        if (isFavorite) {
            button.classList.add('favorited');
            button.innerHTML = 'Fav'; // Filled heart
        } else {
            button.classList.remove('favorited');
            button.innerHTML = '🤍'; // Empty heart
        }
    }

    // Recent Apps Tracking
    addToRecentApps(appName) {
        let recentApps = [...this.preferences.recentApps];
        
        // Remove if already exists
        recentApps = recentApps.filter(app => app !== appName);
        
        // Add to beginning
        recentApps.unshift(appName);
        
        // Keep only last 10
        recentApps = recentApps.slice(0, 10);
        
        this.savePreferences({ recentApps });
    }

    // Search History Management
    addToSearchHistory(query) {
        if (!query || query.length < 2) return;
        
        let searchHistory = [...this.preferences.searchHistory];
        
        // Remove if already exists
        searchHistory = searchHistory.filter(search => search !== query);
        
        // Add to beginning
        searchHistory.unshift(query);
        
        // Keep only last 20 searches
        searchHistory = searchHistory.slice(0, 20);
        
        this.savePreferences({ searchHistory });
    }

    // Custom Shortcuts Management
    addCustomShortcut(shortcut) {
        const customShortcuts = [...this.preferences.customShortcuts, {
            ...shortcut,
            id: Date.now(),
            createdAt: new Date().toISOString()
        }];
        
        this.savePreferences({ customShortcuts });
    }

    removeCustomShortcut(shortcutId) {
        const customShortcuts = this.preferences.customShortcuts.filter(
            shortcut => shortcut.id !== shortcutId
        );
        
        this.savePreferences({ customShortcuts });
    }

    // Difficulty Level Management
    setDifficultyLevel(level) {
        if (['beginner', 'intermediate', 'advanced'].includes(level)) {
            this.savePreferences({ difficultyLevel: level });
            this.applyDifficultyFilter();
        }
    }

    applyDifficultyFilter() {
        const level = this.preferences.difficultyLevel;
        const shortcuts = document.querySelectorAll('[data-difficulty]');
        
        shortcuts.forEach(shortcut => {
            const shortcutDifficulty = shortcut.dataset.difficulty;
            
            // Show/hide based on difficulty preference
            if (level === 'beginner' && shortcutDifficulty === 'advanced') {
                shortcut.style.opacity = '0.5';
            } else if (level === 'advanced' && shortcutDifficulty === 'beginner') {
                shortcut.style.opacity = '0.7';
            } else {
                shortcut.style.opacity = '1';
            }
        });
    }

    // Visual Preferences
    applyVisualPreferences() {
        // Apply animations preference
        if (!this.preferences.animations) {
            document.documentElement.style.setProperty('--animation-duration', '0s');
        } else {
            document.documentElement.style.removeProperty('--animation-duration');
        }
        
        // Apply tooltips preference
        if (!this.preferences.tooltips) {
            document.documentElement.classList.add('no-tooltips');
        } else {
            document.documentElement.classList.remove('no-tooltips');
        }
    }

    // Preference Change Tracking
    trackPreferenceChanges() {
        // Track difficulty level changes
        document.addEventListener('change', (e) => {
            if (e.target.matches('.difficulty-selector')) {
                this.setDifficultyLevel(e.target.value);
            }
        });

        // Track other preference toggles
        document.addEventListener('change', (e) => {
            if (e.target.matches('.preference-toggle')) {
                const preference = e.target.dataset.preference;
                const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                
                this.savePreferences({ [preference]: value });
            }
        });
    }

    // Utility Methods
    getAppNameFromElement(element) {
        // Try to get app name from various attributes or context
        return element.dataset.app || 
               element.closest('[data-app]')?.dataset.app ||
               window.analyticsManager?.getAppNameFromPage() ||
               'Unknown';
    }

    showPreferenceUpdateFeedback(message) {
        // Show subtle feedback without disrupting UI
        if (window.ShortcutSenseiGlobal?.prototype.showGlobalNotification) {
            new window.ShortcutSenseiGlobal().showGlobalNotification(message, 'success');
        }
    }

    // Export/Import Preferences
    async exportPreferences() {
        const exportData = {
            preferences: this.preferences,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'shortcut-sensei-preferences.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }

    async importPreferences(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (data.preferences) {
                await this.savePreferences(data.preferences);
                this.showPreferenceUpdateFeedback('Preferences imported successfully');
            }
        } catch (error) {
            console.error('Error importing preferences:', error);
            this.showPreferenceUpdateFeedback('Error importing preferences');
        }
    }

    // API Methods for external use
    getPreferences() {
        return { ...this.preferences };
    }

    getPreference(key) {
        return this.preferences[key];
    }

    setPreference(key, value) {
        this.savePreferences({ [key]: value });
    }

    // Bulk preference update
    updatePreferences(updates) {
        this.savePreferences(updates);
    }
}

// Initialize User Preferences Manager
if (typeof window !== 'undefined') {
    window.UserPreferencesManager = UserPreferencesManager;
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.userPreferencesManager = new UserPreferencesManager();
        });
    } else {
        window.userPreferencesManager = new UserPreferencesManager();
    }
}

export default UserPreferencesManager;
