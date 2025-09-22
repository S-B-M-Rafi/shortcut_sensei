/**
 * Gamification Integration System
 * Coordinates all gamification features and ensures they work together seamlessly
 */

class GamificationIntegration {
    constructor() {
        this.initialized = false;
        this.systems = {};
        this.eventHandlers = {};
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    async init() {
        try {
            console.log('🎮 Initializing Gamification Integration...');
            
            // Initialize all systems
            await this.initializeSystems();
            
            // Set up cross-system communication
            this.setupEventHandlers();
            
            // Initialize UI components
            this.initializeUI();
            
            // Load saved data
            this.loadSavedData();
            
            // Set up periodic updates
            this.setupPeriodicUpdates();
            
            this.initialized = true;
            console.log('✅ Gamification Integration initialized successfully!');
            
            // Fire initialization complete event
            this.dispatchEvent('gamificationReady', {
                systems: Object.keys(this.systems),
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('❌ Error initializing gamification integration:', error);
        }
    }

    async initializeSystems() {
        // Initialize Progress Tracker first (other systems depend on it)
        if (typeof ProgressTracker !== 'undefined') {
            this.systems.progressTracker = new ProgressTracker();
            console.log('✅ Progress Tracker initialized');
        }

        // Initialize Streak System
        if (typeof StreakSystem !== 'undefined') {
            this.systems.streakSystem = new StreakSystem();
            console.log('✅ Streak System initialized');
        }

        // Initialize Badge System
        if (typeof BadgeSystem !== 'undefined') {
            this.systems.badgeSystem = new BadgeSystem();
            console.log('✅ Badge System initialized');
        }

        // Initialize Shortcut of the Day System
        if (typeof ShortcutOfTheDaySystem !== 'undefined') {
            this.systems.shortcutOfTheDay = new ShortcutOfTheDaySystem();
            console.log('✅ Shortcut of the Day System initialized');
        }

        // Wait a bit for all systems to fully initialize
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    setupEventHandlers() {
        // Handle shortcut learning
        document.addEventListener('shortcutLearned', (event) => {
            const { shortcut, source } = event.detail;
            
            // Update progress tracker
            if (this.systems.progressTracker) {
                this.systems.progressTracker.learnShortcut(shortcut.application, shortcut.difficulty);
            }
            
            // Update streak system
            if (this.systems.streakSystem) {
                this.systems.streakSystem.recordActivity('shortcut_learned');
            }
            
            console.log(`📚 Shortcut learned: ${shortcut.name} (${shortcut.application})`);
        });

        // Handle quiz completion
        document.addEventListener('quizCompleted', (event) => {
            const { score, totalQuestions, application } = event.detail;
            
            // Update progress tracker
            if (this.systems.progressTracker) {
                this.systems.progressTracker.completeQuiz(score, totalQuestions, application);
            }
            
            // Update streak system
            if (this.systems.streakSystem) {
                this.systems.streakSystem.recordActivity('quiz_completed');
            }
            
            console.log(`🎯 Quiz completed: ${score}/${totalQuestions} in ${application}`);
        });

        // Handle badge unlocks
        document.addEventListener('badgeUnlocked', (event) => {
            const { badge } = event.detail;
            
            // Update progress tracker with XP reward
            if (this.systems.progressTracker && badge.xpReward) {
                this.systems.progressTracker.handleBadgeUnlocked(badge);
            }
            
            // Show notification
            this.showBadgeNotification(badge);
            
            console.log(`🏆 Badge unlocked: ${badge.name}`);
        });

        // Handle level up
        document.addEventListener('levelUp', (event) => {
            const { newLevel, xpRequired } = event.detail;
            
            // Show level up notification
            this.showLevelUpNotification(newLevel);
            
            // Check for level-based badges
            if (this.systems.badgeSystem) {
                this.systems.badgeSystem.updateProgress('level', newLevel);
            }
            
            console.log(`⬆️ Level up! Now level ${newLevel}`);
        });

        // Handle streak milestones
        document.addEventListener('streakMilestone', (event) => {
            const { streakType, days } = event.detail;
            
            // Update badge system
            if (this.systems.badgeSystem) {
                this.systems.badgeSystem.updateProgress(`${streakType}_streak`, days);
            }
            
            console.log(`🔥 Streak milestone: ${days} days of ${streakType}`);
        });

        // Handle daily goal completion
        document.addEventListener('dailyGoalComplete', (event) => {
            const { goalType } = event.detail;
            
            // Update badge system
            if (this.systems.badgeSystem) {
                this.systems.badgeSystem.updateProgress('daily_goals_completed', 1);
            }
            
            console.log(`✅ Daily goal completed: ${goalType}`);
        });
    }

    initializeUI() {
        // Create notification container if it doesn't exist
        if (!document.getElementById('gamification-notifications')) {
            const notificationContainer = document.createElement('div');
            notificationContainer.id = 'gamification-notifications';
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }

        // Initialize shortcut of the day display
        this.initializeShortcutOfTheDay();

        // Initialize stats widgets
        this.initializeStatsWidgets();

        // Initialize badge display
        this.initializeBadgeDisplay();
    }

    initializeShortcutOfTheDay() {
        const container = document.getElementById('shortcut-of-the-day');
        if (container && this.systems.shortcutOfTheDay) {
            this.systems.shortcutOfTheDay.displayTodaysShortcut();
        }
    }

    initializeStatsWidgets() {
        // Update level widget
        const levelWidget = document.getElementById('user-level');
        if (levelWidget && this.systems.progressTracker) {
            const stats = this.systems.progressTracker.getStats();
            levelWidget.textContent = `Level ${stats.level}`;
        }

        // Update XP widget
        const xpWidget = document.getElementById('user-xp');
        if (xpWidget && this.systems.progressTracker) {
            const stats = this.systems.progressTracker.getStats();
            xpWidget.textContent = `${stats.experience} XP`;
        }

        // Update streak widget
        const streakWidget = document.getElementById('current-streak');
        if (streakWidget && this.systems.streakSystem) {
            const streaks = this.systems.streakSystem.getStreaks();
            const maxStreak = Math.max(streaks.daily, streaks.learning, streaks.quiz);
            streakWidget.textContent = `${maxStreak} day streak`;
        }
    }

    initializeBadgeDisplay() {
        const badgeContainer = document.getElementById('recent-badges');
        if (badgeContainer && this.systems.badgeSystem) {
            this.systems.badgeSystem.displayRecentBadges(badgeContainer);
        }
    }

    loadSavedData() {
        // All systems handle their own data loading
        // This method can be used for cross-system data synchronization
        
        // Sync any cross-system dependencies
        if (this.systems.badgeSystem && this.systems.progressTracker) {
            const stats = this.systems.progressTracker.getStats();
            this.systems.badgeSystem.updateProgress('level', stats.level);
            this.systems.badgeSystem.updateProgress('total_xp', stats.experience);
        }
    }

    setupPeriodicUpdates() {
        // Update UI every minute
        setInterval(() => {
            this.updateUI();
        }, 60000);

        // Check for daily reset every hour
        setInterval(() => {
            this.checkDailyReset();
        }, 3600000);
    }

    updateUI() {
        this.initializeStatsWidgets();
        
        // Update any time-sensitive elements
        if (this.systems.shortcutOfTheDay) {
            this.systems.shortcutOfTheDay.updateTimeRemaining();
        }
    }

    checkDailyReset() {
        if (this.systems.streakSystem) {
            this.systems.streakSystem.checkStreakStatus();
        }
        
        if (this.systems.shortcutOfTheDay) {
            this.systems.shortcutOfTheDay.checkForNewDay();
        }
    }

    showBadgeNotification(badge) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification badge-unlock';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">🏆</div>
                <div class="notification-text">
                    <div class="notification-title">Badge Unlocked!</div>
                    <div class="notification-subtitle">${badge.name}</div>
                    <div class="notification-description">${badge.description}</div>
                    ${badge.xpReward ? `<div class="notification-reward">+${badge.xpReward} XP</div>` : ''}
                </div>
            </div>
        `;

        this.showNotification(notification);
    }

    showLevelUpNotification(newLevel) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification level-up';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">⬆️</div>
                <div class="notification-text">
                    <div class="notification-title">Level Up!</div>
                    <div class="notification-subtitle">You reached Level ${newLevel}</div>
                    <div class="notification-description">Keep learning to unlock more features!</div>
                </div>
            </div>
        `;

        this.showNotification(notification);
    }

    showNotification(notification) {
        const container = document.getElementById('gamification-notifications');
        if (!container) return;

        container.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    // Public API methods
    getSystemStats() {
        const stats = {};
        
        if (this.systems.progressTracker) {
            stats.progress = this.systems.progressTracker.getStats();
        }
        
        if (this.systems.badgeSystem) {
            stats.badges = this.systems.badgeSystem.getUnlockedBadges();
        }
        
        if (this.systems.streakSystem) {
            stats.streaks = this.systems.streakSystem.getStreaks();
        }
        
        return stats;
    }

    recordShortcutLearned(shortcut) {
        this.dispatchEvent('shortcutLearned', { shortcut, source: 'manual' });
    }

    recordQuizCompleted(score, totalQuestions, application) {
        this.dispatchEvent('quizCompleted', { score, totalQuestions, application });
    }

    getSystem(systemName) {
        return this.systems[systemName];
    }

    isReady() {
        return this.initialized;
    }
}

// Global instance
window.GamificationIntegration = GamificationIntegration;

// Auto-initialize if not in a module environment
if (typeof module === 'undefined') {
    window.gamificationIntegration = new GamificationIntegration();
}
