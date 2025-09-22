// Dynamic Shortcut of the Day System
class ShortcutOfTheDaySystem {
    constructor() {
        this.shortcuts = this.initializeShortcuts();
        this.storageKey = 'shortcut_sensei_daily_shortcuts';
        this.historyKey = 'shortcut_sensei_shortcut_history';
        this.currentShortcut = null;
        this.shortcutHistory = this.loadShortcutHistory();
        this.initializeToday();
    }

    initializeShortcuts() {
        return [
            // Basic Computer Shortcuts
            {
                id: 'ctrl_c',
                combination: 'Ctrl + C',
                description: 'Copy selected text or item',
                application: 'Universal',
                category: 'basic',
                difficulty: 'beginner',
                tip: 'Works in almost every application. Master this first!',
                relatedShortcuts: ['ctrl_v', 'ctrl_x']
            },
            {
                id: 'ctrl_v',
                combination: 'Ctrl + V',
                description: 'Paste copied text or item',
                application: 'Universal',
                category: 'basic',
                difficulty: 'beginner',
                tip: 'Always follows Ctrl+C. These two shortcuts go hand in hand.',
                relatedShortcuts: ['ctrl_c', 'ctrl_z']
            },
            {
                id: 'ctrl_z',
                combination: 'Ctrl + Z',
                description: 'Undo last action',
                application: 'Universal',
                category: 'basic',
                difficulty: 'beginner',
                tip: 'Made a mistake? This shortcut is your best friend!',
                relatedShortcuts: ['ctrl_y', 'ctrl_v']
            },
            {
                id: 'ctrl_y',
                combination: 'Ctrl + Y',
                description: 'Redo last undone action',
                application: 'Universal',
                category: 'basic',
                difficulty: 'beginner',
                tip: 'Undo the undo! Perfect for when you change your mind.',
                relatedShortcuts: ['ctrl_z']
            },
            {
                id: 'ctrl_a',
                combination: 'Ctrl + A',
                description: 'Select all text or items',
                application: 'Universal',
                category: 'basic',
                difficulty: 'beginner',
                tip: 'Quick way to select everything in a document or folder.',
                relatedShortcuts: ['ctrl_c', 'delete']
            },

            // Windows Navigation
            {
                id: 'alt_tab',
                combination: 'Alt + Tab',
                description: 'Switch between open applications',
                application: 'Windows',
                category: 'navigation',
                difficulty: 'beginner',
                tip: 'Hold Alt and press Tab repeatedly to cycle through apps.',
                relatedShortcuts: ['win_tab', 'ctrl_alt_tab']
            },
            {
                id: 'win_d',
                combination: 'Win + D',
                description: 'Show desktop (minimize all windows)',
                application: 'Windows',
                category: 'navigation',
                difficulty: 'beginner',
                tip: 'Perfect for quickly accessing desktop icons or files.',
                relatedShortcuts: ['win_m']
            },
            {
                id: 'win_l',
                combination: 'Win + L',
                description: 'Lock computer screen',
                application: 'Windows',
                category: 'security',
                difficulty: 'beginner',
                tip: 'Essential for workplace security. Lock your screen when stepping away.',
                relatedShortcuts: ['ctrl_alt_del']
            },
            {
                id: 'win_tab',
                combination: 'Win + Tab',
                description: 'Open Task View (virtual desktops)',
                application: 'Windows',
                category: 'navigation',
                difficulty: 'intermediate',
                tip: 'Great for managing multiple virtual desktops and windows.',
                relatedShortcuts: ['alt_tab', 'win_ctrl_d']
            },
            {
                id: 'win_r',
                combination: 'Win + R',
                description: 'Open Run dialog',
                application: 'Windows',
                category: 'system',
                difficulty: 'intermediate',
                tip: 'Quick way to run programs, open folders, or system tools.',
                relatedShortcuts: ['win_x']
            },

            // Browser Shortcuts (Chrome)
            {
                id: 'ctrl_t',
                combination: 'Ctrl + T',
                description: 'Open new tab',
                application: 'Chrome',
                category: 'browsing',
                difficulty: 'beginner',
                tip: 'Essential for multitasking while browsing the web.',
                relatedShortcuts: ['ctrl_w', 'ctrl_shift_t']
            },
            {
                id: 'ctrl_w',
                combination: 'Ctrl + W',
                description: 'Close current tab',
                application: 'Chrome',
                category: 'browsing',
                difficulty: 'beginner',
                tip: 'Quick way to close tabs you no longer need.',
                relatedShortcuts: ['ctrl_t', 'ctrl_shift_t']
            },
            {
                id: 'ctrl_shift_t',
                combination: 'Ctrl + Shift + T',
                description: 'Reopen recently closed tab',
                application: 'Chrome',
                category: 'browsing',
                difficulty: 'intermediate',
                tip: 'Accidentally closed a tab? This brings it back!',
                relatedShortcuts: ['ctrl_w', 'ctrl_h']
            },
            {
                id: 'ctrl_l',
                combination: 'Ctrl + L',
                description: 'Focus address bar',
                application: 'Chrome',
                category: 'browsing',
                difficulty: 'beginner',
                tip: 'Quickly jump to the address bar to type a new URL.',
                relatedShortcuts: ['ctrl_k', 'f6']
            },
            {
                id: 'ctrl_shift_n',
                combination: 'Ctrl + Shift + N',
                description: 'Open incognito window',
                application: 'Chrome',
                category: 'browsing',
                difficulty: 'intermediate',
                tip: 'Private browsing mode - no history or cookies saved.',
                relatedShortcuts: ['ctrl_n']
            },

            // File Explorer
            {
                id: 'win_e',
                combination: 'Win + E',
                description: 'Open File Explorer',
                application: 'Windows',
                category: 'files',
                difficulty: 'beginner',
                tip: 'Quick access to your files and folders.',
                relatedShortcuts: ['ctrl_n']
            },
            {
                id: 'f2',
                combination: 'F2',
                description: 'Rename selected file or folder',
                application: 'File Explorer',
                category: 'files',
                difficulty: 'beginner',
                tip: 'Select a file and press F2 to quickly rename it.',
                relatedShortcuts: ['delete', 'enter']
            },
            {
                id: 'ctrl_shift_n_explorer',
                combination: 'Ctrl + Shift + N',
                description: 'Create new folder',
                application: 'File Explorer',
                category: 'files',
                difficulty: 'beginner',
                tip: 'Organize your files by quickly creating new folders.',
                relatedShortcuts: ['f2']
            },

            // Text Editing
            {
                id: 'ctrl_f',
                combination: 'Ctrl + F',
                description: 'Find text on page or document',
                application: 'Universal',
                category: 'text',
                difficulty: 'beginner',
                tip: 'Search for specific text in documents, web pages, or applications.',
                relatedShortcuts: ['ctrl_h', 'f3']
            },
            {
                id: 'ctrl_h',
                combination: 'Ctrl + H',
                description: 'Find and replace text',
                application: 'Text Editors',
                category: 'text',
                difficulty: 'intermediate',
                tip: 'Replace all instances of one word with another quickly.',
                relatedShortcuts: ['ctrl_f', 'ctrl_g']
            },
            {
                id: 'ctrl_s',
                combination: 'Ctrl + S',
                description: 'Save document or file',
                application: 'Universal',
                category: 'files',
                difficulty: 'beginner',
                tip: 'Save your work frequently to avoid losing progress!',
                relatedShortcuts: ['ctrl_shift_s', 'ctrl_o']
            },

            // VS Code (Development)
            {
                id: 'ctrl_p_vscode',
                combination: 'Ctrl + P',
                description: 'Quick Open file',
                application: 'VS Code',
                category: 'development',
                difficulty: 'intermediate',
                tip: 'Type filename to quickly navigate to any file in your project.',
                relatedShortcuts: ['ctrl_shift_p', 'ctrl_b']
            },
            {
                id: 'ctrl_shift_p_vscode',
                combination: 'Ctrl + Shift + P',
                description: 'Open Command Palette',
                application: 'VS Code',
                category: 'development',
                difficulty: 'intermediate',
                tip: 'Access all VS Code commands from one place.',
                relatedShortcuts: ['ctrl_p', 'f1']
            },
            {
                id: 'ctrl_grave',
                combination: 'Ctrl + `',
                description: 'Toggle integrated terminal',
                application: 'VS Code',
                category: 'development',
                difficulty: 'intermediate',
                tip: 'Quickly access the terminal without leaving VS Code.',
                relatedShortcuts: ['ctrl_shift_grave']
            },

            // Advanced Windows
            {
                id: 'win_x',
                combination: 'Win + X',
                description: 'Open Quick Link menu',
                application: 'Windows',
                category: 'system',
                difficulty: 'intermediate',
                tip: 'Power user menu with quick access to system tools.',
                relatedShortcuts: ['win_r', 'win_i']
            },
            {
                id: 'win_i',
                combination: 'Win + I',
                description: 'Open Windows Settings',
                application: 'Windows',
                category: 'system',
                difficulty: 'beginner',
                tip: 'Quick access to all Windows settings and configuration.',
                relatedShortcuts: ['win_x', 'win_u']
            },
            {
                id: 'print_screen',
                combination: 'Print Screen',
                description: 'Take screenshot of entire screen',
                application: 'Windows',
                category: 'productivity',
                difficulty: 'beginner',
                tip: 'Screenshot is saved to clipboard. Use Ctrl+V to paste it.',
                relatedShortcuts: ['alt_print_screen', 'win_shift_s']
            },
            {
                id: 'win_shift_s',
                combination: 'Win + Shift + S',
                description: 'Take screenshot of selected area',
                application: 'Windows',
                category: 'productivity',
                difficulty: 'intermediate',
                tip: 'Modern way to take precise screenshots. Opens Snip & Sketch.',
                relatedShortcuts: ['print_screen']
            },

            // Microsoft Office
            {
                id: 'ctrl_b',
                combination: 'Ctrl + B',
                description: 'Bold selected text',
                application: 'Word/Office',
                category: 'formatting',
                difficulty: 'beginner',
                tip: 'Make text stand out by making it bold.',
                relatedShortcuts: ['ctrl_i', 'ctrl_u']
            },
            {
                id: 'ctrl_i',
                combination: 'Ctrl + I',
                description: 'Italicize selected text',
                application: 'Word/Office',
                category: 'formatting',
                difficulty: 'beginner',
                tip: 'Add emphasis to text with italics.',
                relatedShortcuts: ['ctrl_b', 'ctrl_u']
            },
            {
                id: 'f7',
                combination: 'F7',
                description: 'Check spelling and grammar',
                application: 'Word/Office',
                category: 'editing',
                difficulty: 'beginner',
                tip: 'Review your document for errors before sharing.',
                relatedShortcuts: ['f12', 'ctrl_s']
            },

            // Email (Outlook)
            {
                id: 'ctrl_n_outlook',
                combination: 'Ctrl + N',
                description: 'Create new email',
                application: 'Outlook',
                category: 'email',
                difficulty: 'beginner',
                tip: 'Start composing a new email message.',
                relatedShortcuts: ['ctrl_r', 'ctrl_shift_m']
            },
            {
                id: 'ctrl_r_outlook',
                combination: 'Ctrl + R',
                description: 'Reply to email',
                application: 'Outlook',
                category: 'email',
                difficulty: 'beginner',
                tip: 'Quickly reply to the sender of the current email.',
                relatedShortcuts: ['ctrl_shift_r', 'ctrl_f']
            },
            {
                id: 'f9_outlook',
                combination: 'F9',
                description: 'Send/Receive emails',
                application: 'Outlook',
                category: 'email',
                difficulty: 'beginner',
                tip: 'Manually check for new emails and send queued messages.',
                relatedShortcuts: ['ctrl_m']
            },

            // Zoom/Teams
            {
                id: 'space_zoom',
                combination: 'Spacebar',
                description: 'Temporarily unmute in Zoom',
                application: 'Zoom',
                category: 'communication',
                difficulty: 'beginner',
                tip: 'Hold spacebar to speak when muted, release to mute again.',
                relatedShortcuts: ['alt_a', 'alt_v']
            },
            {
                id: 'alt_a_zoom',
                combination: 'Alt + A',
                description: 'Toggle mute/unmute',
                application: 'Zoom',
                category: 'communication',
                difficulty: 'beginner',
                tip: 'Essential for video calls. Toggle your microphone on/off.',
                relatedShortcuts: ['alt_v', 'space']
            },
            {
                id: 'alt_v_zoom',
                combination: 'Alt + V',
                description: 'Toggle video on/off',
                application: 'Zoom',
                category: 'communication',
                difficulty: 'beginner',
                tip: 'Turn your camera on or off during video calls.',
                relatedShortcuts: ['alt_a']
            }
        ];
    }

