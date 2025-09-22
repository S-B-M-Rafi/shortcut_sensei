// Enhanced Progress Tracker with Badge and Streak Integration
class ProgressTracker {
    constructor() {
        this.storageKey = 'shortcut_sensei_progress';
        this.userProgress = this.loadProgress();
        this.achievements = [];
        this.currentUser = null;
        this.sessionStartTime = Date.now();
        this.sessionStats = {
            shortcutsLearned: 0,
            quizzesCompleted: 0,
            timeSpent: 0
        };
        
        this.initializeProgressTracking();
    }

    loadProgress() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }

        return this.getDefaultProgress();
    }

    getDefaultProgress() {
        return {
            userId: null,
            level: 1,
            experience: 0,
            totalExperience: 0,
            statistics: {
                shortcutsLearned: 0,
                quizzesCompleted: 0,
                tutorialsCompleted: 0,
                totalStudyTime: 0,
                averageQuizScore: 0,
                currentStreak: 0,
                longestStreak: 0,
                badgesEarned: 0,
                perfectQuizzes: 0,
                sessionsCompleted: 0,
                applicationsMastered: [],
                weakAreas: [],
                strongAreas: [],
                lastActivityDate: null
            },
            preferences: {
                dailyGoal: 3, // shortcuts per day
                notifications: true,
                difficulty: 'intermediate',
                focusAreas: ['basic', 'productivity']
            },
            achievements: [],
            milestones: [],
            recentActivities: []
        };
    }

    saveProgress() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.userProgress));
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    initializeProgressTracking() {
        // Listen for badge events
        document.addEventListener('badge:badgeUnlocked', (event) => {
            this.handleBadgeUnlocked(event.detail);
        });

        // Listen for streak events
        document.addEventListener('streak:streakExtended', (event) => {
            this.handleStreakExtended(event.detail);
        });

        document.addEventListener('streak:streakBroken', (event) => {
            this.handleStreakBroken(event.detail);
        });

        document.addEventListener('streak:dailyGoalsCompleted', (event) => {
            this.handleDailyGoalsCompleted(event.detail);
        });

        // Track session time
        this.startSessionTracking();
    }

    initializeUser(userId) {
        this.currentUser = userId;
        this.userProgress.userId = userId;
        
        // Load user-specific progress if available
        const userSpecificKey = `${this.storageKey}_${userId}`;
        try {
            const userStored = localStorage.getItem(userSpecificKey);
            if (userStored) {
                this.userProgress = { ...this.userProgress, ...JSON.parse(userStored) };
            }
        } catch (error) {
            console.error('Error loading user-specific progress:', error);
        }

        this.saveProgress();
        this.updateProgressDisplays();
    }

    addExperience(amount, source = 'general') {
        if (!amount || amount <= 0) return;

        const oldLevel = this.userProgress.level;
        this.userProgress.experience += amount;
        this.userProgress.totalExperience += amount;

        // Check for level up
        const newLevel = this.calculateLevel(this.userProgress.totalExperience);
        if (newLevel > oldLevel) {
            this.levelUp(oldLevel, newLevel);
        }

        // Record activity
        this.recordActivity('experience_gained', {
            amount: amount,
            source: source,
            timestamp: Date.now()
        });

        // Update badge system if available
        if (window.badgeSystem) {
            window.badgeSystem.updateProgress('level_reached', { level: newLevel });
        }

        this.saveProgress();
        this.updateProgressDisplays();
    }

    calculateLevel(totalXP) {
        // Progressive XP requirements: Level n requires n * 100 XP more than previous level
        // Level 1: 0 XP, Level 2: 100 XP, Level 3: 300 XP, Level 4: 600 XP, etc.
        let level = 1;
        let xpRequired = 0;
        
        while (totalXP >= xpRequired) {
            level++;
            xpRequired += level * 100;
        }
        
        return level - 1;
    }

    getXPForNextLevel() {
        const currentLevel = this.userProgress.level;
        const nextLevelXP = this.getXPRequiredForLevel(currentLevel + 1);
        return nextLevelXP - this.userProgress.totalExperience;
    }

    getXPRequiredForLevel(level) {
        if (level <= 1) return 0;
        
        let totalXP = 0;
        for (let i = 2; i <= level; i++) {
            totalXP += i * 100;
        }
        return totalXP;
    }

    getCurrentLevelProgress() {
        const currentLevel = this.userProgress.level;
        const currentLevelXP = this.getXPRequiredForLevel(currentLevel);
        const nextLevelXP = this.getXPRequiredForLevel(currentLevel + 1);
        const currentXP = this.userProgress.totalExperience;
        
        return {
            current: currentXP - currentLevelXP,
            total: nextLevelXP - currentLevelXP,
            percentage: ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
        };
    }

    levelUp(oldLevel, newLevel) {
        // Award bonus XP for leveling up
        const bonusXP = newLevel * 50;
        this.userProgress.experience += bonusXP;
        this.userProgress.totalExperience += bonusXP;
        this.userProgress.level = newLevel;

        // Record milestone
        this.recordMilestone(`Reached Level ${newLevel}`, {
            type: 'level_up',
            oldLevel: oldLevel,
            newLevel: newLevel,
            bonusXP: bonusXP
        });

        // Show notification
        this.showLevelUpNotification(newLevel, bonusXP);

        // Update badge system
        if (window.badgeSystem) {
            window.badgeSystem.updateProgress('level_reached', { level: newLevel });
        }
    }

    learnShortcut(shortcutId, metadata = {}) {
        this.userProgress.statistics.shortcutsLearned++;
        
        // Add XP based on difficulty
        const difficulty = metadata.difficulty || 'beginner';
        const xpReward = this.getXPForDifficulty(difficulty);
        this.addExperience(xpReward, 'shortcut_learned');

        // Update application mastery
        if (metadata.application) {
            this.updateApplicationMastery(metadata.application);
        }

        // Record activity
        this.recordActivity('shortcut_learned', {
            shortcutId: shortcutId,
            difficulty: difficulty,
            application: metadata.application,
            xpGained: xpReward
        });

        // Update session stats
        this.sessionStats.shortcutsLearned++;

        // Update streak system
        if (window.streakSystem) {
            window.streakSystem.recordActivity('shortcut_learned', 1);
        }

        // Update badge system
        if (window.badgeSystem) {
            window.badgeSystem.updateProgress('shortcuts_learned', {
                app: metadata.application
            });
            window.badgeSystem.updateProgress('learning_session');
        }

        this.saveProgress();
        this.updateProgressDisplays();
    }

    completeQuiz(quizId, score, completionTime = null) {
        this.userProgress.statistics.quizzesCompleted++;
        
        // Update average score
        const totalQuizzes = this.userProgress.statistics.quizzesCompleted;
        const currentAverage = this.userProgress.statistics.averageQuizScore || 0;
        this.userProgress.statistics.averageQuizScore = 
            ((currentAverage * (totalQuizzes - 1)) + score) / totalQuizzes;

        // Track perfect scores
        if (score === 100) {
            this.userProgress.statistics.perfectQuizzes++;
        }

        // Award XP based on score
        const baseXP = 100;
        const scoreMultiplier = score / 100;
        const timeBonus = completionTime && completionTime < 60 ? 25 : 0;
        const totalXP = Math.round((baseXP * scoreMultiplier) + timeBonus);
        
        this.addExperience(totalXP, 'quiz_completed');

        // Record activity
        this.recordActivity('quiz_completed', {
            quizId: quizId,
            score: score,
            completionTime: completionTime,
            xpGained: totalXP,
            isPerfect: score === 100
        });

        // Update session stats
        this.sessionStats.quizzesCompleted++;

        // Update streak system
        if (window.streakSystem) {
            window.streakSystem.recordActivity('quiz_completed', 1);
        }

        // Update badge system
        if (window.badgeSystem) {
            window.badgeSystem.updateProgress('quizzes_completed', {
                score: score,
                completionTime: completionTime
            });
        }

        this.saveProgress();
        this.updateProgressDisplays();

        return {
            xpGained: totalXP,
            newLevel: this.userProgress.level,
            averageScore: this.userProgress.statistics.averageQuizScore
        };
    }

    completeTutorial(tutorialId, metadata = {}) {
        this.userProgress.statistics.tutorialsCompleted++;
        
        // Award XP for tutorial completion
        const xpReward = 75;
        this.addExperience(xpReward, 'tutorial_completed');

        // Record activity
        this.recordActivity('tutorial_completed', {
            tutorialId: tutorialId,
            duration: metadata.duration,
            xpGained: xpReward
        });

        // Update badge system
        if (window.badgeSystem) {
            window.badgeSystem.updateProgress('tutorials_completed');
        }

        this.saveProgress();
        this.updateProgressDisplays();
    }

    updateApplicationMastery(application) {
        const mastered = this.userProgress.statistics.applicationsMastered;
        if (!mastered.find(app => app.name === application)) {
            mastered.push({
                name: application,
                shortcuts: 1,
                firstLearned: Date.now()
            });
        } else {
            const app = mastered.find(app => app.name === application);
            app.shortcuts++;
        }
    }

    getXPForDifficulty(difficulty) {
        const xpMap = {
            'beginner': 25,
            'intermediate': 50,
            'advanced': 100,
            'expert': 150
        };
        return xpMap[difficulty] || 25;
    }

    recordActivity(type, data) {
        const activity = {
            type: type,
            timestamp: Date.now(),
            data: data
        };

        this.userProgress.recentActivities.unshift(activity);
        
        // Keep only last 50 activities
        if (this.userProgress.recentActivities.length > 50) {
            this.userProgress.recentActivities = this.userProgress.recentActivities.slice(0, 50);
        }

        // Update last activity date
        this.userProgress.statistics.lastActivityDate = Date.now();
    }

    recordMilestone(title, data) {
        const milestone = {
            title: title,
            timestamp: Date.now(),
            data: data
        };

        this.userProgress.milestones.unshift(milestone);
        
        // Keep only last 20 milestones
        if (this.userProgress.milestones.length > 20) {
            this.userProgress.milestones = this.userProgress.milestones.slice(0, 20);
        }
    }

    startSessionTracking() {
        this.sessionStartTime = Date.now();
        
        // Track time every minute
        setInterval(() => {
            this.updateSessionTime();
        }, 60000);

        // Save session on page unload
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });
    }

    updateSessionTime() {
        const currentTime = Date.now();
        const sessionTime = currentTime - this.sessionStartTime;
        this.sessionStats.timeSpent = sessionTime;
        
        // Add to total study time
        this.userProgress.statistics.totalStudyTime += 60000; // 1 minute

        // Update streak system
        if (window.streakSystem) {
            window.streakSystem.recordActivity('study_time', 1);
        }
    }

    endSession() {
        this.updateSessionTime();
        
        if (this.sessionStats.shortcutsLearned > 0 || this.sessionStats.quizzesCompleted > 0) {
            this.userProgress.statistics.sessionsCompleted++;
            
            this.recordActivity('session_completed', {
                duration: this.sessionStats.timeSpent,
                shortcutsLearned: this.sessionStats.shortcutsLearned,
                quizzesCompleted: this.sessionStats.quizzesCompleted
            });
        }

        this.saveProgress();
    }

    // Event handlers for badge and streak systems
    handleBadgeUnlocked(badgeData) {
        const badge = badgeData.badge;
        this.userProgress.statistics.badgesEarned++;
        
        // Award XP for badge unlock
        this.addExperience(badge.xpReward, 'badge_unlocked');
        
        this.recordMilestone(`Badge Unlocked: ${badge.name}`, {
            type: 'badge_unlocked',
            badgeId: badge.id,
            xpReward: badge.xpReward
        });

        this.recordActivity('badge_unlocked', {
            badgeId: badge.id,
            badgeName: badge.name,
            category: badge.category,
            xpGained: badge.xpReward
        });
    }

    handleStreakExtended(streakData) {
        this.userProgress.statistics.currentStreak = streakData.streakData.currentStreak;
        
        if (streakData.streakData.currentStreak > this.userProgress.statistics.longestStreak) {
            this.userProgress.statistics.longestStreak = streakData.streakData.currentStreak;
        }

        // Award streak bonus XP
        const streakBonus = Math.min(streakData.streakData.currentStreak * 5, 100);
        this.addExperience(streakBonus, 'streak_bonus');

        this.recordActivity('streak_extended', {
            streakLength: streakData.streakData.currentStreak,
            bonusXP: streakBonus
        });
    }

    handleStreakBroken(streakData) {
        this.userProgress.statistics.currentStreak = 0;
        
        this.recordActivity('streak_broken', {
            brokenStreakLength: streakData.brokenStreakLength
        });
    }

    handleDailyGoalsCompleted(goalData) {
        // Award bonus XP for completing daily goals
        this.addExperience(goalData.bonusXP, 'daily_goals_completed');
        
        this.recordMilestone('Daily Goals Completed', {
            type: 'daily_goals_completed',
            bonusXP: goalData.bonusXP
        });
    }

    // UI and display methods
    updateProgressDisplays() {
        this.updateHeaderProgress();
        this.updateDashboardProgress();
    }

    updateHeaderProgress() {
        const levelProgress = this.getCurrentLevelProgress();
        
        // Update header level display
        const headerLevel = document.getElementById('headerLevelNumber');
        if (headerLevel) {
            headerLevel.textContent = this.userProgress.level;
        }

        // Update header XP display
        const headerXP = document.getElementById('headerXpText');
        if (headerXP) {
            headerXP.textContent = `${Math.round(levelProgress.current)} / ${Math.round(levelProgress.total)} XP`;
        }

        // Update header XP bar
        const headerXPFill = document.getElementById('headerXpFill');
        if (headerXPFill) {
            headerXPFill.style.width = `${Math.min(levelProgress.percentage, 100)}%`;
        }
    }

    updateDashboardProgress() {
        // Update dashboard level display
        const dashboardLevel = document.getElementById('dashboardLevelNumber');
        if (dashboardLevel) {
            dashboardLevel.textContent = this.userProgress.level;
        }

        const levelProgress = this.getCurrentLevelProgress();
        
        // Update dashboard XP display
        const dashboardXP = document.getElementById('dashboardXpText');
        if (dashboardXP) {
            dashboardXP.textContent = `${Math.round(levelProgress.current)} / ${Math.round(levelProgress.total)} XP`;
        }

        // Update XP to next level
        const xpToNext = document.getElementById('xpToNext');
        if (xpToNext) {
            xpToNext.textContent = `${Math.round(levelProgress.total - levelProgress.current)} XP to next level`;
        }

        // Update dashboard XP bar
        const dashboardXPFill = document.getElementById('dashboardLevelFill');
        if (dashboardXPFill) {
            dashboardXPFill.style.width = `${Math.min(levelProgress.percentage, 100)}%`;
        }

        // Update statistics
        this.updateStatisticsDisplay();
    }

    updateStatisticsDisplay() {
        const stats = this.userProgress.statistics;
        
        // Update statistics in dashboard
        const elements = {
            'totalShortcuts': stats.shortcutsLearned,
            'quizzesCompleted': stats.quizzesCompleted,
            'streakDays': stats.currentStreak,
            'totalTime': Math.round(stats.totalStudyTime / 60000) // Convert to minutes
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (id === 'totalTime') {
                    element.textContent = `${value}m`;
                } else {
                    element.textContent = value;
                }
            }
        });
    }

    showLevelUpNotification(newLevel, bonusXP) {
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.innerHTML = `
            <div class="level-up-content">
                <div class="level-up-icon">🎉</div>
                <div class="level-up-text">
                    <h3>Level Up!</h3>
                    <p>You've reached Level ${newLevel}!</p>
                    <div class="bonus-xp">+${bonusXP} Bonus XP</div>
                </div>
                <button class="level-up-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        const container = document.getElementById('notificationContainer') || document.body;
        container.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);

        // Add celebration animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
    }

    // Public API methods
    getUserProgress() {
        return {
            level: this.userProgress.level,
            experience: this.userProgress.experience,
            totalExperience: this.userProgress.totalExperience,
            currentXP: this.getCurrentLevelProgress().current,
            xpToNextLevel: this.getCurrentLevelProgress().total,
            statistics: this.userProgress.statistics,
            achievements: this.userProgress.achievements,
            recentAchievements: this.getRecentAchievements()
        };
    }

    getRecentAchievements() {
        return this.userProgress.milestones
            .filter(milestone => milestone.data && milestone.data.type === 'badge_unlocked')
            .slice(0, 3)
            .map(milestone => ({
                name: milestone.title.replace('Badge Unlocked: ', ''),
                description: milestone.data.badgeName || '',
                icon: '🏆',
                unlockedAt: milestone.timestamp
            }));
    }

    getDetailedStats() {
        return {
            ...this.userProgress.statistics,
            sessionStats: this.sessionStats,
            levelProgress: this.getCurrentLevelProgress(),
            xpToNextLevel: this.getXPForNextLevel(),
            averageXPPerSession: this.calculateAverageXPPerSession(),
            learningVelocity: this.calculateLearningVelocity()
        };
    }

    calculateAverageXPPerSession() {
        const sessions = this.userProgress.statistics.sessionsCompleted;
        return sessions > 0 ? Math.round(this.userProgress.totalExperience / sessions) : 0;
    }

    calculateLearningVelocity() {
        // Shortcuts learned per day over last 7 days
        const lastWeekActivities = this.userProgress.recentActivities.filter(activity => 
            activity.type === 'shortcut_learned' && 
            (Date.now() - activity.timestamp) < (7 * 24 * 60 * 60 * 1000)
        );
        
        return Math.round(lastWeekActivities.length / 7 * 10) / 10; // Round to 1 decimal
    }

    // Admin/Debug methods
    resetProgress() {
        this.userProgress = this.getDefaultProgress();
        this.saveProgress();
        this.updateProgressDisplays();
    }

    addDebugXP(amount) {
        this.addExperience(amount, 'debug');
    }

    showAchievements() {
        if (window.badgeSystem) {
            window.badgeSystem.showBadgeCollection();
        }
    }

    showLeaderboard() {
        // Placeholder for leaderboard functionality
        console.log('Leaderboard feature coming soon!');
    }
}

// Initialize progress tracker
if (typeof window !== 'undefined') {
    window.progressTracker = new ProgressTracker();
}
