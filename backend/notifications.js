// Notification System
// Handles user notifications, updates, and real-time messaging

class NotificationSystem {
    constructor() {
        this.notifications = new Map();
        this.unreadCount = 0;
        this.initializeNotificationSystem();
        this.setupNotificationListeners();
    }

    initializeNotificationSystem() {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            this.setupAuthListener();
        }
        
        // Create notification UI components
        this.createNotificationUI();
        
        // Setup notification permissions
        this.requestNotificationPermission();
    }

    setupAuthListener() {
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.userId = user.uid;
                this.loadUserNotifications();
                this.setupRealTimeNotifications();
            } else {
                this.userId = null;
                this.notifications.clear();
                this.updateNotificationUI();
            }
        });
    }

    setupNotificationListeners() {
        // Listen for notification events from other systems
        window.addEventListener('achievementEarned', (e) => {
            this.createAchievementNotification(e.detail);
        });

        window.addEventListener('contentUpdated', (e) => {
            this.createContentUpdateNotification(e.detail);
        });

        window.addEventListener('userAction', (e) => {
            this.handleUserActionNotification(e.detail);
        });
    }

    // UI Creation
    createNotificationUI() {
        // Create notification bell icon
        this.createNotificationBell();
        
        // Create notification panel
        this.createNotificationPanel();
        
        // Create toast notification container
        this.createToastContainer();
    }

    createNotificationBell() {
        const bell = document.createElement('div');
        bell.id = 'notification-bell';
        bell.className = 'notification-bell';
        bell.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: #3498db;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
        `;

        bell.innerHTML = `
            <span style="color: white; font-size: 20px;">Bell</span>
            <span id="notification-badge" class="notification-badge" style="
                position: absolute;
                top: -5px;
                right: -5px;
                background: #e74c3c;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 12px;
                display: none;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            ">0</span>
        `;

        bell.addEventListener('click', () => {
            this.toggleNotificationPanel();
        });

        document.body.appendChild(bell);
    }

    createNotificationPanel() {
        const panel = document.createElement('div');
        panel.id = 'notification-panel';
        panel.className = 'notification-panel';
        panel.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            width: 350px;
            max-height: 500px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 1001;
            display: none;
            overflow: hidden;
        `;

        panel.innerHTML = `
            <div style="padding: 20px 20px 10px 20px; border-bottom: 1px solid #eee;">
                <h3 style="margin: 0; color: #2c3e50;">Notifications</h3>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button onclick="window.notificationSystem.markAllAsRead()" style="padding: 5px 10px; font-size: 12px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Mark All Read
                    </button>
                    <button onclick="window.notificationSystem.clearAll()" style="padding: 5px 10px; font-size: 12px; background: #95a5a6; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Clear All
                    </button>
                </div>
            </div>
            <div id="notification-list" style="max-height: 400px; overflow-y: auto;">
                <div style="padding: 40px 20px; text-align: center; color: #95a5a6;">
                    No notifications yet
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!panel.contains(e.target) && !document.getElementById('notification-bell').contains(e.target)) {
                panel.style.display = 'none';
            }
        });
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;

        document.body.appendChild(container);
    }

    // Notification Management
    async createNotification(notificationData) {
        if (!this.userId) return;

        try {
            const notification = {
                userId: this.userId,
                title: notificationData.title,
                message: notificationData.message,
                type: notificationData.type || 'info',
                category: notificationData.category || 'general',
                data: notificationData.data || {},
                read: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                expiresAt: notificationData.expiresAt || null,
                actionUrl: notificationData.actionUrl || null,
                icon: notificationData.icon || this.getDefaultIcon(notificationData.type)
            };

            const docRef = await this.db.collection('notifications').add(notification);
            
            // Add to local cache
            this.notifications.set(docRef.id, { id: docRef.id, ...notification });
            
            // Update UI
            this.updateNotificationUI();
            
            // Show toast notification
            this.showToastNotification(notification);
            
            // Show browser notification if permission granted
            this.showBrowserNotification(notification);
            
            return docRef.id;
            
        } catch (error) {
            console.error('Error creating notification:', error);
        }
    }

    async loadUserNotifications() {
        if (!this.userId) return;

        try {
            const snapshot = await this.db.collection('notifications')
                .where('userId', '==', this.userId)
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();

            this.notifications.clear();
            snapshot.forEach(doc => {
                const notification = { id: doc.id, ...doc.data() };
                this.notifications.set(doc.id, notification);
            });

            this.updateNotificationUI();
            
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    setupRealTimeNotifications() {
        if (!this.userId) return;

        // Listen for new notifications
        this.db.collection('notifications')
            .where('userId', '==', this.userId)
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    const notification = { id: change.doc.id, ...change.doc.data() };
                    
                    if (change.type === 'added' && !this.notifications.has(change.doc.id)) {
                        this.notifications.set(change.doc.id, notification);
                        this.showToastNotification(notification);
                        this.showBrowserNotification(notification);
                    } else if (change.type === 'modified') {
                        this.notifications.set(change.doc.id, notification);
                    } else if (change.type === 'removed') {
                        this.notifications.delete(change.doc.id);
                    }
                });
                
                this.updateNotificationUI();
            });
    }

    // UI Updates
    updateNotificationUI() {
        this.updateNotificationBadge();
        this.updateNotificationList();
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notification-badge');
        if (!badge) return;

        this.unreadCount = Array.from(this.notifications.values())
            .filter(n => !n.read).length;

        if (this.unreadCount > 0) {
            badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    updateNotificationList() {
        const list = document.getElementById('notification-list');
        if (!list) return;

        const notifications = Array.from(this.notifications.values())
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        if (notifications.length === 0) {
            list.innerHTML = `
                <div style="padding: 40px 20px; text-align: center; color: #95a5a6;">
                    No notifications yet
                </div>
            `;
            return;
        }

        list.innerHTML = notifications.map(notification => 
            this.createNotificationListItem(notification)
        ).join('');
    }

    createNotificationListItem(notification) {
        const timeAgo = this.getTimeAgo(notification.createdAt);
        const isUnread = !notification.read;

        return `
            <div class="notification-item" data-id="${notification.id}" style="
                padding: 15px 20px;
                border-bottom: 1px solid #f0f0f0;
                cursor: pointer;
                background: ${isUnread ? '#f8f9fa' : 'white'};
                transition: background-color 0.2s;
            " onclick="window.notificationSystem.handleNotificationClick('${notification.id}')">
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                    <span style="font-size: 24px;">${notification.icon}</span>
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 5px 0; font-size: 14px; color: #2c3e50; ${isUnread ? 'font-weight: bold;' : ''}">${notification.title}</h4>
                        <p style="margin: 0 0 5px 0; font-size: 13px; color: #7f8c8d; line-height: 1.4;">${notification.message}</p>
                        <span style="font-size: 11px; color: #bdc3c7;">${timeAgo}</span>
                    </div>
                    ${isUnread ? '<div style="width: 8px; height: 8px; background: #3498db; border-radius: 50%; margin-top: 4px;"></div>' : ''}
                </div>
            </div>
        `;
    }

    // Toast Notifications
    showToastNotification(notification) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.style.cssText = `
            background: white;
            border-left: 4px solid ${this.getTypeColor(notification.type)};
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            padding: 15px;
            margin-bottom: 10px;
            min-width: 300px;
            max-width: 400px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            pointer-events: auto;
            cursor: pointer;
        `;

        toast.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="font-size: 20px;">${notification.icon}</span>
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 5px 0; font-size: 14px; color: #2c3e50;">${notification.title}</h4>
                    <p style="margin: 0; font-size: 13px; color: #7f8c8d; line-height: 1.4;">${notification.message}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: #bdc3c7; cursor: pointer; font-size: 16px;">×</button>
            </div>
        `;

        toast.addEventListener('click', () => {
            this.handleNotificationClick(notification.id);
            toast.remove();
        });

        const container = document.getElementById('toast-container');
        container.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }

    // Browser Notifications
    async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            try {
                await Notification.requestPermission();
            } catch (error) {
                console.log('Notification permission request failed');
            }
        }
    }

    showBrowserNotification(notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const browserNotification = new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: notification.id,
                renotify: false
            });

            browserNotification.addEventListener('click', () => {
                window.focus();
                this.handleNotificationClick(notification.id);
                browserNotification.close();
            });

            // Auto close after 5 seconds
            setTimeout(() => browserNotification.close(), 5000);
        }
    }

    // Event Handlers
    toggleNotificationPanel() {
        const panel = document.getElementById('notification-panel');
        if (!panel) return;

        const isVisible = panel.style.display === 'block';
        panel.style.display = isVisible ? 'none' : 'block';

        if (!isVisible) {
            // Mark visible notifications as read
            this.markVisibleAsRead();
        }
    }

    async handleNotificationClick(notificationId) {
        const notification = this.notifications.get(notificationId);
        if (!notification) return;

        // Mark as read
        await this.markAsRead(notificationId);

        // Handle action URL
        if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
        }

        // Handle specific notification types
        this.handleNotificationAction(notification);
    }

    handleNotificationAction(notification) {
        switch (notification.type) {
            case 'achievement':
                // Could open achievements page
                break;
            case 'content_update':
                // Could refresh current page or navigate to updated content
                break;
            case 'social':
                // Could open community section
                break;
        }
    }

    // Notification Actions
    async markAsRead(notificationId) {
        try {
            await this.db.collection('notifications').doc(notificationId).update({
                read: true,
                readAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            const notification = this.notifications.get(notificationId);
            if (notification) {
                notification.read = true;
                this.notifications.set(notificationId, notification);
            }

            this.updateNotificationUI();
            
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    async markAllAsRead() {
        const unreadNotifications = Array.from(this.notifications.values())
            .filter(n => !n.read);

        const batch = this.db.batch();
        unreadNotifications.forEach(notification => {
            const ref = this.db.collection('notifications').doc(notification.id);
            batch.update(ref, {
                read: true,
                readAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });

        try {
            await batch.commit();
            
            // Update local cache
            unreadNotifications.forEach(notification => {
                notification.read = true;
                this.notifications.set(notification.id, notification);
            });

            this.updateNotificationUI();
            
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }

    async clearAll() {
        if (!confirm('Are you sure you want to clear all notifications?')) return;

        const batch = this.db.batch();
        this.notifications.forEach(notification => {
            const ref = this.db.collection('notifications').doc(notification.id);
            batch.delete(ref);
        });

        try {
            await batch.commit();
            this.notifications.clear();
            this.updateNotificationUI();
            
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    }

    markVisibleAsRead() {
        // Mark first 10 notifications as read when panel is opened
        const visibleNotifications = Array.from(this.notifications.values())
            .filter(n => !n.read)
            .slice(0, 10);

        visibleNotifications.forEach(notification => {
            this.markAsRead(notification.id);
        });
    }

    // Specific Notification Creators
    createAchievementNotification(achievement) {
        this.createNotification({
            title: 'Achievement Unlocked!',
            message: `You earned the "${achievement.title}" achievement`,
            type: 'achievement',
            category: 'gamification',
            icon: achievement.icon,
            data: { achievementId: achievement.id }
        });
    }

    createContentUpdateNotification(update) {
        this.createNotification({
            title: 'New Content Available',
            message: update.message || 'New shortcuts have been added to your favorite apps',
            type: 'content_update',
            category: 'content',
            icon: '📱',
            data: { updateType: update.type }
        });
    }

    createWelcomeNotification() {
        this.createNotification({
            title: 'Welcome to Shortcut Sensei!',
            message: 'Start exploring keyboard shortcuts to boost your productivity',
            type: 'welcome',
            category: 'onboarding',
            icon: '👋'
        });
    }

    createDailyTipNotification() {
        const tips = [
            'Did you know? Ctrl+Shift+T reopens your last closed tab!',
            'Pro tip: Use Ctrl+L to quickly jump to the address bar',
            'Time saver: Ctrl+Shift+N opens an incognito window instantly',
            'Efficiency boost: Alt+Tab cycles through your open applications'
        ];

        const randomTip = tips[Math.floor(Math.random() * tips.length)];

        this.createNotification({
            title: 'Daily Productivity Tip',
            message: randomTip,
            type: 'tip',
            category: 'learning',
            icon: 'lightbulb'
        });
    }

    // Utility Methods
    getDefaultIcon(type) {
        const icons = {
            'achievement': 'trophy',
            'content_update': 'phone',
            'social': 'users',
            'tip': 'lightbulb',
            'welcome': 'hand',
            'warning': 'warning',
            'error': 'error',
            'success': 'check',
            'info': 'info'
        };
        return icons[type] || 'info';
    }

    getTypeColor(type) {
        const colors = {
            'achievement': '#f39c12',
            'content_update': '#3498db',
            'social': '#9b59b6',
            'tip': '#27ae60',
            'welcome': '#e74c3c',
            'warning': '#f39c12',
            'error': '#e74c3c',
            'success': '#27ae60',
            'info': '#3498db'
        };
        return colors[type] || '#3498db';
    }

    getTimeAgo(timestamp) {
        if (!timestamp) return 'Just now';
        
        const now = new Date();
        const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return time.toLocaleDateString();
    }

    // Public API
    async sendNotificationToUser(userId, notificationData) {
        // For admin use - send notification to specific user
        const notification = {
            userId: userId,
            ...notificationData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        return await this.db.collection('notifications').add(notification);
    }

    async broadcastNotification(notificationData) {
        // For admin use - send notification to all users
        // This would require a cloud function for efficiency
        console.log('Broadcast notification:', notificationData);
    }
}

// Initialize Notification System
if (typeof window !== 'undefined') {
    window.NotificationSystem = NotificationSystem;
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.notificationSystem = new NotificationSystem();
        });
    } else {
        window.notificationSystem = new NotificationSystem();
    }
}

export default NotificationSystem;
