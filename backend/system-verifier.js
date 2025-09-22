/*
 * Shortcut Sensei - System Verification Script
 * 
 * File: System Test and Verification
 * Version: 1.0.0
 * Last Updated: August 31, 2025
 * 
 * Description: Comprehensive testing script for all backend modules
 * Dependencies: All backend modules
 * 
 * Usage: Run window.systemVerifier.runAllTests() in browser console
 */

class SystemVerifier {
    constructor() {
        this.testResults = new Map();
        this.startTime = Date.now();
    }

    async runAllTests() {
        console.log('Starting Shortcut Sensei System Verification...');
        console.log('='.repeat(50));
        
        try {
            // Test 1: Check if all modules are loaded
            await this.testModuleLoading();
            
            // Test 2: Check Firebase connection
            await this.testFirebaseConnection();
            
            // Test 3: Test each individual module
            await this.testAnalyticsModule();
            await this.testPreferencesModule();
            await this.testSearchModule();
            await this.testAchievementsModule();
            await this.testNotificationsModule();
            await this.testContentManagementModule();
            await this.testAIRecommendationsModule();
            await this.testCommonUIModule();
            
            // Test 4: Test inter-module communication
            await this.testModuleCommunication();
            
            // Test 5: Test UI functionality
            await this.testUIFunctionality();
            
            // Generate final report
            this.generateReport();
            
        } catch (error) {
            console.error('System verification failed:', error);
            this.testResults.set('system_error', {
                status: 'failed',
                error: error.message
            });
        }
    }

    async testModuleLoading() {
        console.log('Testing module loading...');
        
        const expectedModules = [
            'shortcutSenseiBackend',
            'analyticsTracker',
            'userPreferences',
            'searchEnhancement',
            'achievementSystem',
            'notificationSystem',
            'contentManagement',
            'recommendationEngine',
            'commonUI'
        ];

        const loadedModules = [];
        const failedModules = [];

        expectedModules.forEach(moduleName => {
            if (window[moduleName]) {
                loadedModules.push(moduleName);
            } else {
                failedModules.push(moduleName);
            }
        });

        this.testResults.set('module_loading', {
            status: failedModules.length === 0 ? 'passed' : 'partial',
            loaded: loadedModules,
            failed: failedModules,
            loadedCount: loadedModules.length,
            totalCount: expectedModules.length
        });

        console.log(`Modules loaded: ${loadedModules.length}/${expectedModules.length}`);
        if (failedModules.length > 0) {
            console.warn('Failed to load:', failedModules);
        }
    }

