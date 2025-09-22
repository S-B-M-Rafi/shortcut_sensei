// AI-Powered Recommendation System
// Provides personalized shortcut recommendations and learning paths

class RecommendationEngine {
    constructor() {
        this.userProfile = new Map();
        this.shortcutDatabase = new Map();
        this.appUsagePatterns = new Map();
        this.initializeRecommendationEngine();
    }

    initializeRecommendationEngine() {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            this.setupRecommendationSystem();
        }
    }

    setupRecommendationSystem() {
        // Setup user behavior tracking
        this.trackUserBehavior();
        
        // Load recommendation data
        this.loadRecommendationData();
        
        // Setup real-time learning
        this.setupRealTimeLearning();
        
        // Initialize recommendation algorithms
        this.initializeAlgorithms();
    }

    // User Behavior Tracking
    trackUserBehavior() {
        // Track shortcut usage patterns
        document.addEventListener('click', (e) => {
            const shortcutElement = e.target.closest('.key-combo, .shortcut-key, [data-shortcut]');
            if (shortcutElement) {
                this.recordShortcutInteraction(shortcutElement);
            }
        });

        // Track app navigation patterns
        this.trackAppNavigation();
        
        // Track search behavior
        this.trackSearchBehavior();
        
        // Track time spent on different sections
        this.trackTimeSpent();
    }

    recordShortcutInteraction(element) {
        const shortcut = element.textContent || element.dataset.shortcut;
        const app = this.getCurrentApp();
        const category = this.getShortcutCategory(element);
        const difficulty = this.getShortcutDifficulty(element);

        const interaction = {
            shortcut: shortcut,
            app: app,
            category: category,
            difficulty: difficulty,
            timestamp: Date.now(),
            action: 'click'
        };

        this.saveUserInteraction(interaction);
        this.updateUserProfile(interaction);
    }

    trackAppNavigation() {
        const currentApp = this.getCurrentApp();
        const visitTime = Date.now();
        
        // Record app visit
        this.recordAppVisit(currentApp, visitTime);
        
        // Track time spent when leaving
        window.addEventListener('beforeunload', () => {
            const timeSpent = Date.now() - visitTime;
            this.recordTimeSpent(currentApp, timeSpent);
        });
    }

    trackSearchBehavior() {
        document.addEventListener('search_performed', (e) => {
            const searchData = {
                query: e.detail.query,
                results: e.detail.results,
                timestamp: Date.now()
            };
            
            this.recordSearchBehavior(searchData);
        });
    }

    // Data Loading and Management
    async loadRecommendationData() {
        try {
            // Load user profile
            await this.loadUserProfile();
            
            // Load shortcut database
            await this.loadShortcutDatabase();
            
            // Load usage patterns
            await this.loadUsagePatterns();
            
            // Load collaborative filtering data
            await this.loadCollaborativeData();
            
        } catch (error) {
            console.error('Error loading recommendation data:', error);
        }
    }

    async loadUserProfile() {
        const userId = this.auth.currentUser?.uid;
        if (!userId) return;

        try {
            const doc = await this.db.collection('user_profiles').doc(userId).get();
            if (doc.exists) {
                const profile = doc.data();
                this.userProfile = new Map(Object.entries(profile));
            } else {
                // Create new user profile
                await this.createUserProfile();
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    async createUserProfile() {
        const userId = this.auth.currentUser?.uid;
        if (!userId) return;

        const defaultProfile = {
            skill_level: 'intermediate',
            preferred_apps: [],
            learning_goals: [],
            usage_patterns: {},
            interaction_history: [],
            preferences: {
                difficulty_preference: 'progressive',
                learning_style: 'visual',
                notification_frequency: 'daily'
            },
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
            updated_at: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            await this.db.collection('user_profiles').doc(userId).set(defaultProfile);
            this.userProfile = new Map(Object.entries(defaultProfile));
        } catch (error) {
            console.error('Error creating user profile:', error);
        }
    }

    async loadShortcutDatabase() {
        try {
            const snapshot = await this.db.collection('shortcuts_analyzed').get();
            
            snapshot.forEach(doc => {
                const shortcut = doc.data();
                this.shortcutDatabase.set(doc.id, shortcut);
            });
        } catch (error) {
            console.error('Error loading shortcut database:', error);
        }
    }

    // Recommendation Algorithms
    initializeAlgorithms() {
        this.algorithms = {
            collaborative: new CollaborativeFiltering(this),
            contentBased: new ContentBasedFiltering(this),
            skillBased: new SkillBasedRecommendation(this),
            sequenceBased: new SequenceBasedRecommendation(this),
            contextual: new ContextualRecommendation(this)
        };
    }

    async generatePersonalizedRecommendations(options = {}) {
        const {
            count = 10,
            type = 'mixed',
            context = 'general'
        } = options;

        try {
            const recommendations = [];

            // Get recommendations from different algorithms
            const collaborativeRecs = await this.algorithms.collaborative.getRecommendations(count / 2);
            const contentBasedRecs = await this.algorithms.contentBased.getRecommendations(count / 2);
            const skillBasedRecs = await this.algorithms.skillBased.getRecommendations(count / 2);
            const contextualRecs = await this.algorithms.contextual.getRecommendations(context, count / 2);

            // Combine and weight recommendations
            const allRecs = [
                ...collaborativeRecs.map(r => ({ ...r, source: 'collaborative', weight: 0.3 })),
                ...contentBasedRecs.map(r => ({ ...r, source: 'content', weight: 0.25 })),
                ...skillBasedRecs.map(r => ({ ...r, source: 'skill', weight: 0.25 })),
                ...contextualRecs.map(r => ({ ...r, source: 'contextual', weight: 0.2 }))
            ];

            // Apply ensemble method
            const finalRecommendations = this.ensembleRecommendations(allRecs, count);

            // Save recommendations for tracking
            await this.saveRecommendations(finalRecommendations);

            return finalRecommendations;

        } catch (error) {
            console.error('Error generating recommendations:', error);
            return this.getFallbackRecommendations(count);
        }
    }

    ensembleRecommendations(recommendations, count) {
        // Group by shortcut and calculate combined score
        const shortcutScores = new Map();
        
        recommendations.forEach(rec => {
            const key = `${rec.app}:${rec.shortcut}`;
            if (!shortcutScores.has(key)) {
                shortcutScores.set(key, {
                    ...rec,
                    combinedScore: 0,
                    sources: []
                });
            }
            
            const existing = shortcutScores.get(key);
            existing.combinedScore += rec.score * rec.weight;
            existing.sources.push(rec.source);
        });

        // Sort by combined score and return top results
        return Array.from(shortcutScores.values())
            .sort((a, b) => b.combinedScore - a.combinedScore)
            .slice(0, count)
            .map(rec => ({
                app: rec.app,
                shortcut: rec.shortcut,
                description: rec.description,
                category: rec.category,
                difficulty: rec.difficulty,
                score: rec.combinedScore,
                confidence: this.calculateConfidence(rec.sources),
                reasoning: this.generateReasoning(rec.sources, rec.score)
            }));
    }

    calculateConfidence(sources) {
        // More sources = higher confidence
        const uniqueSources = new Set(sources);
        return Math.min(uniqueSources.size * 0.25, 1.0);
    }

    generateReasoning(sources, score) {
        const reasons = [];
        
        if (sources.includes('collaborative')) {
            reasons.push('Similar users found this helpful');
        }
        if (sources.includes('content')) {
            reasons.push('Matches your interests');
        }
        if (sources.includes('skill')) {
            reasons.push('Appropriate for your skill level');
        }
        if (sources.includes('contextual')) {
            reasons.push('Relevant to current context');
        }

        return reasons.join(', ');
    }

    // Learning Path Generation
    async generateLearningPath(goal, duration = 30) {
        try {
            const userSkillLevel = this.userProfile.get('skill_level') || 'intermediate';
            const preferredApps = this.userProfile.get('preferred_apps') || [];
            
            const path = {
                goal: goal,
                duration: duration,
                skillLevel: userSkillLevel,
                milestones: [],
                totalShortcuts: 0,
                estimatedTimeToComplete: 0
            };

            // Generate daily learning goals
            for (let day = 1; day <= duration; day++) {
                const dayGoal = await this.generateDayLearningGoal(day, userSkillLevel, preferredApps);
                path.milestones.push(dayGoal);
                path.totalShortcuts += dayGoal.shortcuts.length;
                path.estimatedTimeToComplete += dayGoal.estimatedTime;
            }

            // Save learning path
            await this.saveLearningPath(path);

            return path;

        } catch (error) {
            console.error('Error generating learning path:', error);
            return null;
        }
    }

    async generateDayLearningGoal(day, skillLevel, preferredApps) {
        const shortcutsPerDay = this.getShortcutsPerDay(skillLevel);
        const difficulty = this.getDifficultyProgression(day, skillLevel);
        
        const dayShortcuts = await this.selectShortcutsForDay(
            shortcutsPerDay,
            difficulty,
            preferredApps,
            day
        );

        return {
            day: day,
            theme: this.getDayTheme(day),
            shortcuts: dayShortcuts,
            difficulty: difficulty,
            estimatedTime: shortcutsPerDay * 2, // 2 minutes per shortcut
            practice_exercises: this.generatePracticeExercises(dayShortcuts)
        };
    }

    // Real-time Learning and Adaptation
    setupRealTimeLearning() {
        // Adapt recommendations based on real-time feedback
        this.setupFeedbackCollection();
        
        // Update user profile based on behavior
        this.setupProfileUpdates();
        
        // Retrain models periodically
        this.setupModelRetraining();
    }

    setupFeedbackCollection() {
        // Track recommendation clicks
        document.addEventListener('recommendation_clicked', (e) => {
            this.recordRecommendationFeedback(e.detail, 'clicked');
        });

        // Track recommendation dismissals
        document.addEventListener('recommendation_dismissed', (e) => {
            this.recordRecommendationFeedback(e.detail, 'dismissed');
        });

        // Track shortcut usage after recommendation
        document.addEventListener('shortcut_used_from_recommendation', (e) => {
            this.recordRecommendationFeedback(e.detail, 'used');
        });
    }

    async recordRecommendationFeedback(recommendation, action) {
        const userId = this.auth.currentUser?.uid;
        if (!userId) return;

        const feedback = {
            userId: userId,
            recommendationId: recommendation.id,
            action: action,
            shortcut: recommendation.shortcut,
            app: recommendation.app,
            score: recommendation.score,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            await this.db.collection('recommendation_feedback').add(feedback);
            
            // Update recommendation score in real-time
            this.updateRecommendationScore(recommendation, action);
            
        } catch (error) {
            console.error('Error recording feedback:', error);
        }
    }

    updateRecommendationScore(recommendation, action) {
        const scoreAdjustments = {
            'clicked': 0.1,
            'used': 0.2,
            'dismissed': -0.1,
            'ignored': -0.05
        };

        const adjustment = scoreAdjustments[action] || 0;
        recommendation.score = Math.max(0, Math.min(1, recommendation.score + adjustment));
    }

    // Contextual Recommendations
    async getContextualRecommendations(context = {}) {
        const {
            currentApp = this.getCurrentApp(),
            timeOfDay = new Date().getHours(),
            dayOfWeek = new Date().getDay(),
            userActivity = 'browsing'
        } = context;

        try {
            // Get recommendations based on current context
            const contextualRecs = await this.algorithms.contextual.getRecommendations(context);
            
            // Apply time-based filtering
            const timeFiltered = this.applyTimeBasedFiltering(contextualRecs, timeOfDay);
            
            // Apply activity-based boost
            const activityBoosted = this.applyActivityBoost(timeFiltered, userActivity);
            
            return activityBoosted.slice(0, 5);
            
        } catch (error) {
            console.error('Error getting contextual recommendations:', error);
            return [];
        }
    }

    applyTimeBasedFiltering(recommendations, hour) {
        // Boost productivity shortcuts during work hours
        const isWorkHour = hour >= 9 && hour <= 17;
        
        return recommendations.map(rec => {
            if (isWorkHour && rec.category === 'productivity') {
                rec.score *= 1.2;
            } else if (!isWorkHour && rec.category === 'entertainment') {
                rec.score *= 1.1;
            }
            return rec;
        });
    }

    applyActivityBoost(recommendations, activity) {
        const activityBoosts = {
            'editing': ['editing', 'formatting'],
            'browsing': ['navigation', 'tabs'],
            'coding': ['development', 'debugging'],
            'designing': ['creative', 'tools']
        };

        const boostCategories = activityBoosts[activity] || [];
        
        return recommendations.map(rec => {
            if (boostCategories.includes(rec.category)) {
                rec.score *= 1.15;
            }
            return rec;
        });
    }

    // Utility Methods
    getCurrentApp() {
        const path = window.location.pathname;
        const fileName = path.split('/').pop();
        
        const appMapping = {
            'Google Chrome.html': 'Chrome',
            'Microsoft Excell.htm': 'Excel',
            'Microsoft Word.htm': 'Word',
            'Microsoft PowerPoint.htm': 'PowerPoint',
            'Adobe PhotoShop.html': 'Photoshop'
        };

        return appMapping[fileName] || fileName.replace(/\.(html|htm)$/, '');
    }

    getShortcutCategory(element) {
        const row = element.closest('tr');
        const section = element.closest('section, .shortcuts-section');
        
        // Try to extract category from section title
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

    getShortcutsPerDay(skillLevel) {
        const counts = {
            'beginner': 3,
            'intermediate': 5,
            'advanced': 7,
            'expert': 10
        };
        return counts[skillLevel] || 5;
    }

    getDifficultyProgression(day, skillLevel) {
        // Gradually increase difficulty over time
        const baseDifficulty = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 }[skillLevel] || 2;
        const progressionFactor = Math.floor(day / 7) * 0.5; // Increase every week
        
        return Math.min(4, baseDifficulty + progressionFactor);
    }

    getDayTheme(day) {
        const themes = [
            'Navigation Basics', 'Text Editing', 'File Management', 'Browser Mastery',
            'Productivity Boost', 'Advanced Techniques', 'Creative Tools',
            'Developer Shortcuts', 'System Navigation', 'Multi-tasking'
        ];
        
        return themes[(day - 1) % themes.length];
    }

    async getFallbackRecommendations(count) {
        // Return popular shortcuts as fallback
        const popular = [
            { app: 'Chrome', shortcut: 'Ctrl+T', description: 'Open new tab', category: 'navigation', difficulty: 'beginner', score: 0.9 },
            { app: 'Excel', shortcut: 'Ctrl+C', description: 'Copy selection', category: 'editing', difficulty: 'beginner', score: 0.85 },
            { app: 'Word', shortcut: 'Ctrl+B', description: 'Bold text', category: 'formatting', difficulty: 'beginner', score: 0.8 }
        ];
        
        return popular.slice(0, count);
    }

    // Data Persistence
    async saveUserInteraction(interaction) {
        const userId = this.auth.currentUser?.uid;
        if (!userId) return;

        try {
            await this.db.collection('user_interactions').add({
                userId: userId,
                ...interaction,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error saving interaction:', error);
        }
    }

    async saveRecommendations(recommendations) {
        const userId = this.auth.currentUser?.uid;
        if (!userId) return;

        try {
            await this.db.collection('user_recommendations').doc(userId).set({
                recommendations: recommendations,
                generatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                version: Date.now()
            }, { merge: true });
        } catch (error) {
            console.error('Error saving recommendations:', error);
        }
    }

    async saveLearningPath(path) {
        const userId = this.auth.currentUser?.uid;
        if (!userId) return;

        try {
            await this.db.collection('learning_paths').add({
                userId: userId,
                ...path,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error saving learning path:', error);
        }
    }

    updateUserProfile(interaction) {
        // Update user profile based on interactions
        const apps = this.userProfile.get('preferred_apps') || [];
        if (!apps.includes(interaction.app)) {
            apps.push(interaction.app);
            this.userProfile.set('preferred_apps', apps);
        }

        // Update usage patterns
        const patterns = this.userProfile.get('usage_patterns') || {};
        patterns[interaction.app] = (patterns[interaction.app] || 0) + 1;
        this.userProfile.set('usage_patterns', patterns);

        // Save updated profile
        this.saveUserProfile();
    }

    async saveUserProfile() {
        const userId = this.auth.currentUser?.uid;
        if (!userId) return;

        try {
            const profileData = Object.fromEntries(this.userProfile);
            await this.db.collection('user_profiles').doc(userId).set({
                ...profileData,
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('Error saving user profile:', error);
        }
    }

    // Public API Methods
    async getRecommendationsForUser(options = {}) {
        return await this.generatePersonalizedRecommendations(options);
    }

    async getLearningPathForUser(goal, duration) {
        return await this.generateLearningPath(goal, duration);
    }

    async getContextualRecommendationsForUser(context) {
        return await this.getContextualRecommendations(context);
    }
}

// Collaborative Filtering Algorithm
class CollaborativeFiltering {
    constructor(engine) {
        this.engine = engine;
    }

    async getRecommendations(count) {
        // Simplified collaborative filtering
        try {
            const userSimilarities = await this.findSimilarUsers();
            const recommendations = await this.generateFromSimilarUsers(userSimilarities);
            return recommendations.slice(0, count);
        } catch (error) {
            console.error('Collaborative filtering error:', error);
            return [];
        }
    }

    async findSimilarUsers() {
        // Find users with similar interaction patterns
        const currentUserId = this.engine.auth.currentUser?.uid;
        if (!currentUserId) return [];

        const snapshot = await this.engine.db.collection('user_interactions')
            .where('userId', '!=', currentUserId)
            .limit(1000)
            .get();

        // Calculate similarity scores
        const userInteractions = new Map();
        snapshot.forEach(doc => {
            const data = doc.data();
            if (!userInteractions.has(data.userId)) {
                userInteractions.set(data.userId, []);
            }
            userInteractions.get(data.userId).push(data);
        });

        return this.calculateUserSimilarities(userInteractions);
    }

    calculateUserSimilarities(userInteractions) {
        // Simple Jaccard similarity for now
        const currentUserApps = this.engine.userProfile.get('preferred_apps') || [];
        const similarities = [];

        userInteractions.forEach((interactions, userId) => {
            const userApps = [...new Set(interactions.map(i => i.app))];
            const intersection = currentUserApps.filter(app => userApps.includes(app));
            const union = [...new Set([...currentUserApps, ...userApps])];
            const similarity = intersection.length / union.length;

            if (similarity > 0.1) {
                similarities.push({ userId, similarity, interactions });
            }
        });

        return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, 10);
    }

    async generateFromSimilarUsers(similarUsers) {
        const recommendations = [];
        
        similarUsers.forEach(user => {
            user.interactions.forEach(interaction => {
                const existing = recommendations.find(r => 
                    r.app === interaction.app && r.shortcut === interaction.shortcut
                );
                
                if (existing) {
                    existing.score += user.similarity * 0.1;
                } else {
                    recommendations.push({
                        app: interaction.app,
                        shortcut: interaction.shortcut,
                        description: interaction.description || '',
                        category: interaction.category,
                        difficulty: interaction.difficulty,
                        score: user.similarity * 0.5
                    });
                }
            });
        });

        return recommendations.sort((a, b) => b.score - a.score);
    }
}

// Content-Based Filtering Algorithm
class ContentBasedFiltering {
    constructor(engine) {
        this.engine = engine;
    }

    async getRecommendations(count) {
        const userApps = this.engine.userProfile.get('preferred_apps') || [];
        const usagePatterns = this.engine.userProfile.get('usage_patterns') || {};
        
        const recommendations = [];
        
        // Recommend shortcuts from preferred apps
        userApps.forEach(app => {
            const appShortcuts = this.getShortcutsForApp(app);
            appShortcuts.forEach(shortcut => {
                const score = this.calculateContentScore(shortcut, usagePatterns);
                recommendations.push({
                    ...shortcut,
                    score: score
                });
            });
        });

        return recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, count);
    }

    getShortcutsForApp(app) {
        // Get shortcuts for specific app from database
        return Array.from(this.engine.shortcutDatabase.values())
            .filter(shortcut => shortcut.app === app);
    }

    calculateContentScore(shortcut, usagePatterns) {
        let score = 0.5; // Base score
        
        // Boost based on app usage
        const appUsage = usagePatterns[shortcut.app] || 0;
        score += Math.min(appUsage * 0.01, 0.3);
        
        // Adjust for difficulty preference
        const userSkillLevel = this.engine.userProfile.get('skill_level');
        if (this.isDifficultyMatch(shortcut.difficulty, userSkillLevel)) {
            score += 0.2;
        }
        
        return Math.min(score, 1.0);
    }

    isDifficultyMatch(shortcutDifficulty, userSkillLevel) {
        const levels = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
        const userLevel = levels[userSkillLevel] || 2;
        const shortcutLevel = levels[shortcutDifficulty] || 2;
        
        return Math.abs(userLevel - shortcutLevel) <= 1;
    }
}

// Skill-Based Recommendation Algorithm
class SkillBasedRecommendation {
    constructor(engine) {
        this.engine = engine;
    }

    async getRecommendations(count) {
        const userSkillLevel = this.engine.userProfile.get('skill_level') || 'intermediate';
        const progressiveShortcuts = this.getProgressiveShortcuts(userSkillLevel);
        
        return progressiveShortcuts.slice(0, count);
    }

    getProgressiveShortcuts(skillLevel) {
        const shortcuts = Array.from(this.engine.shortcutDatabase.values());
        const targetDifficulty = this.getTargetDifficulty(skillLevel);
        
        return shortcuts
            .filter(shortcut => shortcut.difficulty === targetDifficulty)
            .map(shortcut => ({
                ...shortcut,
                score: 0.8 // High confidence for skill-matched shortcuts
            }))
            .sort(() => Math.random() - 0.5); // Randomize order
    }

    getTargetDifficulty(skillLevel) {
        const nextLevel = {
            'beginner': 'intermediate',
            'intermediate': 'advanced',
            'advanced': 'expert',
            'expert': 'expert'
        };
        
        return nextLevel[skillLevel] || 'intermediate';
    }
}

// Sequence-Based Recommendation Algorithm
class SequenceBasedRecommendation {
    constructor(engine) {
        this.engine = engine;
    }

    async getRecommendations(count) {
        // Recommend shortcuts that are commonly used together
        const lastUsedShortcuts = this.getRecentShortcuts();
        const sequenceRecs = this.findCommonSequences(lastUsedShortcuts);
        
        return sequenceRecs.slice(0, count);
    }

    getRecentShortcuts() {
        // Get last 10 shortcuts used by user
        const interactions = this.engine.userProfile.get('interaction_history') || [];
        return interactions.slice(-10);
    }

    findCommonSequences(recentShortcuts) {
        // Simple sequence analysis - could be enhanced with sequence mining algorithms
        const recommendations = [];
        
        recentShortcuts.forEach(shortcut => {
            const related = this.getRelatedShortcuts(shortcut);
            related.forEach(rel => {
                recommendations.push({
                    ...rel,
                    score: 0.6
                });
            });
        });
        
        return recommendations;
    }

    getRelatedShortcuts(shortcut) {
        // Find shortcuts in same category or app
        return Array.from(this.engine.shortcutDatabase.values())
            .filter(s => 
                s.app === shortcut.app && 
                s.category === shortcut.category &&
                s.shortcut !== shortcut.shortcut
            );
    }
}

// Contextual Recommendation Algorithm
class ContextualRecommendation {
    constructor(engine) {
        this.engine = engine;
    }

    async getRecommendations(context, count) {
        const contextualShortcuts = this.getContextualShortcuts(context);
        return contextualShortcuts.slice(0, count);
    }

    getContextualShortcuts(context) {
        const shortcuts = Array.from(this.engine.shortcutDatabase.values());
        
        return shortcuts
            .filter(shortcut => this.isContextuallyRelevant(shortcut, context))
            .map(shortcut => ({
                ...shortcut,
                score: this.calculateContextualScore(shortcut, context)
            }))
            .sort((a, b) => b.score - a.score);
    }

    isContextuallyRelevant(shortcut, context) {
        // Check if shortcut is relevant to current context
        if (context.currentApp && shortcut.app !== context.currentApp) {
            return false;
        }
        
        return true;
    }

    calculateContextualScore(shortcut, context) {
        let score = 0.5;
        
        // Boost if matches current app
        if (context.currentApp === shortcut.app) {
            score += 0.3;
        }
        
        // Boost based on time of day
        if (context.timeOfDay >= 9 && context.timeOfDay <= 17) {
            if (shortcut.category === 'productivity') score += 0.2;
        }
        
        return Math.min(score, 1.0);
    }
}

// Initialize Recommendation Engine
if (typeof window !== 'undefined') {
    window.RecommendationEngine = RecommendationEngine;
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.recommendationEngine = new RecommendationEngine();
        });
    } else {
        window.recommendationEngine = new RecommendationEngine();
    }
}

export default RecommendationEngine;
