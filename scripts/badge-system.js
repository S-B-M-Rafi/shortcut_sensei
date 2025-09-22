// Badge System for Shortcut Sensei
class BadgeSystem {
    constructor() {
        this.badges = this.initializeBadges();
        this.userBadges = this.loadUserBadges();
        this.badgeProgress = this.loadBadgeProgress();
        this.storageKey = 'shortcut_sensei_badges';
        this.progressKey = 'shortcut_sensei_badge_progress';
    }

    initializeBadges() {
        return {
            // Learning Badges
            'first_steps': {
                id: 'first_steps',
                name: 'First Steps',
                description: 'Complete your first tutorial',
                icon: '👶',
                category: 'learning',
                difficulty: 'bronze',
                condition: { type: 'tutorials_completed', target: 1 },
                xpReward: 50
            },
            'knowledge_seeker': {
                id: 'knowledge_seeker',
                name: 'Knowledge Seeker',
                description: 'Complete 5 tutorials',
                icon: '📚',
                category: 'learning',
                difficulty: 'silver',
                condition: { type: 'tutorials_completed', target: 5 },
                xpReward: 150
            },
            'tutorial_master': {
                id: 'tutorial_master',
                name: 'Tutorial Master',
                description: 'Complete all available tutorials',
                icon: '🎓',
                category: 'learning',
                difficulty: 'gold',
                condition: { type: 'tutorials_completed', target: 10 },
                xpReward: 500
            },

            // Shortcut Learning Badges
            'shortcut_novice': {
                id: 'shortcut_novice',
                name: 'Shortcut Novice',
                description: 'Learn your first 5 shortcuts',
                icon: '⌨️',
                category: 'shortcuts',
                difficulty: 'bronze',
                condition: { type: 'shortcuts_learned', target: 5 },
                xpReward: 100
            },
            'shortcut_apprentice': {
                id: 'shortcut_apprentice',
                name: 'Shortcut Apprentice',
                description: 'Learn 25 shortcuts',
                icon: '🔑',
                category: 'shortcuts',
                difficulty: 'silver',
                condition: { type: 'shortcuts_learned', target: 25 },
                xpReward: 250
            },
            'shortcut_expert': {
                id: 'shortcut_expert',
                name: 'Shortcut Expert',
                description: 'Learn 50 shortcuts',
                icon: '⚡',
                category: 'shortcuts',
                difficulty: 'gold',
                condition: { type: 'shortcuts_learned', target: 50 },
                xpReward: 500
            },
            'shortcut_sensei': {
                id: 'shortcut_sensei',
                name: 'Shortcut Sensei',
                description: 'Master 100 shortcuts',
                icon: '🥷',
                category: 'shortcuts',
                difficulty: 'platinum',
                condition: { type: 'shortcuts_learned', target: 100 },
                xpReward: 1000
            },

            // Quiz Badges
            'quiz_starter': {
                id: 'quiz_starter',
                name: 'Quiz Starter',
                description: 'Complete your first quiz',
                icon: '🎯',
                category: 'quizzes',
                difficulty: 'bronze',
                condition: { type: 'quizzes_completed', target: 1 },
                xpReward: 75
            },
            'quiz_champion': {
                id: 'quiz_champion',
                name: 'Quiz Champion',
                description: 'Complete 10 quizzes',
                icon: '🏆',
                category: 'quizzes',
                difficulty: 'silver',
                condition: { type: 'quizzes_completed', target: 10 },
                xpReward: 300
            },
            'perfect_score': {
                id: 'perfect_score',
                name: 'Perfect Score',
                description: 'Get 100% on any quiz',
                icon: '💯',
                category: 'quizzes',
                difficulty: 'gold',
                condition: { type: 'perfect_quiz_score', target: 1 },
                xpReward: 200
            },
            'quiz_perfectionist': {
                id: 'quiz_perfectionist',
                name: 'Quiz Perfectionist',
                description: 'Get perfect scores on 5 quizzes',
                icon: '🌟',
                category: 'quizzes',
                difficulty: 'platinum',
                condition: { type: 'perfect_quiz_score', target: 5 },
                xpReward: 750
            },

            // Streak Badges
            'dedication_starter': {
                id: 'dedication_starter',
                name: 'Dedication Starter',
                description: 'Maintain a 3-day learning streak',
                icon: '🔥',
                category: 'streaks',
                difficulty: 'bronze',
                condition: { type: 'streak_days', target: 3 },
                xpReward: 100
            },
            'consistent_learner': {
                id: 'consistent_learner',
                name: 'Consistent Learner',
                description: 'Maintain a 7-day learning streak',
                icon: '📅',
                category: 'streaks',
                difficulty: 'silver',
                condition: { type: 'streak_days', target: 7 },
                xpReward: 250
            },
            'streak_warrior': {
                id: 'streak_warrior',
                name: 'Streak Warrior',
                description: 'Maintain a 30-day learning streak',
                icon: '⚔️',
                category: 'streaks',
                difficulty: 'gold',
                condition: { type: 'streak_days', target: 30 },
                xpReward: 1000
            },
            'streak_legend': {
                id: 'streak_legend',
                name: 'Streak Legend',
                description: 'Maintain a 100-day learning streak',
                icon: '👑',
                category: 'streaks',
                difficulty: 'platinum',
                condition: { type: 'streak_days', target: 100 },
                xpReward: 2500
            },

            // Time-based Badges
            'early_bird': {
                id: 'early_bird',
                name: 'Early Bird',
                description: 'Learn shortcuts before 9 AM',
                icon: '🐦',
                category: 'time',
                difficulty: 'silver',
                condition: { type: 'early_learning_sessions', target: 5 },
                xpReward: 150
            },
            'night_owl': {
                id: 'night_owl',
                name: 'Night Owl',
                description: 'Learn shortcuts after 9 PM',
                icon: '🦉',
                category: 'time',
                difficulty: 'silver',
                condition: { type: 'late_learning_sessions', target: 5 },
                xpReward: 150
            },
            'weekend_warrior': {
                id: 'weekend_warrior',
                name: 'Weekend Warrior',
                description: 'Complete learning sessions on weekends',
                icon: '🏋️',
                category: 'time',
                difficulty: 'bronze',
                condition: { type: 'weekend_sessions', target: 5 },
                xpReward: 100
            },

            // Application-specific Badges
            'chrome_expert': {
                id: 'chrome_expert',
                name: 'Chrome Expert',
                description: 'Master 10 Chrome shortcuts',
                icon: '🌐',
                category: 'applications',
                difficulty: 'silver',
                condition: { type: 'app_shortcuts', app: 'chrome', target: 10 },
                xpReward: 200
            },
            'vscode_ninja': {
                id: 'vscode_ninja',
                name: 'VS Code Ninja',
                description: 'Master 15 VS Code shortcuts',
                icon: '💻',
                category: 'applications',
                difficulty: 'gold',
                condition: { type: 'app_shortcuts', app: 'vscode', target: 15 },
                xpReward: 300
            },
            'windows_wizard': {
                id: 'windows_wizard',
                name: 'Windows Wizard',
                description: 'Master 20 Windows shortcuts',
                icon: '🪟',
                category: 'applications',
                difficulty: 'gold',
                condition: { type: 'app_shortcuts', app: 'windows', target: 20 },
                xpReward: 350
            },

            // Social Badges
            'community_member': {
                id: 'community_member',
                name: 'Community Member',
                description: 'Join the Shortcut Sensei community',
                icon: '👥',
                category: 'social',
                difficulty: 'bronze',
                condition: { type: 'community_joined', target: 1 },
                xpReward: 50
            },
            'helpful_contributor': {
                id: 'helpful_contributor',
                name: 'Helpful Contributor',
                description: 'Share 5 shortcuts with the community',
                icon: '🤝',
                category: 'social',
                difficulty: 'silver',
                condition: { type: 'shortcuts_shared', target: 5 },
                xpReward: 200
            },

            // Special Achievement Badges
            'speed_demon': {
                id: 'speed_demon',
                name: 'Speed Demon',
                description: 'Complete a quiz in under 30 seconds',
                icon: '💨',
                category: 'special',
                difficulty: 'gold',
                condition: { type: 'fast_quiz_completion', target: 30 },
                xpReward: 300
            },
            'comeback_kid': {
                id: 'comeback_kid',
                name: 'Comeback Kid',
                description: 'Restore a broken streak',
                icon: '🔄',
                category: 'special',
                difficulty: 'silver',
                condition: { type: 'streak_restored', target: 1 },
                xpReward: 150
            },
            'milestone_crusher': {
                id: 'milestone_crusher',
                name: 'Milestone Crusher',
                description: 'Reach level 10',
                icon: '🎖️',
                category: 'special',
                difficulty: 'gold',
                condition: { type: 'level_reached', target: 10 },
                xpReward: 500
            }
        };
    }

