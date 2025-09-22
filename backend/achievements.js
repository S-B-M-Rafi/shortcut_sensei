// Achievement and Gamification System
// Tracks user progress, awards achievements, and gamifies the learning experience

class AchievementSystem {
    constructor() {
        this.achievements = new Map();
        this.userProgress = new Map();
        this.initializeAchievements();
        this.initializeSystem();
    }

    initializeSystem() {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            this.setupProgressTracking();
            this.loadUserProgress();
        }
    }

    initializeAchievements() {
        // Define all available achievements
        this.achievements = new Map([
            // Learning Achievements
            ['first_shortcut', {
                id: 'first_shortcut',
                title: 'First Steps',
                description: 'Copy your first keyboard shortcut',
                icon: 'target',
                category: 'learning',
                threshold: 1,
                metric: 'shortcuts_copied',
                points: 10,
                badge: 'bronze'
            }],
            
            ['shortcut_apprentice', {
                id: 'shortcut_apprentice',
                title: 'Shortcut Apprentice',
                description: 'Copy 25 keyboard shortcuts',
                icon: 'book',
                category: 'learning',
                threshold: 25,
                metric: 'shortcuts_copied',
                points: 50,
                badge: 'silver'
            }],
            
            ['shortcut_master', {
                id: 'shortcut_master',
                title: 'Shortcut Master',
                description: 'Copy 100 keyboard shortcuts',
                icon: 'trophy',
                category: 'learning',
                threshold: 100,
                metric: 'shortcuts_copied',
                points: 200,
                badge: 'gold'
            }],
            
            ['shortcut_guru', {
                id: 'shortcut_guru',
                title: 'Shortcut Guru',
                description: 'Copy 500 keyboard shortcuts',
                icon: 'crown',
                category: 'learning',
                threshold: 500,
                metric: 'shortcuts_copied',
                points: 500,
                badge: 'platinum'
            }],

            // Exploration Achievements
            ['app_explorer', {
                id: 'app_explorer',
                title: 'App Explorer',
                description: 'Visit 10 different application pages',
                icon: 'map',
                category: 'exploration',
                threshold: 10,
                metric: 'apps_visited',
                points: 30,
                badge: 'bronze'
            }],
            
            ['app_connoisseur', {
                id: 'app_connoisseur',
                title: 'App Connoisseur',
                description: 'Visit all application pages',
                icon: 'palette',
                category: 'exploration',
                threshold: 30,
                metric: 'apps_visited',
                points: 100,
                badge: 'gold'
            }],

            // Search Achievements
            ['search_novice', {
                id: 'search_novice',
                title: 'Search Novice',
                description: 'Perform 10 searches',
                icon: 'search',
                category: 'search',
                threshold: 10,
                metric: 'searches_performed',
                points: 20,
                badge: 'bronze'
            }],
            
            ['search_expert', {
                id: 'search_expert',
                title: 'Search Expert',
                description: 'Perform 100 searches',
                icon: 'lens',
                category: 'search',
                threshold: 100,
                metric: 'searches_performed',
                points: 75,
                badge: 'silver'
            }],

            // Engagement Achievements
            ['daily_learner', {
                id: 'daily_learner',
                title: 'Daily Learner',
                description: 'Visit 3 days in a row',
                icon: 'calendar',
                category: 'engagement',
                threshold: 3,
                metric: 'consecutive_days',
                points: 40,
                badge: 'silver'
            }],
            
            ['weekly_warrior', {
                id: 'weekly_warrior',
                title: 'Weekly Warrior',
                description: 'Visit 7 days in a row',
                icon: 'bolt',
                category: 'engagement',
                threshold: 7,
                metric: 'consecutive_days',
                points: 100,
                badge: 'gold'
            }],

            // Social Achievements
            ['community_member', {
                id: 'community_member',
                title: 'Community Member',
                description: 'Post your first question or answer',
                icon: '👥',
                category: 'social',
                threshold: 1,
                metric: 'community_posts',
                points: 25,
                badge: 'bronze'
            }],
            
            ['helpful_contributor', {
                id: 'helpful_contributor',
                title: 'Helpful Contributor',
                description: 'Get 10 likes on your posts',
                icon: 'heart',
                category: 'social',
                threshold: 10,
                metric: 'post_likes',
                points: 75,
                badge: 'silver'
            }],

            // Special Achievements
            ['early_adopter', {
                id: 'early_adopter',
                title: 'Early Adopter',
                description: 'Join Shortcut Sensei in its first month',
                icon: 'rocket',
                category: 'special',
                threshold: 1,
                metric: 'early_signup',
                points: 50,
                badge: 'special'
            }],
            
            ['feature_explorer', {
                id: 'feature_explorer',
                title: 'Feature Explorer',
                description: 'Use 5 different features',
                icon: 'lab',
                category: 'special',
                threshold: 5,
                metric: 'features_used',
                points: 60,
                badge: 'silver'
            }],
            
            ['theme_switcher', {
                id: 'theme_switcher',
                title: 'Theme Switcher',
                description: 'Switch between light and dark themes',
                icon: 'moon',
                category: 'customization',
                threshold: 1,
                metric: 'theme_switches',
                points: 15,
                badge: 'bronze'
            }],

            // Milestone Achievements
            ['productivity_boost', {
                id: 'productivity_boost',
                title: 'Productivity Boost',
                description: 'Save 1 hour worth of shortcuts',
                icon: 'clock',
                category: 'milestone',
                threshold: 3600, // 1 hour in seconds
                metric: 'time_saved',
                points: 150,
                badge: 'gold'
            }]
        ]);
    }

    setupProgressTracking() {
        // Track user actions that contribute to achievements
        this.trackShortcutActions();
        this.trackNavigationActions();
        this.trackSearchActions();
        this.trackEngagementActions();
        this.trackFeatureUsage();
        this.trackDailyVisits();
    }

    async loadUserProgress() {
        const userId = this.auth.currentUser?.uid;
        if (!userId) return;

        try {
            // Load user progress
            const progressDoc = await this.db.collection('user_progress').doc(userId).get();
            if (progressDoc.exists) {
                this.userProgress = new Map(Object.entries(progressDoc.data()));
            }

            // Load earned achievements
            const achievementsSnapshot = await this.db.collection('user_achievements')
                .where('userId', '==', userId)
                .get();
            
            this.earnedAchievements = new Set();
            achievementsSnapshot.forEach(doc => {
                this.earnedAchievements.add(doc.data().achievementId);
            });

            // Check for new achievements
            await this.checkAllAchievements();

        } catch (error) {
            console.error('Error loading user progress:', error);
        }
    }

    // Progress Tracking Methods
    trackShortcutActions() {
        document.addEventListener('click', (e) => {
            const shortcutElement = e.target.closest('.key-combo, .shortcut-key, [data-shortcut]');
            if (shortcutElement) {
                this.incrementProgress('shortcuts_copied');
                
                // Calculate time saved (average 2 seconds per shortcut)
                this.incrementProgress('time_saved', 2);
            }
        });
    }

    trackNavigationActions() {
        // Track unique app visits
        const currentApp = this.getCurrentApp();
        const visitedApps = this.getProgress('visited_apps') || new Set();
        
        if (!visitedApps.has(currentApp)) {
            visitedApps.add(currentApp);
            this.setProgress('visited_apps', visitedApps);
            this.incrementProgress('apps_visited');
        }
    }

    trackSearchActions() {
        // This integrates with the search enhancement system
        document.addEventListener('search_performed', (e) => {
            this.incrementProgress('searches_performed');
        });
    }

    trackEngagementActions() {
        // Track session start
        this.incrementProgress('sessions_started');
        
        // Track feature usage
        document.addEventListener('click', (e) => {
            if (e.target.matches('.favorite-btn, .bookmark-btn, .star-btn')) {
                this.incrementProgress('favorites_added');
            }
            
            if (e.target.matches('.theme-toggle, .dark-mode-toggle')) {
                this.incrementProgress('theme_switches');
            }
            
            if (e.target.matches('.export-btn, .download-btn, .print-btn')) {
                this.incrementProgress('exports_made');
            }
        });
    }

    trackFeatureUsage() {
        const features = new Set();
        
        document.addEventListener('click', (e) => {
            let feature = null;
            
            if (e.target.matches('.search-input, .search-btn')) feature = 'search';
            else if (e.target.matches('.theme-toggle')) feature = 'theme_toggle';
            else if (e.target.matches('.favorite-btn')) feature = 'favorites';
            else if (e.target.matches('.export-btn')) feature = 'export';
            else if (e.target.matches('.print-btn')) feature = 'print';
            
            if (feature && !features.has(feature)) {
                features.add(feature);
                this.setProgress('features_used_set', features);
                this.incrementProgress('features_used');
            }
        });
    }

    trackDailyVisits() {
        const today = new Date().toDateString();
        const lastVisit = this.getProgress('last_visit_date');
        const consecutiveDays = this.getProgress('consecutive_days') || 0;
        
        if (lastVisit !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastVisit === yesterday.toDateString()) {
                // Consecutive day
                this.incrementProgress('consecutive_days');
            } else {
                // Reset streak
                this.setProgress('consecutive_days', 1);
            }
            
            this.setProgress('last_visit_date', today);
            this.incrementProgress('total_days_visited');
        }
    }

    // Progress Management
    incrementProgress(metric, amount = 1) {
        const current = this.getProgress(metric) || 0;
        this.setProgress(metric, current + amount);
        this.checkAchievements(metric);
    }

    setProgress(metric, value) {
        this.userProgress.set(metric, value);
        this.saveProgress();
    }

    getProgress(metric) {
        return this.userProgress.get(metric) || 0;
    }

    async saveProgress() {
        const userId = this.auth.currentUser?.uid;
        if (!userId) return;

        try {
            const progressData = Object.fromEntries(this.userProgress);
            await this.db.collection('user_progress').doc(userId).set({
                ...progressData,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    // Achievement Checking
    async checkAchievements(changedMetric) {
        const relevantAchievements = Array.from(this.achievements.values())
            .filter(achievement => achievement.metric === changedMetric);
        
        for (const achievement of relevantAchievements) {
            await this.checkSingleAchievement(achievement);
        }
    }

    async checkAllAchievements() {
        for (const achievement of this.achievements.values()) {
            await this.checkSingleAchievement(achievement);
        }
    }

    async checkSingleAchievement(achievement) {
        // Skip if already earned
        if (this.earnedAchievements?.has(achievement.id)) return;

        const currentProgress = this.getProgress(achievement.metric);
        
        if (currentProgress >= achievement.threshold) {
            await this.awardAchievement(achievement);
        }
    }

    async awardAchievement(achievement) {
        const userId = this.auth.currentUser?.uid;
        if (!userId) return;

        try {
            // Save achievement to database
            await this.db.collection('user_achievements').add({
                userId: userId,
                achievementId: achievement.id,
                title: achievement.title,
                description: achievement.description,
                icon: achievement.icon,
                category: achievement.category,
                points: achievement.points,
                badge: achievement.badge,
                earnedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update user stats
            await this.updateUserStats(achievement.points);

            // Add to earned achievements
            if (!this.earnedAchievements) this.earnedAchievements = new Set();
            this.earnedAchievements.add(achievement.id);

            // Show achievement notification
            this.showAchievementNotification(achievement);

            // Trigger achievement earned event
            this.triggerAchievementEvent(achievement);

        } catch (error) {
            console.error('Error awarding achievement:', error);
        }
    }

    async updateUserStats(points) {
        const userId = this.auth.currentUser?.uid;
        if (!userId) return;

        try {
            const userStatsRef = this.db.collection('user_stats').doc(userId);
            await userStatsRef.set({
                totalPoints: firebase.firestore.FieldValue.increment(points),
                achievementCount: firebase.firestore.FieldValue.increment(1),
                lastAchievementAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('Error updating user stats:', error);
        }
    }

    showAchievementNotification(achievement) {
        // Create achievement popup
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            z-index: 10001;
            text-align: center;
            min-width: 300px;
            animation: achievementSlideIn 0.5s ease-out;
        `;

        notification.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 10px;">${achievement.icon}</div>
            <h3 style="margin: 0 0 10px 0; font-size: 24px;">Achievement Unlocked!</h3>
            <h4 style="margin: 0 0 5px 0; color: #ffd700;">${achievement.title}</h4>
            <p style="margin: 0 0 15px 0; opacity: 0.9;">${achievement.description}</p>
            <div style="display: flex; justify-content: center; gap: 15px; align-items: center;">
                <span style="background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 20px; font-size: 12px;">
                    +${achievement.points} points
                </span>
                <span style="background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 20px; font-size: 12px;">
                    ${achievement.badge} badge
                </span>
            </div>
            <button onclick="this.parentElement.remove()" style="
                position: absolute;
                top: 10px;
                right: 15px;
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                opacity: 0.7;
            ">×</button>
        `;

        // Add animation styles
        if (!document.getElementById('achievement-styles')) {
            const style = document.createElement('style');
            style.id = 'achievement-styles';
            style.textContent = `
                @keyframes achievementSlideIn {
                    0% {
                        transform: translate(-50%, -50%) scale(0.5);
                        opacity: 0;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto remove after 8 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 8000);

        // Play achievement sound (if enabled)
        this.playAchievementSound();
    }

    playAchievementSound() {
        if (window.userPreferencesManager?.getPreference('soundEffects')) {
            // Create and play achievement sound
            const audio = new Audio();
            audio.src = 'data:audio/wav;base64,UklGRvIAAABXQVZFZm10IBAAAAABAAIAAKDXAAHAKQAAAKDFAAACABIASHJOA...'; // Achievement sound
            audio.volume = 0.3;
            audio.play().catch(() => {}); // Ignore autoplay policy errors
        }
    }

    triggerAchievementEvent(achievement) {
        // Dispatch custom event for other systems to listen to
        window.dispatchEvent(new CustomEvent('achievementEarned', {
            detail: achievement
        }));
    }

    // Public API Methods
    getCurrentApp() {
        const path = window.location.pathname;
        const fileName = path.split('/').pop();
        return fileName.replace(/\.(html|htm)$/, '');
    }

    async getUserAchievements(userId) {
        try {
            const snapshot = await this.db.collection('user_achievements')
                .where('userId', '==', userId)
                .orderBy('earnedAt', 'desc')
                .get();

            const achievements = [];
            snapshot.forEach(doc => {
                achievements.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return achievements;
        } catch (error) {
            console.error('Error getting user achievements:', error);
            return [];
        }
    }

    async getUserStats(userId) {
        try {
            const doc = await this.db.collection('user_stats').doc(userId).get();
            return doc.exists ? doc.data() : {
                totalPoints: 0,
                achievementCount: 0
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            return { totalPoints: 0, achievementCount: 0 };
        }
    }

    async getLeaderboard(limit = 10) {
        try {
            const snapshot = await this.db.collection('user_stats')
                .orderBy('totalPoints', 'desc')
                .limit(limit)
                .get();

            const leaderboard = [];
            snapshot.forEach(doc => {
                leaderboard.push({
                    userId: doc.id,
                    ...doc.data()
                });
            });

            return leaderboard;
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            return [];
        }
    }

    getAchievementProgress(achievementId) {
        const achievement = this.achievements.get(achievementId);
        if (!achievement) return null;

        const currentProgress = this.getProgress(achievement.metric);
        const percentage = Math.min(100, (currentProgress / achievement.threshold) * 100);

        return {
            current: currentProgress,
            required: achievement.threshold,
            percentage: percentage,
            completed: currentProgress >= achievement.threshold
        };
    }

    getAllAchievements() {
        return Array.from(this.achievements.values());
    }

    getAchievementsByCategory(category) {
        return Array.from(this.achievements.values())
            .filter(achievement => achievement.category === category);
    }
}

// Initialize Achievement System
if (typeof window !== 'undefined') {
    window.AchievementSystem = AchievementSystem;
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.achievementSystem = new AchievementSystem();
        });
    } else {
        window.achievementSystem = new AchievementSystem();
    }
}

export default AchievementSystem;