    loadShortcutHistory() {
        try {
            const stored = localStorage.getItem(this.historyKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading shortcut history:', error);
            return [];
        }
    }

    saveShortcutHistory() {
        try {
            localStorage.setItem(this.historyKey, JSON.stringify(this.shortcutHistory));
        } catch (error) {
            console.error('Error saving shortcut history:', error);
        }
    }

    initializeToday() {
        const today = this.getDateString(new Date());
        const storedData = this.getTodaysStoredShortcut();

        if (storedData && storedData.date === today) {
            // Use stored shortcut for today
            this.currentShortcut = storedData.shortcut;
        } else {
            // Generate new shortcut for today
            this.generateTodaysShortcut();
        }

        this.updateDisplay();
    }

    getTodaysStoredShortcut() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error loading today\'s shortcut:', error);
            return null;
        }
    }

    generateTodaysShortcut() {
        const today = new Date();
        const dayOfYear = this.getDayOfYear(today);
        
        // Use date-based seed for consistent daily selection
        const availableShortcuts = this.getAvailableShortcuts();
        const shortcutIndex = dayOfYear % availableShortcuts.length;
        
        this.currentShortcut = availableShortcuts[shortcutIndex];

        // Add to history
        this.addToHistory(this.currentShortcut);

        // Store for today
        this.storeTodaysShortcut();
    }

    getAvailableShortcuts() {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        // Filter shortcuts based on day and difficulty progression
        let availableShortcuts = [...this.shortcuts];

        // Weekend: Show more fun/creative shortcuts
        if (isWeekend) {
            const weekendPreferred = ['communication', 'productivity', 'browsing'];
            availableShortcuts = availableShortcuts.filter(shortcut => 
                weekendPreferred.includes(shortcut.category)
            );
            
            // If too few weekend shortcuts, include all
            if (availableShortcuts.length < 10) {
                availableShortcuts = [...this.shortcuts];
            }
        }

        // Monday: Start with basics
        if (dayOfWeek === 1) {
            availableShortcuts = availableShortcuts.filter(shortcut => 
                shortcut.difficulty === 'beginner'
            );
        }

        // Friday: Show productivity shortcuts
        if (dayOfWeek === 5) {
            availableShortcuts = availableShortcuts.filter(shortcut => 
                ['productivity', 'files', 'email'].includes(shortcut.category)
            );
        }

        // Avoid recent shortcuts (last 7 days)
        const recentShortcuts = this.shortcutHistory
            .slice(-7)
            .map(entry => entry.shortcut.id);
        
        availableShortcuts = availableShortcuts.filter(shortcut => 
            !recentShortcuts.includes(shortcut.id)
        );

        // If no shortcuts available after filtering, use all
        if (availableShortcuts.length === 0) {
            availableShortcuts = [...this.shortcuts];
        }

        return availableShortcuts;
    }

    addToHistory(shortcut) {
        const historyEntry = {
            date: this.getDateString(new Date()),
            shortcut: shortcut,
            learned: false,
            practiced: false
        };

        this.shortcutHistory.push(historyEntry);

        // Keep only last 30 days
        if (this.shortcutHistory.length > 30) {
            this.shortcutHistory = this.shortcutHistory.slice(-30);
        }

        this.saveShortcutHistory();
    }

    storeTodaysShortcut() {
        const todaysData = {
            date: this.getDateString(new Date()),
            shortcut: this.currentShortcut
        };

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(todaysData));
        } catch (error) {
            console.error('Error storing today\'s shortcut:', error);
        }
    }

    updateDisplay() {
        const container = document.querySelector('.shortcut-of-day');
        if (!container) {
            console.warn('Shortcut of the day container not found');
            return;
        }

        container.innerHTML = this.renderShortcutOfTheDay();
        this.attachEventListeners();
    }

    renderShortcutOfTheDay() {
        if (!this.currentShortcut) {
            return '<p>Loading shortcut of the day...</p>';
        }

        const shortcut = this.currentShortcut;
        const isLearned = this.isShortcutLearned(shortcut.id);
        const isPracticed = this.isShortcutPracticed(shortcut.id);

        return `
            <div class="shortcut-card">
                <div class="shortcut-header">
                    <h3>Shortcut of the Day</h3>
                    <div class="shortcut-date">${this.formatDate(new Date())}</div>
                </div>
                
                <div class="shortcut-main">
                    <div class="shortcut-combination">
                        <span class="shortcut-keys">${shortcut.combination}</span>
                        <div class="shortcut-app">${shortcut.application}</div>
                    </div>
                    
                    <div class="shortcut-info">
                        <h4>${shortcut.description}</h4>
                        <p class="shortcut-tip">💡 ${shortcut.tip}</p>
                        
                        <div class="shortcut-meta">
                            <span class="difficulty ${shortcut.difficulty}">${shortcut.difficulty}</span>
                            <span class="category">${shortcut.category}</span>
                        </div>
                    </div>
                </div>
                
                <div class="shortcut-actions">
                    <button class="practice-btn ${isPracticed ? 'completed' : ''}" 
                            onclick="window.shortcutOfTheDay.practiceShortcut('${shortcut.id}')">
                        ${isPracticed ? '✓ Practiced' : '🎯 Practice'}
                    </button>
                    
                    <button class="learn-btn ${isLearned ? 'completed' : ''}" 
                            onclick="window.shortcutOfTheDay.learnShortcut('${shortcut.id}')">
                        ${isLearned ? '✓ Learned' : '📚 Mark as Learned'}
                    </button>
                    
                    <button class="share-btn" 
                            onclick="window.shortcutOfTheDay.shareShortcut('${shortcut.id}')">
                        📤 Share
                    </button>
                </div>
                
                ${shortcut.relatedShortcuts && shortcut.relatedShortcuts.length > 0 ? `
                    <div class="related-shortcuts">
                        <h5>Related Shortcuts:</h5>
                        <div class="related-shortcuts-list">
                            ${this.renderRelatedShortcuts(shortcut.relatedShortcuts)}
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div class="shortcut-history-link">
                <button onclick="window.shortcutOfTheDay.showHistory()">
                    📅 View Previous Shortcuts
                </button>
            </div>
        `;
    }

    renderRelatedShortcuts(relatedIds) {
        return relatedIds.map(id => {
            const relatedShortcut = this.shortcuts.find(s => s.id === id);
            if (!relatedShortcut) return '';
            
            return `
                <span class="related-shortcut" 
                      onclick="window.shortcutOfTheDay.showShortcutDetails('${id}')"
                      title="${relatedShortcut.description}">
                    ${relatedShortcut.combination}
                </span>
            `;
        }).join('');
    }

    attachEventListeners() {
        // Event listeners are attached via onclick attributes in the HTML
        // This method can be used for additional event handling if needed
    }

    learnShortcut(shortcutId) {
        this.markShortcutAsLearned(shortcutId);
        this.updateDisplay();
        
        // Notify other systems
        if (window.shortcutSenseiApp && window.shortcutSenseiApp.progressTracker) {
            window.shortcutSenseiApp.progressTracker.learnShortcut(shortcutId);
        }

        if (window.streakSystem) {
            window.streakSystem.recordActivity('shortcut_learned', 1);
        }

        if (window.badgeSystem) {
            const shortcut = this.shortcuts.find(s => s.id === shortcutId);
            if (shortcut) {
                window.badgeSystem.updateProgress('shortcuts_learned', {
                    app: shortcut.application.toLowerCase()
                });
            }
        }

        this.showNotification('✅ Shortcut learned! Keep it up!', 'success');
    }

    practiceShortcut(shortcutId) {
        this.markShortcutAsPracticed(shortcutId);
        this.updateDisplay();
        
        // Record practice activity
        if (window.streakSystem) {
            window.streakSystem.recordActivity('study_time', 2); // 2 minutes for practice
        }

        this.showNotification('🎯 Great practice! Try using it in real scenarios.', 'success');
    }

    shareShortcut(shortcutId) {
        const shortcut = this.shortcuts.find(s => s.id === shortcutId);
        if (!shortcut) return;

        const shareText = `💡 Today's shortcut tip: ${shortcut.combination} - ${shortcut.description} in ${shortcut.application}. ${shortcut.tip} #ShortcutSensei`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Shortcut of the Day',
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('📋 Shortcut copied to clipboard!', 'success');
            });
        }

        // Record sharing activity
        if (window.badgeSystem) {
            window.badgeSystem.updateProgress('shortcuts_shared');
        }
    }

    showShortcutDetails(shortcutId) {
        const shortcut = this.shortcuts.find(s => s.id === shortcutId);
        if (!shortcut) return;

        const modal = this.createShortcutDetailsModal(shortcut);
        document.body.appendChild(modal);
    }

    createShortcutDetailsModal(shortcut) {
        const modal = document.createElement('div');
        modal.className = 'shortcut-details-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${shortcut.combination}</h3>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                
                <div class="modal-body">
                    <div class="shortcut-info">
                        <h4>${shortcut.description}</h4>
                        <p><strong>Application:</strong> ${shortcut.application}</p>
                        <p><strong>Category:</strong> ${shortcut.category}</p>
                        <p><strong>Difficulty:</strong> ${shortcut.difficulty}</p>
                        <p class="tip">💡 ${shortcut.tip}</p>
                    </div>
                    
                    <div class="modal-actions">
                        <button onclick="window.shortcutOfTheDay.learnShortcut('${shortcut.id}'); this.closest('.shortcut-details-modal').remove();">
                            📚 Mark as Learned
                        </button>
                        <button onclick="window.shortcutOfTheDay.practiceShortcut('${shortcut.id}'); this.closest('.shortcut-details-modal').remove();">
                            🎯 Practice
                        </button>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

    showHistory() {
        const modal = this.createHistoryModal();
        document.body.appendChild(modal);
    }

    createHistoryModal() {
        const modal = document.createElement('div');
        modal.className = 'shortcut-history-modal';
        
        const recentHistory = this.shortcutHistory.slice(-14).reverse(); // Last 14 days
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Recent Shortcuts</h3>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                
                <div class="modal-body">
                    <div class="history-list">
                        ${recentHistory.map(entry => `
                            <div class="history-item ${entry.learned ? 'learned' : ''} ${entry.practiced ? 'practiced' : ''}">
                                <div class="history-date">${this.formatDate(new Date(entry.date))}</div>
                                <div class="history-shortcut">
                                    <span class="combination">${entry.shortcut.combination}</span>
                                    <span class="description">${entry.shortcut.description}</span>
                                    <span class="application">${entry.shortcut.application}</span>
                                </div>
                                <div class="history-status">
                                    ${entry.learned ? '<span class="status-badge learned">Learned</span>' : ''}
                                    ${entry.practiced ? '<span class="status-badge practiced">Practiced</span>' : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }

    markShortcutAsLearned(shortcutId) {
        const today = this.getDateString(new Date());
        const historyEntry = this.shortcutHistory.find(entry => 
            entry.date === today && entry.shortcut.id === shortcutId
        );
        
        if (historyEntry) {
            historyEntry.learned = true;
            this.saveShortcutHistory();
        }
    }

    markShortcutAsPracticed(shortcutId) {
        const today = this.getDateString(new Date());
        const historyEntry = this.shortcutHistory.find(entry => 
            entry.date === today && entry.shortcut.id === shortcutId
        );
        
        if (historyEntry) {
            historyEntry.practiced = true;
            this.saveShortcutHistory();
        }
    }

    isShortcutLearned(shortcutId) {
        const today = this.getDateString(new Date());
        const historyEntry = this.shortcutHistory.find(entry => 
            entry.date === today && entry.shortcut.id === shortcutId
        );
        return historyEntry ? historyEntry.learned : false;
    }

    isShortcutPracticed(shortcutId) {
        const today = this.getDateString(new Date());
        const historyEntry = this.shortcutHistory.find(entry => 
            entry.date === today && entry.shortcut.id === shortcutId
        );
        return historyEntry ? historyEntry.practiced : false;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `shortcut-notification ${type}`;
        notification.textContent = message;
        
        const container = document.getElementById('notificationContainer') || document.body;
        container.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => notification.remove(), 3000);
    }

    // Utility methods
    getDateString(date) {
        return date.toISOString().split('T')[0];
    }

    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Public API
    getTodaysShortcut() {
        return this.currentShortcut;
    }

    getShortcutById(id) {
        return this.shortcuts.find(s => s.id === id);
    }

    getAllShortcuts() {
        return this.shortcuts;
    }

    getShortcutsByCategory(category) {
        return this.shortcuts.filter(s => s.category === category);
    }

    getShortcutsByApplication(application) {
        return this.shortcuts.filter(s => s.application.toLowerCase().includes(application.toLowerCase()));
    }

    refreshTodaysShortcut() {
        // Force refresh of today's shortcut (admin function)
        this.generateTodaysShortcut();
        this.updateDisplay();
    }
}

// Initialize the system
window.shortcutOfTheDay = new ShortcutOfTheDaySystem();
