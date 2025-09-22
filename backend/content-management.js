// Content Management System
// Allows dynamic content updates, new shortcuts addition, and content versioning

class ContentManagementSystem {
    constructor() {
        this.initializeContentSystem();
        this.contentCache = new Map();
        this.setupContentListeners();
    }

    initializeContentSystem() {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            this.loadContent();
        }
    }

    setupContentListeners() {
        // Listen for content updates in real-time
        this.setupRealTimeContentUpdates();
        
        // Setup admin content management interface
        this.setupAdminInterface();
        
        // Handle dynamic content loading
        this.setupDynamicContentLoading();
    }

    async loadContent() {
        try {
            // Load shortcuts
            await this.loadShortcuts();
            
            // Load application data
            await this.loadApplicationData();
            
            // Load blog posts
            await this.loadBlogPosts();
            
            // Load FAQ content
            await this.loadFAQContent();
            
        } catch (error) {
            console.error('Error loading content:', error);
        }
    }

    // Shortcuts Management
    async loadShortcuts() {
        try {
            const snapshot = await this.db.collection('shortcuts').get();
            
            this.shortcuts = new Map();
            snapshot.forEach(doc => {
                const shortcut = { id: doc.id, ...doc.data() };
                this.shortcuts.set(doc.id, shortcut);
            });

            // Update UI with loaded shortcuts
            this.updateShortcutsUI();
            
        } catch (error) {
            console.error('Error loading shortcuts:', error);
        }
    }

    async addShortcut(shortcutData) {
        try {
            const shortcut = {
                app: shortcutData.app,
                key: shortcutData.key,
                description: shortcutData.description,
                category: shortcutData.category || 'general',
                difficulty: shortcutData.difficulty || 'intermediate',
                platform: shortcutData.platform || 'all',
                tags: shortcutData.tags || [],
                version: 1,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: this.auth.currentUser?.uid,
                isActive: true,
                popularity: 0,
                helpfulVotes: 0
            };

            const docRef = await this.db.collection('shortcuts').add(shortcut);
            
            // Add to local cache
            this.shortcuts.set(docRef.id, { id: docRef.id, ...shortcut });
            
            // Update UI
            this.updateShortcutsUI();
            
            return docRef.id;
            
        } catch (error) {
            console.error('Error adding shortcut:', error);
            throw error;
        }
    }

    async updateShortcut(shortcutId, updates) {
        try {
            const updateData = {
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                version: firebase.firestore.FieldValue.increment(1)
            };

            await this.db.collection('shortcuts').doc(shortcutId).update(updateData);
            
            // Update local cache
            const existing = this.shortcuts.get(shortcutId);
            if (existing) {
                this.shortcuts.set(shortcutId, { ...existing, ...updateData });
            }
            
            // Update UI
            this.updateShortcutsUI();
            
        } catch (error) {
            console.error('Error updating shortcut:', error);
            throw error;
        }
    }

    async deleteShortcut(shortcutId) {
        try {
            // Soft delete - mark as inactive
            await this.updateShortcut(shortcutId, { isActive: false });
            
        } catch (error) {
            console.error('Error deleting shortcut:', error);
            throw error;
        }
    }

    async getShortcutsByApp(appName) {
        try {
            const snapshot = await this.db.collection('shortcuts')
                .where('app', '==', appName)
                .where('isActive', '==', true)
                .orderBy('category')
                .orderBy('popularity', 'desc')
                .get();

            const shortcuts = [];
            snapshot.forEach(doc => {
                shortcuts.push({ id: doc.id, ...doc.data() });
            });

            return shortcuts;
            
        } catch (error) {
            console.error('Error getting shortcuts by app:', error);
            return [];
        }
    }

    updateShortcutsUI() {
        // Update shortcut tables on current page
        const currentApp = this.getCurrentApp();
        this.getShortcutsByApp(currentApp).then(shortcuts => {
            this.renderShortcutsForApp(shortcuts);
        });
    }

    renderShortcutsForApp(shortcuts) {
        const tables = document.querySelectorAll('table');
        
        // Group shortcuts by category
        const groupedShortcuts = this.groupShortcutsByCategory(shortcuts);
        
        // Update existing tables or create new ones
        Object.entries(groupedShortcuts).forEach(([category, shortcuts]) => {
            this.updateShortcutTable(category, shortcuts);
        });
    }

    groupShortcutsByCategory(shortcuts) {
        return shortcuts.reduce((groups, shortcut) => {
            const category = shortcut.category || 'general';
            if (!groups[category]) groups[category] = [];
            groups[category].push(shortcut);
            return groups;
        }, {});
    }

    updateShortcutTable(category, shortcuts) {
        const tableId = `${category}-table`;
        let table = document.getElementById(tableId);
        
        if (!table) {
            table = this.createShortcutTable(tableId, category);
        }
        
        // Clear existing rows (except header)
        const tbody = table.querySelector('tbody') || table;
        const existingRows = tbody.querySelectorAll('tr:not(:first-child)');
        existingRows.forEach(row => row.remove());
        
        // Add new rows
        shortcuts.forEach(shortcut => {
            const row = this.createShortcutRow(shortcut);
            tbody.appendChild(row);
        });
    }

    createShortcutTable(tableId, category) {
        const section = document.createElement('section');
        section.className = 'shortcuts-section';
        section.innerHTML = `
            <h2 class="section-title">${this.formatCategoryName(category)}</h2>
            <table id="${tableId}" class="shortcuts-table">
                <thead>
                    <tr>
                        <th>Shortcut</th>
                        <th>Description</th>
                        <th>Platform</th>
                        <th>Difficulty</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `;
        
        // Insert before the last section or at the end
        const contentWrapper = document.querySelector('.content-wrapper, main, .main-content');
        if (contentWrapper) {
            contentWrapper.appendChild(section);
        }
        
        return section.querySelector('table');
    }

    createShortcutRow(shortcut) {
        const row = document.createElement('tr');
        row.dataset.shortcutId = shortcut.id;
        row.innerHTML = `
            <td>
                <span class="key-combo" data-shortcut="${shortcut.key}">
                    ${shortcut.key}
                </span>
            </td>
            <td>${shortcut.description}</td>
            <td>
                <span class="platform-badge ${shortcut.platform}">
                    ${this.formatPlatform(shortcut.platform)}
                </span>
            </td>
            <td>
                <span class="difficulty-badge ${shortcut.difficulty}">
                    ${shortcut.difficulty}
                </span>
            </td>
        `;
        
        return row;
    }

    formatCategoryName(category) {
        return category.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatPlatform(platform) {
        const platformNames = {
            'all': 'All',
            'windows': 'Windows',
            'mac': 'macOS',
            'linux': 'Linux'
        };
        return platformNames[platform] || platform;
    }

    // Application Data Management
    async loadApplicationData() {
        try {
            const snapshot = await this.db.collection('applications').get();
            
            this.applications = new Map();
            snapshot.forEach(doc => {
                const app = { id: doc.id, ...doc.data() };
                this.applications.set(doc.id, app);
            });
            
        } catch (error) {
            console.error('Error loading application data:', error);
        }
    }

    async addApplication(appData) {
        try {
            const application = {
                name: appData.name,
                displayName: appData.displayName || appData.name,
                description: appData.description,
                icon: appData.icon,
                category: appData.category,
                website: appData.website,
                platforms: appData.platforms || ['windows', 'mac', 'linux'],
                tags: appData.tags || [],
                popularity: 0,
                shortcutCount: 0,
                isActive: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await this.db.collection('applications').add(application);
            this.applications.set(docRef.id, { id: docRef.id, ...application });
            
            return docRef.id;
            
        } catch (error) {
            console.error('Error adding application:', error);
            throw error;
        }
    }

    // Blog Posts Management
    async loadBlogPosts() {
        try {
            const snapshot = await this.db.collection('blog_posts')
                .where('isPublished', '==', true)
                .orderBy('publishedAt', 'desc')
                .get();
            
            this.blogPosts = new Map();
            snapshot.forEach(doc => {
                const post = { id: doc.id, ...doc.data() };
                this.blogPosts.set(doc.id, post);
            });
            
        } catch (error) {
            console.error('Error loading blog posts:', error);
        }
    }

    async addBlogPost(postData) {
        try {
            const post = {
                title: postData.title,
                content: postData.content,
                excerpt: postData.excerpt,
                author: postData.author || this.auth.currentUser?.displayName,
                authorId: this.auth.currentUser?.uid,
                category: postData.category,
                tags: postData.tags || [],
                featuredImage: postData.featuredImage,
                isPublished: postData.isPublished || false,
                publishedAt: postData.isPublished ? firebase.firestore.FieldValue.serverTimestamp() : null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                views: 0,
                likes: 0
            };

            const docRef = await this.db.collection('blog_posts').add(post);
            
            if (post.isPublished) {
                this.blogPosts.set(docRef.id, { id: docRef.id, ...post });
            }
            
            return docRef.id;
            
        } catch (error) {
            console.error('Error adding blog post:', error);
            throw error;
        }
    }

    // FAQ Management
    async loadFAQContent() {
        try {
            const snapshot = await this.db.collection('faq')
                .where('isActive', '==', true)
                .orderBy('order')
                .get();
            
            this.faqItems = new Map();
            snapshot.forEach(doc => {
                const item = { id: doc.id, ...doc.data() };
                this.faqItems.set(doc.id, item);
            });
            
        } catch (error) {
            console.error('Error loading FAQ content:', error);
        }
    }

    // Real-time Content Updates
    setupRealTimeContentUpdates() {
        if (!this.db) return;

        // Listen for shortcut updates
        this.db.collection('shortcuts')
            .where('isActive', '==', true)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added' || change.type === 'modified') {
                        const shortcut = { id: change.doc.id, ...change.doc.data() };
                        this.shortcuts.set(change.doc.id, shortcut);
                        this.updateShortcutsUI();
                    } else if (change.type === 'removed') {
                        this.shortcuts.delete(change.doc.id);
                        this.updateShortcutsUI();
                    }
                });
            });

        // Listen for application updates
        this.db.collection('applications')
            .where('isActive', '==', true)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added' || change.type === 'modified') {
                        const app = { id: change.doc.id, ...change.doc.data() };
                        this.applications.set(change.doc.id, app);
                    } else if (change.type === 'removed') {
                        this.applications.delete(change.doc.id);
                    }
                });
            });
    }

    // Admin Interface
    setupAdminInterface() {
        // Check if user has admin privileges
        this.auth.onAuthStateChanged(async (user) => {
            if (user) {
                const isAdmin = await this.checkAdminStatus(user.uid);
                if (isAdmin) {
                    this.createAdminInterface();
                }
            }
        });
    }

    async checkAdminStatus(userId) {
        try {
            const doc = await this.db.collection('admin_users').doc(userId).get();
            return doc.exists && doc.data().isActive;
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }

    createAdminInterface() {
        // Create floating admin panel
        const adminPanel = document.createElement('div');
        adminPanel.id = 'admin-panel';
        adminPanel.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #2c3e50;
            color: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            width: 250px;
        `;

        adminPanel.innerHTML = `
            <h4 style="margin: 0 0 10px 0;">Content Admin</h4>
            <button onclick="window.contentManager.showAddShortcutDialog()" style="margin: 5px 0; padding: 8px 12px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; width: 100%;">
                Add Shortcut
            </button>
            <button onclick="window.contentManager.showContentStats()" style="margin: 5px 0; padding: 8px 12px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer; width: 100%;">
                View Stats
            </button>
            <button onclick="window.contentManager.exportContent()" style="margin: 5px 0; padding: 8px 12px; background: #f39c12; color: white; border: none; border-radius: 5px; cursor: pointer; width: 100%;">
                Export Data
            </button>
            <button onclick="this.style.display='none'" style="position: absolute; top: 5px; right: 10px; background: none; border: none; color: white; cursor: pointer;">×</button>
        `;

        document.body.appendChild(adminPanel);
    }

    showAddShortcutDialog() {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        dialog.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 10px; width: 90%; max-width: 500px;">
                <h3>Add New Shortcut</h3>
                <form id="add-shortcut-form">
                    <div style="margin: 15px 0;">
                        <label>Application:</label>
                        <select name="app" required style="width: 100%; padding: 8px; margin-top: 5px;">
                            <option value="">Select Application</option>
                            <option value="Chrome">Chrome</option>
                            <option value="Excel">Excel</option>
                            <option value="Word">Word</option>
                            <option value="PowerPoint">PowerPoint</option>
                            <option value="Photoshop">Photoshop</option>
                        </select>
                    </div>
                    <div style="margin: 15px 0;">
                        <label>Shortcut Key:</label>
                        <input type="text" name="key" placeholder="e.g., Ctrl+C" required style="width: 100%; padding: 8px; margin-top: 5px;">
                    </div>
                    <div style="margin: 15px 0;">
                        <label>Description:</label>
                        <textarea name="description" placeholder="What does this shortcut do?" required style="width: 100%; padding: 8px; margin-top: 5px; height: 80px;"></textarea>
                    </div>
                    <div style="margin: 15px 0;">
                        <label>Category:</label>
                        <select name="category" style="width: 100%; padding: 8px; margin-top: 5px;">
                            <option value="general">General</option>
                            <option value="navigation">Navigation</option>
                            <option value="editing">Editing</option>
                            <option value="formatting">Formatting</option>
                            <option value="file">File Operations</option>
                        </select>
                    </div>
                    <div style="margin: 15px 0;">
                        <label>Difficulty:</label>
                        <select name="difficulty" style="width: 100%; padding: 8px; margin-top: 5px;">
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>
                    <div style="margin: 15px 0;">
                        <label>Platform:</label>
                        <select name="platform" style="width: 100%; padding: 8px; margin-top: 5px;">
                            <option value="all">All Platforms</option>
                            <option value="windows">Windows</option>
                            <option value="mac">macOS</option>
                            <option value="linux">Linux</option>
                        </select>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="submit" style="flex: 1; padding: 10px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Add Shortcut
                        </button>
                        <button type="button" onclick="this.closest('div').parentElement.remove()" style="flex: 1; padding: 10px; background: #95a5a6; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        `;

        // Handle form submission
        dialog.querySelector('#add-shortcut-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const shortcutData = Object.fromEntries(formData);
            
            try {
                await this.addShortcut(shortcutData);
                alert('Shortcut added successfully!');
                dialog.remove();
            } catch (error) {
                alert('Error adding shortcut: ' + error.message);
            }
        });

        document.body.appendChild(dialog);
    }

    // Dynamic Content Loading
    setupDynamicContentLoading() {
        // Load content based on current page
        const currentApp = this.getCurrentApp();
        if (currentApp && this.shortcuts.size === 0) {
            this.getShortcutsByApp(currentApp).then(shortcuts => {
                if (shortcuts.length > 0) {
                    this.renderShortcutsForApp(shortcuts);
                }
            });
        }
    }

    getCurrentApp() {
        const path = window.location.pathname;
        const fileName = path.split('/').pop();
        
        const appMapping = {
            'Google Chrome.html': 'Chrome',
            'Microsoft Excell.htm': 'Excel',
            'Microsoft Word.htm': 'Word',
            'Microsoft PowerPoint.htm': 'PowerPoint',
            'Adobe PhotoShop.html': 'Photoshop',
            'Microsoft Edge.html': 'Edge',
            'Discord.html': 'Discord',
            'Spotify.html': 'Spotify'
        };

        return appMapping[fileName] || fileName.replace(/\.(html|htm)$/, '');
    }

    // Content Analytics
    async showContentStats() {
        try {
            const stats = await this.getContentStats();
            
            const statsDialog = document.createElement('div');
            statsDialog.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 10001;
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
            `;

            statsDialog.innerHTML = `
                <h3>Content Statistics</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0;">
                    <div style="text-align: center; padding: 20px; background: #ecf0f1; border-radius: 8px;">
                        <h4>Total Shortcuts</h4>
                        <p style="font-size: 24px; color: #3498db; margin: 0;">${stats.totalShortcuts}</p>
                    </div>
                    <div style="text-align: center; padding: 20px; background: #ecf0f1; border-radius: 8px;">
                        <h4>Applications</h4>
                        <p style="font-size: 24px; color: #27ae60; margin: 0;">${stats.totalApps}</p>
                    </div>
                    <div style="text-align: center; padding: 20px; background: #ecf0f1; border-radius: 8px;">
                        <h4>Categories</h4>
                        <p style="font-size: 24px; color: #f39c12; margin: 0;">${stats.totalCategories}</p>
                    </div>
                    <div style="text-align: center; padding: 20px; background: #ecf0f1; border-radius: 8px;">
                        <h4>Recent Updates</h4>
                        <p style="font-size: 24px; color: #e74c3c; margin: 0;">${stats.recentUpdates}</p>
                    </div>
                </div>
                <button onclick="this.parentElement.remove()" style="width: 100%; padding: 10px; background: #95a5a6; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;">
                    Close
                </button>
            `;

            document.body.appendChild(statsDialog);
            
        } catch (error) {
            alert('Error loading stats: ' + error.message);
        }
    }

    async getContentStats() {
        // Get counts from Firestore
        const [shortcutsSnapshot, appsSnapshot] = await Promise.all([
            this.db.collection('shortcuts').where('isActive', '==', true).get(),
            this.db.collection('applications').where('isActive', '==', true).get()
        ]);

        const categories = new Set();
        shortcutsSnapshot.forEach(doc => {
            categories.add(doc.data().category);
        });

        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 7);

        const recentUpdatesSnapshot = await this.db.collection('shortcuts')
            .where('updatedAt', '>=', recentDate)
            .get();

        return {
            totalShortcuts: shortcutsSnapshot.size,
            totalApps: appsSnapshot.size,
            totalCategories: categories.size,
            recentUpdates: recentUpdatesSnapshot.size
        };
    }

    async exportContent() {
        try {
            const shortcuts = [];
            this.shortcuts.forEach(shortcut => shortcuts.push(shortcut));

            const applications = [];
            this.applications.forEach(app => applications.push(app));

            const exportData = {
                shortcuts,
                applications,
                exportedAt: new Date().toISOString(),
                version: '1.0'
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `shortcut-sensei-content-${new Date().toISOString().split('T')[0]}.json`;
            a.click();

            URL.revokeObjectURL(url);

        } catch (error) {
            alert('Error exporting content: ' + error.message);
        }
    }
}

// Initialize Content Management System
if (typeof window !== 'undefined') {
    window.ContentManagementSystem = ContentManagementSystem;
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.contentManager = new ContentManagementSystem();
        });
    } else {
        window.contentManager = new ContentManagementSystem();
    }
}

export default ContentManagementSystem;