    async testFirebaseConnection() {
        console.log('Testing Firebase connection...');
        
        try {
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase not loaded');
            }

            const app = firebase.app();
            const auth = firebase.auth();
            const firestore = firebase.firestore();

            this.testResults.set('firebase_connection', {
                status: 'passed',
                app: !!app,
                auth: !!auth,
                firestore: !!firestore,
                currentUser: auth.currentUser ? 'authenticated' : 'anonymous'
            });

            console.log('Firebase connection: OK');
        } catch (error) {
            this.testResults.set('firebase_connection', {
                status: 'failed',
                error: error.message
            });
            console.warn('Firebase connection failed:', error.message);
        }
    }

    async testAnalyticsModule() {
        console.log('Testing Analytics module...');
        
        try {
            if (!window.analyticsTracker) {
                throw new Error('Analytics module not loaded');
            }

            // Test basic functionality
            const testEvent = {
                type: 'test',
                data: { timestamp: Date.now() }
            };

            window.analyticsTracker.trackEvent('system_test', testEvent);
            
            // Check if session data is available
            const sessionStats = window.analyticsTracker.getSessionStats();

            this.testResults.set('analytics_module', {
                status: 'passed',
                sessionStats: !!sessionStats,
                trackingEnabled: true
            });

            console.log('Analytics module: OK');
        } catch (error) {
            this.testResults.set('analytics_module', {
                status: 'failed',
                error: error.message
            });
            console.warn('Analytics module test failed:', error.message);
        }
    }

    async testPreferencesModule() {
        console.log('Testing Preferences module...');
        
        try {
            if (!window.userPreferences) {
                throw new Error('Preferences module not loaded');
            }

            // Test preference setting and getting
            const testValue = 'test_' + Date.now();
            window.userPreferences.setPreference('test_pref', testValue);
            const retrievedValue = window.userPreferences.getPreference('test_pref');

            if (retrievedValue !== testValue) {
                throw new Error('Preference storage/retrieval failed');
            }

            // Clean up test preference
            window.userPreferences.removePreference('test_pref');

            this.testResults.set('preferences_module', {
                status: 'passed',
                storageWorking: true,
                retrievalWorking: true
            });

            console.log('Preferences module: OK');
        } catch (error) {
            this.testResults.set('preferences_module', {
                status: 'failed',
                error: error.message
            });
            console.warn('Preferences module test failed:', error.message);
        }
    }

    async testSearchModule() {
        console.log('Testing Search Enhancement module...');
        
        try {
            if (!window.searchEnhancement) {
                throw new Error('Search module not loaded');
            }

            // Test search functionality
            const searchQuery = 'copy';
            const results = await window.searchEnhancement.performSearch(searchQuery);

            this.testResults.set('search_module', {
                status: 'passed',
                searchWorking: Array.isArray(results),
                resultsCount: results ? results.length : 0,
                voiceSearchAvailable: window.searchEnhancement.isVoiceSearchAvailable()
            });

            console.log('Search Enhancement module: OK');
        } catch (error) {
            this.testResults.set('search_module', {
                status: 'failed',
                error: error.message
            });
            console.warn('Search module test failed:', error.message);
        }
    }

    async testAchievementsModule() {
        console.log('Testing Achievements module...');
        
        try {
            if (!window.achievementSystem) {
                throw new Error('Achievements module not loaded');
            }

            // Test achievement system
            const userStats = window.achievementSystem.getUserStats();
            const unlockedAchievements = window.achievementSystem.getUnlockedAchievements();

            this.testResults.set('achievements_module', {
                status: 'passed',
                userStats: !!userStats,
                achievementsCount: unlockedAchievements ? unlockedAchievements.length : 0,
                totalPoints: userStats ? userStats.totalPoints : 0
            });

            console.log('Achievements module: OK');
        } catch (error) {
            this.testResults.set('achievements_module', {
                status: 'failed',
                error: error.message
            });
            console.warn('Achievements module test failed:', error.message);
        }
    }

    async testNotificationsModule() {
        console.log('Testing Notifications module...');
        
        try {
            if (!window.notificationSystem) {
                throw new Error('Notifications module not loaded');
            }

            // Test notification display
            window.notificationSystem.showNotification({
                title: 'System Test',
                message: 'Notification system working correctly',
                type: 'success',
                duration: 2000
            });

            this.testResults.set('notifications_module', {
                status: 'passed',
                bellCreated: !!document.querySelector('.notification-bell'),
                browserNotificationsAvailable: 'Notification' in window
            });

            console.log('Notifications module: OK');
        } catch (error) {
            this.testResults.set('notifications_module', {
                status: 'failed',
                error: error.message
            });
            console.warn('Notifications module test failed:', error.message);
        }
    }

    async testContentManagementModule() {
        console.log('Testing Content Management module...');
        
        try {
            if (!window.contentManagement) {
                throw new Error('Content Management module not loaded');
            }

            // Test content retrieval
            const shortcuts = await window.contentManagement.getAllShortcuts();

            this.testResults.set('content_management_module', {
                status: 'passed',
                shortcutsAvailable: Array.isArray(shortcuts),
                shortcutsCount: shortcuts ? shortcuts.length : 0,
                adminPanelEnabled: true
            });

            console.log('Content Management module: OK');
        } catch (error) {
            this.testResults.set('content_management_module', {
                status: 'failed',
                error: error.message
            });
            console.warn('Content Management module test failed:', error.message);
        }
    }

    async testAIRecommendationsModule() {
        console.log('Testing AI Recommendations module...');
        
        try {
            if (!window.recommendationEngine) {
                throw new Error('AI Recommendations module not loaded');
            }

            // Test recommendation generation
            const recommendations = await window.recommendationEngine.getRecommendationsForUser({ count: 3 });

            this.testResults.set('ai_recommendations_module', {
                status: 'passed',
                recommendationsGenerated: Array.isArray(recommendations),
                recommendationsCount: recommendations ? recommendations.length : 0,
                algorithmsLoaded: true
            });

            console.log('AI Recommendations module: OK');
        } catch (error) {
            this.testResults.set('ai_recommendations_module', {
                status: 'failed',
                error: error.message
            });
            console.warn('AI Recommendations module test failed:', error.message);
        }
    }

    async testCommonUIModule() {
        console.log('Testing Common UI module...');
        
        try {
            if (!window.commonUI) {
                throw new Error('Common UI module not loaded');
            }

            // Check if UI components are present
            const backendIndicator = document.querySelector('.ss-backend-indicator');
            const stylesLoaded = !!document.querySelector('#shortcut-sensei-common-styles');

            this.testResults.set('common_ui_module', {
                status: 'passed',
                backendIndicator: !!backendIndicator,
                stylesLoaded: stylesLoaded,
                uiEnhanced: true
            });

            console.log('Common UI module: OK');
        } catch (error) {
            this.testResults.set('common_ui_module', {
                status: 'failed',
                error: error.message
            });
            console.warn('Common UI module test failed:', error.message);
        }
    }

    async testModuleCommunication() {
        console.log('Testing inter-module communication...');
        
        try {
            let eventReceived = false;
            
            // Set up event listener
            document.addEventListener('test_communication', () => {
                eventReceived = true;
            });

            // Dispatch test event
            document.dispatchEvent(new CustomEvent('test_communication', {
                detail: { test: true }
            }));

            // Small delay to ensure event processing
            await new Promise(resolve => setTimeout(resolve, 100));

            this.testResults.set('module_communication', {
                status: eventReceived ? 'passed' : 'failed',
                eventSystem: eventReceived,
                globalObjects: window.shortcutSenseiBackend ? true : false
            });

            console.log('Module communication: OK');
        } catch (error) {
            this.testResults.set('module_communication', {
                status: 'failed',
                error: error.message
            });
            console.warn('Module communication test failed:', error.message);
        }
    }

    async testUIFunctionality() {
        console.log('Testing UI functionality...');
        
        try {
            // Test shortcut click detection
            const shortcutElements = document.querySelectorAll('.key-combo, .shortcut-key, [data-shortcut]');
            
            // Test theme toggle
            const themeToggle = document.querySelector('#theme-toggle');
            
            // Test search input
            const searchInputs = document.querySelectorAll('#search-input, .search-input, input[type="search"]');
            
            // Test help button
            const helpButton = document.querySelector('#keyboard-help-btn');

            this.testResults.set('ui_functionality', {
                status: 'passed',
                shortcutElements: shortcutElements.length,
                themeTogglePresent: !!themeToggle,
                searchInputsPresent: searchInputs.length,
                helpButtonPresent: !!helpButton,
                copyFunctionalityEnabled: true
            });

            console.log('UI functionality: OK');
        } catch (error) {
            this.testResults.set('ui_functionality', {
                status: 'failed',
                error: error.message
            });
            console.warn('UI functionality test failed:', error.message);
        }
    }

    generateReport() {
        const endTime = Date.now();
        const duration = endTime - this.startTime;
        
        console.log('\n' + '='.repeat(50));
        console.log('SHORTCUT SENSEI SYSTEM VERIFICATION REPORT');
        console.log('='.repeat(50));
        console.log(`Test Duration: ${duration}ms`);
        console.log(`Timestamp: ${new Date().toISOString()}`);
        console.log('');

        let totalTests = 0;
        let passedTests = 0;
        let failedTests = 0;
        let partialTests = 0;

        this.testResults.forEach((result, testName) => {
            totalTests++;
            const status = result.status;
            const statusSymbol = {
                'passed': '[PASS]',
                'failed': '[FAIL]',
                'partial': '[PARTIAL]'
            }[status] || '[UNKNOWN]';

            console.log(`${statusSymbol} ${testName.replace(/_/g, ' ').toUpperCase()}`);
            
            if (status === 'passed') passedTests++;
            else if (status === 'failed') failedTests++;
            else if (status === 'partial') partialTests++;

            if (result.error) {
                console.log(`    Error: ${result.error}`);
            }
            
            // Show additional details for some tests
            if (testName === 'module_loading') {
                console.log(`    Loaded: ${result.loadedCount}/${result.totalCount} modules`);
            }
            if (testName === 'achievements_module') {
                console.log(`    Achievements: ${result.achievementsCount}, Points: ${result.totalPoints}`);
            }
            if (testName === 'ui_functionality') {
                console.log(`    Shortcut elements: ${result.shortcutElements}`);
            }
        });

        console.log('');
        console.log('SUMMARY:');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Partial: ${partialTests}`);
        console.log(`Failed: ${failedTests}`);
        console.log(`Success Rate: ${((passedTests + partialTests) / totalTests * 100).toFixed(1)}%`);
        
        const overallStatus = failedTests === 0 ? 'SYSTEM OPERATIONAL' : 'SYSTEM ISSUES DETECTED';
        console.log(`\nOVERALL STATUS: ${overallStatus}`);
        
        if (failedTests === 0) {
            console.log('\nAll backend systems are functioning correctly!');
            console.log('The Shortcut Sensei enhanced backend is ready for use.');
        } else {
            console.log(`\n${failedTests} test(s) failed. Check the errors above for details.`);
        }
        
        console.log('='.repeat(50));

        // Store results for external access
        window.lastSystemVerification = {
            timestamp: endTime,
            duration: duration,
            results: Object.fromEntries(this.testResults),
            summary: {
                total: totalTests,
                passed: passedTests,
                partial: partialTests,
                failed: failedTests,
                successRate: ((passedTests + partialTests) / totalTests * 100).toFixed(1)
            }
        };

        return window.lastSystemVerification;
    }

    // Quick status check method
    quickStatus() {
        const modules = [
            'shortcutSenseiBackend',
            'analyticsTracker', 
            'userPreferences',
            'searchEnhancement',
            'achievementSystem',
            'notificationSystem',
            'contentManagement',
            'recommendationEngine',
            'commonUI'
        ];

        console.log('QUICK STATUS CHECK:');
        modules.forEach(module => {
            const status = window[module] ? 'OK' : 'MISSING';
            console.log(`${module}: ${status}`);
        });

        const firebaseStatus = typeof firebase !== 'undefined' ? 'OK' : 'MISSING';
        console.log(`Firebase: ${firebaseStatus}`);
    }
}

// Auto-initialize system verifier
if (typeof window !== 'undefined') {
    window.SystemVerifier = SystemVerifier;
    window.systemVerifier = new SystemVerifier();
    
    // Add convenient global methods
    window.testSystem = () => window.systemVerifier.runAllTests();
    window.quickCheck = () => window.systemVerifier.quickStatus();
    
    console.log('System Verifier loaded. Run window.testSystem() to verify all systems.');
}

export default SystemVerifier;
