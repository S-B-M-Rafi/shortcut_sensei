/**
 * Gamification Demo Script
 * Demonstrates all the gamification features working together
 */

class GamificationDemo {
    constructor() {
        this.demoSteps = [
            { name: 'Learn Shortcut', action: () => this.demoLearnShortcut() },
            { name: 'Complete Quiz', action: () => this.demoCompleteQuiz() },
            { name: 'Daily Streak', action: () => this.demoDailyStreak() },
            { name: 'Unlock Badge', action: () => this.demoUnlockBadge() },
            { name: 'Level Up', action: () => this.demoLevelUp() },
            { name: 'Show Stats', action: () => this.demoShowStats() }
        ];
        
        this.currentStep = 0;
        this.init();
    }

    init() {
        // Wait for gamification system to be ready
        document.addEventListener('gamificationReady', () => {
            console.log('🎮 Gamification Demo Ready!');
            this.createDemoUI();
        });

        // If already ready, create UI immediately
        setTimeout(() => {
            if (window.gamificationIntegration?.isReady()) {
                this.createDemoUI();
            }
        }, 1000);
    }

    createDemoUI() {
        // Create demo control panel
        const demoPanel = document.createElement('div');
        demoPanel.id = 'demo-panel';
        demoPanel.className = 'demo-panel';
        demoPanel.innerHTML = `
            <div class="demo-header">
                <h3>🎮 Gamification Demo</h3>
                <button id="demo-toggle" class="demo-toggle">Show/Hide</button>
            </div>
            <div class="demo-content">
                <div class="demo-buttons">
                    ${this.demoSteps.map((step, index) => 
                        `<button class="demo-btn" data-step="${index}">${step.name}</button>`
                    ).join('')}
                </div>
                <div class="demo-info">
                    <div id="demo-status">Ready to demo gamification features!</div>
                    <div id="demo-results"></div>
                </div>
                <div class="demo-actions">
                    <button id="reset-demo" class="demo-btn-secondary">Reset All Data</button>
                    <button id="auto-demo" class="demo-btn-primary">Auto Demo</button>
                </div>
            </div>
        `;

        // Add demo panel to page
        document.body.appendChild(demoPanel);

        // Add demo styles
        this.addDemoStyles();

        // Set up event listeners
        this.setupDemoEvents();
    }

    addDemoStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .demo-panel {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 300px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                overflow: hidden;
            }

            .demo-header {
                background: rgba(0,0,0,0.2);
                padding: 15px;
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .demo-header h3 {
                margin: 0;
                font-size: 16px;
            }

            .demo-toggle {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
            }

            .demo-content {
                padding: 15px;
                color: white;
                max-height: 400px;
                overflow-y: auto;
            }

            .demo-content.hidden {
                display: none;
            }

            .demo-buttons {
                display: grid;
                gap: 8px;
                margin-bottom: 15px;
            }

            .demo-btn {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 10px;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 14px;
            }

            .demo-btn:hover {
                background: rgba(255,255,255,0.3);
                transform: translateY(-1px);
            }

            .demo-btn-primary {
                background: #4CAF50;
                border: none;
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                margin-right: 10px;
            }

            .demo-btn-secondary {
                background: #f44336;
                border: none;
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                cursor: pointer;
            }

            .demo-info {
                background: rgba(0,0,0,0.2);
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 15px;
                font-size: 12px;
            }

            .demo-actions {
                display: flex;
                gap: 10px;
            }

            #demo-status {
                font-weight: bold;
                margin-bottom: 5px;
            }

