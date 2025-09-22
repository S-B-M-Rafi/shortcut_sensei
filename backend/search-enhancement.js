// Search Enhancement and Analytics System
// Improves search functionality with analytics, suggestions, and optimization

class SearchEnhancementManager {
    constructor() {
        this.initializeSearchEnhancement();
        this.searchSuggestions = new Map();
        this.popularSearches = [];
        this.searchHistory = [];
        this.setupSearchListeners();
    }

    initializeSearchEnhancement() {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            this.loadSearchData();
        }
    }

    async loadSearchData() {
        try {
            // Load popular searches
            await this.loadPopularSearches();
            
            // Load search suggestions
            await this.loadSearchSuggestions();
            
            // Initialize search index
            await this.buildSearchIndex();
            
        } catch (error) {
            console.error('Error loading search data:', error);
        }
    }

    setupSearchListeners() {
        // Enhanced search input handling
        this.setupAdvancedSearchInput();
        
        // Search suggestion dropdown
        this.setupSearchSuggestions();
        
        // Search result optimization
        this.setupSearchResultTracking();
        
        // Voice search support
        this.setupVoiceSearch();
    }

    // Advanced Search Input
    setupAdvancedSearchInput() {
        const searchInputs = document.querySelectorAll('input[type="text"], input[type="search"], .search-input');
        
        searchInputs.forEach(input => {
            // Add search enhancement wrapper
            this.enhanceSearchInput(input);
            
            // Debounced search with suggestions
            let searchTimeout;
            input.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (e.target.value.length > 0) {
                        this.handleSearchInput(e.target.value, e.target);
                    } else {
                        this.hideSuggestions(e.target);
                    }
                }, 150); // Faster response than analytics
            });

            // Handle search submission
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                    e.preventDefault();
                    this.performEnhancedSearch(e.target.value.trim(), e.target);
                }
            });

            // Handle arrow key navigation in suggestions
            input.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    this.navigateSuggestions(e.target, e.key === 'ArrowDown');
                    e.preventDefault();
                }
            });
        });
    }

    enhanceSearchInput(input) {
        // Create suggestion container if it doesn't exist
        let suggestionContainer = input.parentNode.querySelector('.search-suggestions');
        if (!suggestionContainer) {
            suggestionContainer = document.createElement('div');
            suggestionContainer.className = 'search-suggestions';
            suggestionContainer.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid #ddd;
                border-top: none;
                border-radius: 0 0 8px 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
                max-height: 300px;
                overflow-y: auto;
                display: none;
            `;
            
            // Ensure parent has relative positioning
            if (getComputedStyle(input.parentNode).position === 'static') {
                input.parentNode.style.position = 'relative';
            }
            
            input.parentNode.appendChild(suggestionContainer);
        }

        // Add search enhancement indicators
        this.addSearchIndicators(input);
    }

    addSearchIndicators(input) {
        // Add search type indicator
        const indicator = document.createElement('div');
        indicator.className = 'search-type-indicator';
        indicator.style.cssText = `
            position: absolute;
            right: 40px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 12px;
            color: #666;
            pointer-events: none;
        `;
        indicator.textContent = 'Smart Search';
        
        if (input.parentNode.style.position !== 'absolute' && input.parentNode.style.position !== 'relative') {
            input.parentNode.style.position = 'relative';
        }
        input.parentNode.appendChild(indicator);
    }

    // Handle Search Input with Intelligence
    async handleSearchInput(query, inputElement) {
        const suggestions = await this.generateSuggestions(query);
        this.showSuggestions(inputElement, suggestions);
        
        // Track search input for analytics
        this.trackSearchInput(query);
    }

    // Generate Smart Suggestions
    async generateSuggestions(query) {
        const normalizedQuery = query.toLowerCase().trim();
        const suggestions = [];

        // 1. App name suggestions
        const appSuggestions = this.getAppSuggestions(normalizedQuery);
        suggestions.push(...appSuggestions);

        // 2. Shortcut suggestions
        const shortcutSuggestions = this.getShortcutSuggestions(normalizedQuery);
        suggestions.push(...shortcutSuggestions);

        // 3. Popular search suggestions
        const popularSuggestions = this.getPopularSearchSuggestions(normalizedQuery);
        suggestions.push(...popularSuggestions);

        // 4. Recent search suggestions
        const recentSuggestions = this.getRecentSearchSuggestions(normalizedQuery);
        suggestions.push(...recentSuggestions);

        // Remove duplicates and limit results
        const uniqueSuggestions = Array.from(new Set(suggestions.map(s => s.text)))
            .slice(0, 8)
            .map(text => ({ text, type: 'suggestion' }));

        return uniqueSuggestions;
    }

    getAppSuggestions(query) {
        const apps = [
            'Chrome', 'Firefox', 'Edge', 'Safari',
            'Excel', 'Word', 'PowerPoint', 'Outlook',
            'Photoshop', 'Illustrator', 'Creative Cloud',
            'Discord', 'Slack', 'Teams', 'Zoom',
            'Spotify', 'VLC', 'Audacity',
            'Visual Studio', 'VSCode', 'Sublime Text'
        ];

        return apps
            .filter(app => app.toLowerCase().includes(query))
            .map(app => ({ text: app, type: 'app' }))
            .slice(0, 3);
    }

    getShortcutSuggestions(query) {
        const shortcuts = [
            'copy', 'paste', 'cut', 'undo', 'redo',
            'save', 'open', 'new', 'close', 'quit',
            'find', 'replace', 'select all',
            'bold', 'italic', 'underline',
            'zoom in', 'zoom out', 'full screen'
        ];

        return shortcuts
            .filter(shortcut => shortcut.includes(query))
            .map(shortcut => ({ text: shortcut, type: 'shortcut' }))
            .slice(0, 3);
    }

    getPopularSearchSuggestions(query) {
        return this.popularSearches
            .filter(search => search.toLowerCase().includes(query))
            .map(search => ({ text: search, type: 'popular' }))
            .slice(0, 2);
    }

    getRecentSearchSuggestions(query) {
        const userPrefs = window.userPreferencesManager?.getPreferences();
        const recentSearches = userPrefs?.searchHistory || [];
        
        return recentSearches
            .filter(search => search.toLowerCase().includes(query))
            .map(search => ({ text: search, type: 'recent' }))
            .slice(0, 2);
    }

    // Show Suggestions Dropdown
    showSuggestions(inputElement, suggestions) {
        const container = inputElement.parentNode.querySelector('.search-suggestions');
        if (!container) return;

        if (suggestions.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.innerHTML = '';
        suggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.style.cssText = `
                padding: 12px 16px;
                cursor: pointer;
                border-bottom: 1px solid #f0f0f0;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: background-color 0.2s;
            `;

            // Add type icon
            const icon = this.getSuggestionIcon(suggestion.type);
            item.innerHTML = `
                <span style="color: #666; font-size: 14px;">${icon}</span>
                <span style="flex: 1;">${suggestion.text}</span>
                <span style="color: #999; font-size: 12px;">${suggestion.type}</span>
            `;

            // Add hover effect
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#f8f9fa';
            });

            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'white';
            });

            // Handle suggestion click
            item.addEventListener('click', () => {
                inputElement.value = suggestion.text;
                this.performEnhancedSearch(suggestion.text, inputElement);
                container.style.display = 'none';
            });

            container.appendChild(item);
        });

        container.style.display = 'block';
    }

    getSuggestionIcon(type) {
        const icons = {
            'app': 'app',
            'shortcut': 'keyboard',
            'popular': 'fire',
            'recent': 'clock',
            'suggestion': 'lightbulb'
        };
        return icons[type] || 'search';
    }

    hideSuggestions(inputElement) {
        const container = inputElement.parentNode.querySelector('.search-suggestions');
        if (container) {
            container.style.display = 'none';
        }
    }

    // Enhanced Search Performance
    async performEnhancedSearch(query, inputElement) {
        const startTime = performance.now();
        
        // Normalize query
        const normalizedQuery = query.toLowerCase().trim();
        
        // Add to search history
        this.addToSearchHistory(query);
        
        // Perform the actual search
        const results = await this.executeSearch(normalizedQuery);
        
        // Track search performance
        const searchTime = performance.now() - startTime;
        this.trackSearchPerformance(query, results.length, searchTime);
        
        // Handle search results
        this.handleSearchResults(query, results, inputElement);
        
        // Hide suggestions
        this.hideSuggestions(inputElement);
    }

    async executeSearch(query) {
        const results = [];
        
        // Search in applications
        const appResults = this.searchApplications(query);
        results.push(...appResults);
        
        // Search in shortcuts (if on shortcut pages)
        const shortcutResults = this.searchShortcuts(query);
        results.push(...shortcutResults);
        
        // Search in content
        const contentResults = this.searchContent(query);
        results.push(...contentResults);
        
        return results;
    }

    searchApplications(query) {
        const appMapping = {
            'chrome': 'Google Chrome.html',
            'google chrome': 'Google Chrome.html',
            'firefox': 'Mozilla Firefox.html',
            'edge': 'Microsoft Edge.html',
            'excel': 'Microsoft Excell.htm',
            'word': 'Microsoft Word.htm',
            'powerpoint': 'Microsoft PowerPoint.htm',
            'outlook': 'Microsoft Outlook.html',
            'teams': 'Microsoft Teams.html',
            'discord': 'Discord.html',
            'spotify': 'Spotify.html',
            'photoshop': 'Adobe PhotoShop.html',
            'visual studio': 'Visual Studio.html',
            'vlc': 'VLC Media Player.html'
        };

        const results = [];
        Object.entries(appMapping).forEach(([name, file]) => {
            if (name.includes(query) || query.includes(name)) {
                results.push({
                    type: 'app',
                    title: name,
                    url: file,
                    relevance: this.calculateRelevance(query, name)
                });
            }
        });

        return results.sort((a, b) => b.relevance - a.relevance);
    }

    searchShortcuts(query) {
        const shortcuts = document.querySelectorAll('.key-combo, .shortcut-key, [data-shortcut]');
        const results = [];

        shortcuts.forEach(shortcut => {
            const text = shortcut.textContent.toLowerCase();
            const description = shortcut.closest('tr')?.querySelector('td:last-child')?.textContent?.toLowerCase() || '';
            
            if (text.includes(query) || description.includes(query)) {
                results.push({
                    type: 'shortcut',
                    title: shortcut.textContent,
                    description: description,
                    element: shortcut,
                    relevance: this.calculateRelevance(query, text + ' ' + description)
                });
            }
        });

        return results.sort((a, b) => b.relevance - a.relevance);
    }

    searchContent(query) {
        const contentElements = document.querySelectorAll('h1, h2, h3, p, td');
        const results = [];

        contentElements.forEach(element => {
            const text = element.textContent.toLowerCase();
            
            if (text.includes(query)) {
                results.push({
                    type: 'content',
                    title: element.textContent.substring(0, 50) + '...',
                    element: element,
                    relevance: this.calculateRelevance(query, text)
                });
            }
        });

        return results.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
    }

    calculateRelevance(query, text) {
        // Simple relevance scoring
        const exactMatch = text === query ? 100 : 0;
        const startsWith = text.startsWith(query) ? 50 : 0;
        const includes = text.includes(query) ? 25 : 0;
        const wordMatch = text.split(' ').some(word => word === query) ? 75 : 0;
        
        return exactMatch + startsWith + includes + wordMatch;
    }

    handleSearchResults(query, results, inputElement) {
        if (results.length === 0) {
            this.handleNoResults(query);
            return;
        }

        // Navigate to best result for app searches
        const appResult = results.find(r => r.type === 'app');
        if (appResult) {
            window.location.href = appResult.url;
            return;
        }

        // Highlight shortcut results on current page
        const shortcutResults = results.filter(r => r.type === 'shortcut');
        if (shortcutResults.length > 0) {
            this.highlightSearchResults(shortcutResults);
        }

        // Show search results summary
        this.showSearchResultsSummary(query, results);
    }

    highlightSearchResults(results) {
        // Clear previous highlights
        this.clearHighlights();

        results.forEach(result => {
            if (result.element) {
                result.element.style.backgroundColor = '#ffeb3b';
                result.element.style.transition = 'background-color 0.3s';
                result.element.classList.add('search-highlight');
            }
        });

        // Scroll to first result
        if (results[0]?.element) {
            results[0].element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Clear highlights after 5 seconds
        setTimeout(() => this.clearHighlights(), 5000);
    }

    clearHighlights() {
        const highlighted = document.querySelectorAll('.search-highlight');
        highlighted.forEach(element => {
            element.style.backgroundColor = '';
            element.classList.remove('search-highlight');
        });
    }

    showSearchResultsSummary(query, results) {
        const message = `Found ${results.length} results for "${query}"`;
        if (window.ShortcutSenseiGlobal?.prototype.showGlobalNotification) {
            new window.ShortcutSenseiGlobal().showGlobalNotification(message, 'info');
        }
    }

    handleNoResults(query) {
        const message = `No results found for "${query}". Try a different search term.`;
        if (window.ShortcutSenseiGlobal?.prototype.showGlobalNotification) {
            new window.ShortcutSenseiGlobal().showGlobalNotification(message, 'error');
        }
    }

    // Voice Search Support
    setupVoiceSearch() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            this.addVoiceSearchButtons();
        }
    }

    addVoiceSearchButtons() {
        const searchInputs = document.querySelectorAll('input[type="text"], input[type="search"], .search-input');
        
        searchInputs.forEach(input => {
            // Add voice search button
            const voiceButton = document.createElement('button');
            voiceButton.innerHTML = 'Mic';
            voiceButton.type = 'button';
            voiceButton.className = 'voice-search-btn';
            voiceButton.style.cssText = `
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                font-size: 16px;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
            `;

            voiceButton.addEventListener('click', () => {
                this.startVoiceSearch(input);
            });

            if (input.parentNode.style.position !== 'absolute' && input.parentNode.style.position !== 'relative') {
                input.parentNode.style.position = 'relative';
            }
            input.parentNode.appendChild(voiceButton);
        });
    }

    startVoiceSearch(inputElement) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            inputElement.placeholder = 'Listening...';
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            inputElement.value = transcript;
            this.performEnhancedSearch(transcript, inputElement);
        };

        recognition.onerror = (event) => {
            console.error('Voice search error:', event.error);
            inputElement.placeholder = 'Voice search failed';
        };

        recognition.onend = () => {
            inputElement.placeholder = 'Search...';
        };

        recognition.start();
    }

    // Analytics and Tracking
    trackSearchInput(query) {
        // Track search input for suggestion improvement
        if (window.analyticsManager) {
            window.analyticsManager.trackSearch(query, 'enhanced_input');
        }
    }

    trackSearchPerformance(query, resultCount, searchTime) {
        // Track search performance metrics
        if (this.db) {
            this.db.collection('search_performance').add({
                query: query,
                resultCount: resultCount,
                searchTime: searchTime,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userId: this.auth.currentUser?.uid || 'anonymous'
            }).catch(console.error);
        }
    }

    addToSearchHistory(query) {
        this.searchHistory.unshift(query);
        this.searchHistory = [...new Set(this.searchHistory)].slice(0, 20);
        
        // Update user preferences
        if (window.userPreferencesManager) {
            window.userPreferencesManager.addToSearchHistory(query);
        }
    }

    async loadPopularSearches() {
        try {
            const snapshot = await this.db.collection('search_analytics')
                .orderBy('timestamp', 'desc')
                .limit(1000)
                .get();

            const searchCounts = {};
            snapshot.forEach(doc => {
                const query = doc.data().query;
                searchCounts[query] = (searchCounts[query] || 0) + 1;
            });

            this.popularSearches = Object.entries(searchCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 20)
                .map(([query]) => query);

        } catch (error) {
            console.error('Error loading popular searches:', error);
        }
    }

    async loadSearchSuggestions() {
        // Load and cache search suggestions for better performance
        // This could be enhanced with external APIs or ML models
    }

    async buildSearchIndex() {
        // Build searchable index for faster queries
        // This could use libraries like Fuse.js for better search
    }
}

// Initialize Search Enhancement Manager
if (typeof window !== 'undefined') {
    window.SearchEnhancementManager = SearchEnhancementManager;
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.searchEnhancementManager = new SearchEnhancementManager();
        });
    } else {
        window.searchEnhancementManager = new SearchEnhancementManager();
    }
}

export default SearchEnhancementManager;
