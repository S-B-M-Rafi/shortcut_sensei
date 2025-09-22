// Streak System for Shortcut Sensei
class StreakSystem {
    constructor() {
        this.storageKey = 'shortcut_sensei_streak';
        this.streakData = this.loadStreakData();
        this.initializeStreakTracking();
    }

    loadStreakData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading streak data:', error);
        }

        // Default streak data
        return {
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: null,
            streakStartDate: null,
            totalActiveDays: 0,
            streakHistory: [],
            streakFreezes: 3, // Number of streak freezes available
            lastFreezeUsed: null,
            achievements: [],
            dailyGoals: {
                shortcutsLearned: 3,
                quizzesCompleted: 1,
                studyTimeMinutes: 10
            },
            todaysProgress: {
                shortcutsLearned: 0,
                quizzesCompleted: 0,
                studyTimeMinutes: 0,
                lastUpdated: null
            }
        };
    }

    saveStreakData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.streakData));
        } catch (error) {
            console.error('Error saving streak data:', error);
        }
    }

    initializeStreakTracking() {
        // Check streak status on initialization (without notifications)
        this.checkStreakStatus(true); // Pass true to suppress notifications
        
        // Set up daily check interval
        this.setupDailyCheck();
        
        // Reset daily progress if new day
        this.resetDailyProgressIfNeeded();
    }

    checkStreakStatus(suppressNotifications = false) {
        const today = this.getDateString(new Date());
        const lastActivity = this.streakData.lastActivityDate;
        
        if (!lastActivity) {
            // No previous activity
            return;
        }

        const daysSinceLastActivity = this.getDaysDifference(lastActivity, today);
        
        if (daysSinceLastActivity === 1) {
            // Streak continues
            return;
        } else if (daysSinceLastActivity > 1) {
            // Streak might be broken - check if freeze can be used
            if (this.canUseStreakFreeze() && daysSinceLastActivity <= 3) {
                if (!suppressNotifications) {
                    this.offerStreakFreeze();
                }
            } else {
                this.breakStreak(suppressNotifications);
            }
        }
    }

    recordActivity(activityType, amount = 1) {
        const today = this.getDateString(new Date());
        const wasFirstActivityToday = !this.streakData.todaysProgress.lastUpdated || 
                                     this.getDateString(new Date(this.streakData.todaysProgress.lastUpdated)) !== today;

        // Update today's progress
        this.updateTodaysProgress(activityType, amount);

        // If this is the first activity today, update streak
        if (wasFirstActivityToday) {
            this.updateStreakForToday();
        }

        // Check if daily goals are met
        this.checkDailyGoals();

        this.saveStreakData();
        this.dispatchStreakEvent('activityRecorded', {
            type: activityType,
            amount: amount,
            streakData: this.streakData
        });
    }

    updateTodaysProgress(activityType, amount) {
        const today = this.getDateString(new Date());
        
        // Reset progress if new day
        if (!this.streakData.todaysProgress.lastUpdated || 
            this.getDateString(new Date(this.streakData.todaysProgress.lastUpdated)) !== today) {
            this.streakData.todaysProgress = {
                shortcutsLearned: 0,
                quizzesCompleted: 0,
                studyTimeMinutes: 0,
                lastUpdated: new Date().toISOString()
            };
        }

        // Update progress
        switch (activityType) {
            case 'shortcut_learned':
                this.streakData.todaysProgress.shortcutsLearned += amount;
                break;
            case 'quiz_completed':
                this.streakData.todaysProgress.quizzesCompleted += amount;
                break;
            case 'study_time':
                this.streakData.todaysProgress.studyTimeMinutes += amount;
                break;
        }

        this.streakData.todaysProgress.lastUpdated = new Date().toISOString();
    }

    updateStreakForToday() {
        const today = this.getDateString(new Date());
        const lastActivity = this.streakData.lastActivityDate;

        if (!lastActivity) {
            // First ever activity
            this.startNewStreak(today);
        } else {
            const daysSinceLastActivity = this.getDaysDifference(lastActivity, today);

            if (daysSinceLastActivity === 0) {
                // Already recorded activity today
                return;
            } else if (daysSinceLastActivity === 1) {
                // Consecutive day - extend streak
                this.extendStreak(today);
            } else {
                // Gap in activity - start new streak
                this.startNewStreak(today);
            }
        }

        this.streakData.lastActivityDate = today;
        this.streakData.totalActiveDays++;
    }

    startNewStreak(date) {
        this.streakData.currentStreak = 1;
        this.streakData.streakStartDate = date;
        
        this.dispatchStreakEvent('streakStarted', {
            streakData: this.streakData
        });
    }

    extendStreak(date) {
        this.streakData.currentStreak++;
        
        // Update longest streak if necessary
        if (this.streakData.currentStreak > this.streakData.longestStreak) {
            this.streakData.longestStreak = this.streakData.currentStreak;
            
            this.dispatchStreakEvent('longestStreakUpdated', {
                newRecord: this.streakData.longestStreak
            });
        }

        // Check for streak milestones
        this.checkStreakMilestones();

        this.dispatchStreakEvent('streakExtended', {
            streakData: this.streakData
        });
    }

    breakStreak(suppressNotifications = false) {
        const brokenStreak = this.streakData.currentStreak;
        
        // Record broken streak in history
        if (brokenStreak > 0) {
            this.streakData.streakHistory.push({
                length: brokenStreak,
                startDate: this.streakData.streakStartDate,
                endDate: this.streakData.lastActivityDate,
                brokenDate: this.getDateString(new Date())
            });
        }

        this.streakData.currentStreak = 0;
        this.streakData.streakStartDate = null;

        this.dispatchStreakEvent('streakBroken', {
            brokenStreakLength: brokenStreak,
            streakData: this.streakData
        });

        if (!suppressNotifications) {
            this.showStreakBrokenNotification(brokenStreak);
        }
    }

    canUseStreakFreeze() {
        return this.streakData.streakFreezes > 0 && this.streakData.currentStreak >= 3;
    }

    useStreakFreeze() {
        if (!this.canUseStreakFreeze()) {
            return false;
        }

        this.streakData.streakFreezes--;
        this.streakData.lastFreezeUsed = new Date().toISOString();
        this.streakData.lastActivityDate = this.getDateString(new Date());

        this.saveStreakData();

        this.dispatchStreakEvent('streakFreezeUsed', {
            freezesRemaining: this.streakData.streakFreezes,
            streakData: this.streakData
        });

        return true;
    }

    offerStreakFreeze() {
        if (!this.canUseStreakFreeze()) {
            this.breakStreak();
            return;
        }

        this.showStreakFreezeOffer();
    }

    checkStreakMilestones() {
        const milestones = [3, 7, 14, 30, 50, 100, 365];
        const currentStreak = this.streakData.currentStreak;

        milestones.forEach(milestone => {
            if (currentStreak === milestone && !this.streakData.achievements.includes(`streak_${milestone}`)) {
                this.unlockStreakAchievement(milestone);
            }
        });
    }

    unlockStreakAchievement(milestone) {
        const achievementId = `streak_${milestone}`;
        this.streakData.achievements.push(achievementId);

        // Award streak freeze for major milestones
        if ([7, 30, 100].includes(milestone)) {
            this.streakData.streakFreezes++;
        }

        this.dispatchStreakEvent('streakAchievementUnlocked', {
            milestone: milestone,
            achievementId: achievementId,
            streakData: this.streakData
        });

        this.showStreakMilestoneNotification(milestone);
    }

    checkDailyGoals() {
        const progress = this.streakData.todaysProgress;
        const goals = this.streakData.dailyGoals;

        const goalsCompleted = {
            shortcuts: progress.shortcutsLearned >= goals.shortcutsLearned,
            quizzes: progress.quizzesCompleted >= goals.quizzesCompleted,
            studyTime: progress.studyTimeMinutes >= goals.studyTimeMinutes
        };

        const allGoalsCompleted = Object.values(goalsCompleted).every(completed => completed);

        if (allGoalsCompleted && !this.dailyGoalsCompletedToday()) {
            this.markDailyGoalsCompleted();
        }

        this.dispatchStreakEvent('dailyGoalsUpdated', {
            progress: progress,
            goals: goals,
            goalsCompleted: goalsCompleted,
            allCompleted: allGoalsCompleted
        });
    }

    dailyGoalsCompletedToday() {
        const today = this.getDateString(new Date());
        return this.streakData.dailyGoalsCompletedDate === today;
    }

    markDailyGoalsCompleted() {
        const today = this.getDateString(new Date());
        this.streakData.dailyGoalsCompletedDate = today;
        
        // Bonus XP for completing daily goals
        this.dispatchStreakEvent('dailyGoalsCompleted', {
            bonusXP: 100,
            streakData: this.streakData
        });

        this.showDailyGoalsCompletedNotification();
    }

    resetDailyProgressIfNeeded() {
        const today = this.getDateString(new Date());
        const lastUpdated = this.streakData.todaysProgress.lastUpdated;

        if (!lastUpdated || this.getDateString(new Date(lastUpdated)) !== today) {
            this.streakData.todaysProgress = {
                shortcutsLearned: 0,
                quizzesCompleted: 0,
                studyTimeMinutes: 0,
                lastUpdated: new Date().toISOString()
            };
            this.saveStreakData();
        }
    }

    setupDailyCheck() {
        // Check every hour if it's a new day
        setInterval(() => {
            this.checkStreakStatus();
            this.resetDailyProgressIfNeeded();
        }, 60 * 60 * 1000); // 1 hour
    }

    // Utility methods
    getDateString(date) {
        return date.toISOString().split('T')[0];
    }

    getDaysDifference(dateString1, dateString2) {
        const date1 = new Date(dateString1);
        const date2 = new Date(dateString2);
        const diffTime = Math.abs(date2 - date1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Notification methods
    showStreakBrokenNotification(brokenStreakLength) {
        const notification = this.createNotification({
            type: 'streak-broken',
            title: 'Streak Broken',
            message: `Your ${brokenStreakLength}-day streak has ended. Start a new one today!`,
            icon: '💔',
            actions: [
                { text: 'Start New Streak', action: () => this.startLearningSession() }
            ]
        });

        this.showNotification(notification);
    }

    showStreakFreezeOffer() {
        const notification = this.createNotification({
            type: 'streak-freeze-offer',
            title: 'Save Your Streak!',
            message: `Use a streak freeze to save your ${this.streakData.currentStreak}-day streak?`,
            icon: '🧊',
            actions: [
                { 
                    text: `Use Freeze (${this.streakData.streakFreezes} left)`, 
                    action: () => this.useStreakFreeze(),
                    primary: true
                },
                { 
                    text: 'Let it break', 
                    action: () => this.breakStreak() 
                }
            ]
        });

        this.showNotification(notification);
    }

    showStreakMilestoneNotification(milestone) {
        const milestoneMessages = {
            3: 'Great start! Keep going!',
            7: 'One week strong! You earned a streak freeze!',
            14: 'Two weeks of dedication!',
            30: 'Amazing! One month streak! Streak freeze earned!',
            50: 'Incredible dedication!',
            100: 'Century club! You\'re a legend! Streak freeze earned!',
            365: 'One year streak! You are the ultimate Shortcut Sensei!'
        };

        const notification = this.createNotification({
            type: 'streak-milestone',
            title: `${milestone}-Day Streak!`,
            message: milestoneMessages[milestone] || 'Incredible streak!',
            icon: '🔥',
            actions: [
                { text: 'Keep Going!', action: () => this.showStreakStats() }
            ]
        });

        this.showNotification(notification);
    }

    showDailyGoalsCompletedNotification() {
        const notification = this.createNotification({
            type: 'daily-goals-completed',
            title: 'Daily Goals Completed!',
            message: 'Awesome work! You\'ve completed all your daily learning goals.',
            icon: '🎯',
            actions: [
                { text: 'View Progress', action: () => this.showStreakStats() }
            ]
        });

        this.showNotification(notification);
    }

    createNotification({ type, title, message, icon, actions = [] }) {
        const notification = document.createElement('div');
        notification.className = `streak-notification ${type}`;
        
        const actionsHtml = actions.map(action => 
            `<button class="notification-action ${action.primary ? 'primary' : ''}" 
                     onclick="(${action.action.toString()})(); this.closest('.streak-notification').remove();">
                ${action.text}
             </button>`
        ).join('');

        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${icon}</div>
                <div class="notification-text">
                    <h3>${title}</h3>
                    <p>${message}</p>
                </div>
                <div class="notification-actions">
                    ${actionsHtml}
                    <button class="notification-close" onclick="this.closest('.streak-notification').remove();">×</button>
                </div>
            </div>
        `;

        return notification;
    }

    showNotification(notification) {
        const container = document.getElementById('notificationContainer') || document.body;
        container.appendChild(notification);

        // Auto-remove after 10 seconds if no action taken
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);

        // Add entrance animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
    }

    // Public API methods
    getCurrentStreak() {
        return this.streakData.currentStreak;
    }

    getLongestStreak() {
        return this.streakData.longestStreak;
    }

    getTodaysProgress() {
        return this.streakData.todaysProgress;
    }

    getDailyGoals() {
        return this.streakData.dailyGoals;
    }

    getStreakFreezes() {
        return this.streakData.streakFreezes;
    }

    updateDailyGoals(newGoals) {
        this.streakData.dailyGoals = { ...this.streakData.dailyGoals, ...newGoals };
        this.saveStreakData();
    }

    getStreakStats() {
        return {
            currentStreak: this.streakData.currentStreak,
            longestStreak: this.streakData.longestStreak,
            totalActiveDays: this.streakData.totalActiveDays,
            streakFreezes: this.streakData.streakFreezes,
            todaysProgress: this.streakData.todaysProgress,
            dailyGoals: this.streakData.dailyGoals,
            achievements: this.streakData.achievements
        };
    }

    showStreakStats() {
        const modal = this.createStreakStatsModal();
        document.body.appendChild(modal);
    }

    createStreakStatsModal() {
        const stats = this.getStreakStats();
        const modal = document.createElement('div');
        modal.className = 'streak-stats-modal';
        
        modal.innerHTML = `
            <div class="streak-stats-content">
                <div class="streak-stats-header">
                    <h2>Streak Statistics</h2>
                    <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                
                <div class="streak-overview">
                    <div class="streak-card current">
                        <div class="streak-icon">🔥</div>
                        <div class="streak-number">${stats.currentStreak}</div>
                        <div class="streak-label">Current Streak</div>
                    </div>
                    
                    <div class="streak-card longest">
                        <div class="streak-icon">🏆</div>
                        <div class="streak-number">${stats.longestStreak}</div>
                        <div class="streak-label">Longest Streak</div>
                    </div>
                    
                    <div class="streak-card total">
                        <div class="streak-icon">📅</div>
                        <div class="streak-number">${stats.totalActiveDays}</div>
                        <div class="streak-label">Total Active Days</div>
                    </div>
                    
                    <div class="streak-card freezes">
                        <div class="streak-icon">🧊</div>
                        <div class="streak-number">${stats.streakFreezes}</div>
                        <div class="streak-label">Streak Freezes</div>
                    </div>
                </div>
                
                <div class="daily-progress">
                    <h3>Today's Progress</h3>
                    <div class="progress-items">
                        <div class="progress-item">
                            <span>Shortcuts Learned</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min((stats.todaysProgress.shortcutsLearned / stats.dailyGoals.shortcutsLearned) * 100, 100)}%"></div>
                            </div>
                            <span>${stats.todaysProgress.shortcutsLearned} / ${stats.dailyGoals.shortcutsLearned}</span>
                        </div>
                        
                        <div class="progress-item">
                            <span>Quizzes Completed</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min((stats.todaysProgress.quizzesCompleted / stats.dailyGoals.quizzesCompleted) * 100, 100)}%"></div>
                            </div>
                            <span>${stats.todaysProgress.quizzesCompleted} / ${stats.dailyGoals.quizzesCompleted}</span>
                        </div>
                        
                        <div class="progress-item">
                            <span>Study Time (minutes)</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min((stats.todaysProgress.studyTimeMinutes / stats.dailyGoals.studyTimeMinutes) * 100, 100)}%"></div>
                            </div>
                            <span>${stats.todaysProgress.studyTimeMinutes} / ${stats.dailyGoals.studyTimeMinutes}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }

    dispatchStreakEvent(eventType, data) {
        const event = new CustomEvent(`streak:${eventType}`, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    startLearningSession() {
        // This would integrate with the main app to start a learning session
        if (window.shortcutSenseiApp && window.shortcutSenseiApp.tutorialSystem) {
            window.shortcutSenseiApp.tutorialSystem.showTutorialMenu();
        }
    }
}

// Initialize streak system
window.streakSystem = new StreakSystem();