    loadUserBadges() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error loading user badges:', error);
            return {};
        }
    }

    loadBadgeProgress() {
        try {
            const stored = localStorage.getItem(this.progressKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error loading badge progress:', error);
            return {};
        }
    }

    saveUserBadges() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.userBadges));
        } catch (error) {
            console.error('Error saving user badges:', error);
        }
    }

    saveBadgeProgress() {
        try {
            localStorage.setItem(this.progressKey, JSON.stringify(this.badgeProgress));
        } catch (error) {
            console.error('Error saving badge progress:', error);
        }
    }

    updateProgress(actionType, data = {}) {
        const currentTime = new Date();
        const hour = currentTime.getHours();
        const isWeekend = currentTime.getDay() === 0 || currentTime.getDay() === 6;

        // Initialize progress if not exists
        if (!this.badgeProgress[actionType]) {
            this.badgeProgress[actionType] = 0;
        }

        // Update progress based on action type
        switch (actionType) {
            case 'tutorials_completed':
                this.badgeProgress.tutorials_completed = (this.badgeProgress.tutorials_completed || 0) + 1;
                break;

            case 'shortcuts_learned':
                this.badgeProgress.shortcuts_learned = (this.badgeProgress.shortcuts_learned || 0) + 1;
                
                // Track app-specific shortcuts
                if (data.app) {
                    const appKey = `app_shortcuts_${data.app}`;
                    this.badgeProgress[appKey] = (this.badgeProgress[appKey] || 0) + 1;
                }
                break;

            case 'quizzes_completed':
                this.badgeProgress.quizzes_completed = (this.badgeProgress.quizzes_completed || 0) + 1;
                
                // Track perfect scores
                if (data.score === 100) {
                    this.badgeProgress.perfect_quiz_score = (this.badgeProgress.perfect_quiz_score || 0) + 1;
                }
                
                // Track speed completion
                if (data.completionTime && data.completionTime < 30) {
                    this.badgeProgress.fast_quiz_completion = Math.min(data.completionTime, this.badgeProgress.fast_quiz_completion || Infinity);
                }
                break;

            case 'streak_updated':
                this.badgeProgress.streak_days = Math.max(this.badgeProgress.streak_days || 0, data.streakDays);
                break;

            case 'streak_restored':
                this.badgeProgress.streak_restored = (this.badgeProgress.streak_restored || 0) + 1;
                break;

            case 'level_reached':
                this.badgeProgress.level_reached = Math.max(this.badgeProgress.level_reached || 0, data.level);
                break;

            case 'community_joined':
                this.badgeProgress.community_joined = 1;
                break;

            case 'shortcuts_shared':
                this.badgeProgress.shortcuts_shared = (this.badgeProgress.shortcuts_shared || 0) + 1;
                break;

            case 'learning_session':
                // Track time-based learning
                if (hour < 9) {
                    this.badgeProgress.early_learning_sessions = (this.badgeProgress.early_learning_sessions || 0) + 1;
                }
                if (hour >= 21) {
                    this.badgeProgress.late_learning_sessions = (this.badgeProgress.late_learning_sessions || 0) + 1;
                }
                if (isWeekend) {
                    this.badgeProgress.weekend_sessions = (this.badgeProgress.weekend_sessions || 0) + 1;
                }
                break;
        }

        this.saveBadgeProgress();
        this.checkForNewBadges();
    }

    checkForNewBadges() {
        const newBadges = [];

        Object.values(this.badges).forEach(badge => {
            // Skip if already earned
            if (this.userBadges[badge.id]) return;

            let conditionMet = false;

            switch (badge.condition.type) {
                case 'app_shortcuts':
                    const appKey = `app_shortcuts_${badge.condition.app}`;
                    conditionMet = (this.badgeProgress[appKey] || 0) >= badge.condition.target;
                    break;

                case 'fast_quiz_completion':
                    conditionMet = (this.badgeProgress.fast_quiz_completion || Infinity) <= badge.condition.target;
                    break;

                default:
                    conditionMet = (this.badgeProgress[badge.condition.type] || 0) >= badge.condition.target;
                    break;
            }

            if (conditionMet) {
                this.unlockBadge(badge.id);
                newBadges.push(badge);
            }
        });

        if (newBadges.length > 0) {
            this.showBadgeNotifications(newBadges);
        }

        return newBadges;
    }

    unlockBadge(badgeId) {
        if (this.userBadges[badgeId]) return false;

        const badge = this.badges[badgeId];
        if (!badge) return false;

        this.userBadges[badgeId] = {
            unlockedAt: Date.now(),
            badge: badge
        };

        this.saveUserBadges();

        // Trigger event for other systems
        this.dispatchBadgeEvent('badgeUnlocked', { badge });

        return true;
    }

    showBadgeNotifications(newBadges) {
        newBadges.forEach((badge, index) => {
            setTimeout(() => {
                this.showBadgeNotification(badge);
            }, index * 1000);
        });
    }

    showBadgeNotification(badge) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'badge-notification';
        notification.innerHTML = `
            <div class="badge-notification-content">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-info">
                    <h3>Badge Unlocked!</h3>
                    <h4>${badge.name}</h4>
                    <p>${badge.description}</p>
                    <div class="badge-reward">+${badge.xpReward} XP</div>
                </div>
                <button class="badge-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add to notification container
        const container = document.getElementById('notificationContainer') || document.body;
        container.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);

        // Add entrance animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
    }

    getBadgesByCategory(category) {
        return Object.values(this.badges).filter(badge => badge.category === category);
    }

    getUserBadges() {
        return this.userBadges;
    }

    getBadgeProgress(badgeId) {
        const badge = this.badges[badgeId];
        if (!badge) return null;

        let currentProgress = 0;
        const target = badge.condition.target;

        switch (badge.condition.type) {
            case 'app_shortcuts':
                const appKey = `app_shortcuts_${badge.condition.app}`;
                currentProgress = this.badgeProgress[appKey] || 0;
                break;
            case 'fast_quiz_completion':
                currentProgress = (this.badgeProgress.fast_quiz_completion || Infinity) <= target ? target : 0;
                break;
            default:
                currentProgress = this.badgeProgress[badge.condition.type] || 0;
                break;
        }

        return {
            current: currentProgress,
            target: target,
            percentage: Math.min((currentProgress / target) * 100, 100),
            completed: this.userBadges[badgeId] ? true : false
        };
    }

    getAllBadgeProgress() {
        const progress = {};
        Object.keys(this.badges).forEach(badgeId => {
            progress[badgeId] = this.getBadgeProgress(badgeId);
        });
        return progress;
    }

    getUnlockedBadgesCount() {
        return Object.keys(this.userBadges).length;
    }

    getTotalBadgesCount() {
        return Object.keys(this.badges).length;
    }

    getBadgeCompletionPercentage() {
        return (this.getUnlockedBadgesCount() / this.getTotalBadgesCount()) * 100;
    }

    dispatchBadgeEvent(eventType, data) {
        const event = new CustomEvent(`badge:${eventType}`, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    // Show badge collection UI
    showBadgeCollection() {
        const modal = this.createBadgeCollectionModal();
        document.body.appendChild(modal);
    }

    createBadgeCollectionModal() {
        const modal = document.createElement('div');
        modal.className = 'badge-collection-modal';
        modal.innerHTML = `
            <div class="badge-collection-content">
                <div class="badge-collection-header">
                    <h2>Badge Collection</h2>
                    <div class="badge-stats">
                        <span>${this.getUnlockedBadgesCount()} / ${this.getTotalBadgesCount()} Badges</span>
                        <span>${Math.round(this.getBadgeCompletionPercentage())}% Complete</span>
                    </div>
                    <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="badge-categories">
                    ${this.renderBadgeCategories()}
                </div>
            </div>
        `;
        return modal;
    }

    renderBadgeCategories() {
        const categories = [...new Set(Object.values(this.badges).map(badge => badge.category))];
        
        return categories.map(category => {
            const categoryBadges = this.getBadgesByCategory(category);
            const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
            
            return `
                <div class="badge-category">
                    <h3>${categoryName}</h3>
                    <div class="badge-grid">
                        ${categoryBadges.map(badge => this.renderBadgeCard(badge)).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderBadgeCard(badge) {
        const isUnlocked = this.userBadges[badge.id];
        const progress = this.getBadgeProgress(badge.id);
        
        return `
            <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-info">
                    <h4>${badge.name}</h4>
                    <p>${badge.description}</p>
                    ${!isUnlocked ? `
                        <div class="badge-progress-bar">
                            <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                        </div>
                        <div class="progress-text">${progress.current} / ${progress.target}</div>
                    ` : `
                        <div class="badge-unlocked-date">
                            Unlocked ${new Date(isUnlocked.unlockedAt).toLocaleDateString()}
                        </div>
                    `}
                    <div class="badge-difficulty ${badge.difficulty}">${badge.difficulty}</div>
                </div>
            </div>
        `;
    }
}

// Initialize badge system
window.badgeSystem = new BadgeSystem();