            #demo-results {
                font-size: 11px;
                opacity: 0.8;
                max-height: 100px;
                overflow-y: auto;
            }
        `;
        document.head.appendChild(style);
    }

    setupDemoEvents() {
        // Toggle demo panel
        document.getElementById('demo-toggle').addEventListener('click', () => {
            const content = document.querySelector('.demo-content');
            content.classList.toggle('hidden');
        });

        // Demo step buttons
        document.querySelectorAll('.demo-btn[data-step]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const step = parseInt(e.target.dataset.step);
                this.runDemoStep(step);
            });
        });

        // Reset button
        document.getElementById('reset-demo').addEventListener('click', () => {
            this.resetAllData();
        });

        // Auto demo button
        document.getElementById('auto-demo').addEventListener('click', () => {
            this.runAutoDemo();
        });
    }

    runDemoStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.demoSteps.length) return;

        const step = this.demoSteps[stepIndex];
        this.updateStatus(`Running: ${step.name}...`);
        
        try {
            step.action();
            this.updateStatus(`✅ ${step.name} completed!`);
        } catch (error) {
            this.updateStatus(`❌ ${step.name} failed: ${error.message}`);
            console.error('Demo step error:', error);
        }
    }

    async runAutoDemo() {
        this.updateStatus('🚀 Running auto demo...');
        
        for (let i = 0; i < this.demoSteps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.runDemoStep(i);
        }
        
        this.updateStatus('🎉 Auto demo completed!');
    }

    demoLearnShortcut() {
        const shortcut = {
            name: 'Copy',
            keys: 'Ctrl+C',
            application: 'Windows',
            difficulty: 'beginner',
            description: 'Copy selected text or item'
        };

        window.gamificationIntegration?.recordShortcutLearned(shortcut);
        this.addResult('📚 Learned shortcut: Ctrl+C');
    }

    demoCompleteQuiz() {
        window.gamificationIntegration?.recordQuizCompleted(8, 10, 'Microsoft Word');
        this.addResult('🎯 Completed quiz: 8/10 in Microsoft Word');
    }

    demoDailyStreak() {
        const streakSystem = window.gamificationIntegration?.getSystem('streakSystem');
        if (streakSystem) {
            streakSystem.recordActivity('shortcut_learned');
            streakSystem.recordActivity('quiz_completed');
            streakSystem.recordActivity('study_time', 300); // 5 minutes
            this.addResult('🔥 Updated daily streaks');
        }
    }

    demoUnlockBadge() {
        const badgeSystem = window.gamificationIntegration?.getSystem('badgeSystem');
        if (badgeSystem) {
            // Force unlock first shortcut badge
            badgeSystem.updateProgress('shortcuts_learned', 1);
            this.addResult('🏆 Checked for badge unlocks');
        }
    }

    demoLevelUp() {
        const progressTracker = window.gamificationIntegration?.getSystem('progressTracker');
        if (progressTracker) {
            progressTracker.addExperience(500, 'Demo XP boost');
            this.addResult('⬆️ Added 500 XP');
        }
    }

    demoShowStats() {
        const stats = window.gamificationIntegration?.getSystemStats();
        if (stats) {
            console.log('📊 Current Stats:', stats);
            this.addResult(`📊 Stats: Level ${stats.progress?.level}, ${stats.progress?.experience} XP`);
            
            // Update UI widgets
            const levelWidget = document.getElementById('user-level');
            const xpWidget = document.getElementById('user-xp');
            const badgeWidget = document.getElementById('badge-count');
            
            if (levelWidget) levelWidget.textContent = `Level ${stats.progress?.level || 1}`;
            if (xpWidget) xpWidget.textContent = `${stats.progress?.experience || 0} XP`;
            if (badgeWidget) badgeWidget.textContent = stats.badges?.length || 0;
        }
    }

    resetAllData() {
        if (confirm('Are you sure you want to reset all gamification data?')) {
            localStorage.removeItem('shortcutSensei_progress');
            localStorage.removeItem('shortcutSensei_badges');
            localStorage.removeItem('shortcutSensei_streaks');
            localStorage.removeItem('shortcutSensei_shortcutOfTheDay');
            
            this.updateStatus('🔄 All data reset! Refresh page to see changes.');
            this.addResult('🗑️ All progress data cleared');
        }
    }

    updateStatus(message) {
        const statusElement = document.getElementById('demo-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    addResult(result) {
        const resultsElement = document.getElementById('demo-results');
        if (resultsElement) {
            const timestamp = new Date().toLocaleTimeString();
            resultsElement.innerHTML += `<div>[${timestamp}] ${result}</div>`;
            resultsElement.scrollTop = resultsElement.scrollHeight;
        }
    }
}

// Initialize demo when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add demo toggle to existing UI if available
    setTimeout(() => {
        new GamificationDemo();
    }, 1000);
});

// Global access
window.GamificationDemo = GamificationDemo;
