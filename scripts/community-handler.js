import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const SUPABASE_URL = 'https://bigqzwvvnlabpffumrdn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZ3F6d3Z2bmxhYnBmZnVtcmRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3ODc0OTYsImV4cCI6MjA3NzM2MzQ5Nn0.SPEqHmpmr4TX06klUcTNZkdnO980Azt8rMQhrpNW1BU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const firebaseConfig = {
    apiKey: "AIzaSyA9FmWlWXqswDprmvaILZQnamrjBCsfgVs",
    authDomain: "shortcut-sensei-1305f.firebaseapp.com",
    projectId: "shortcut-sensei-1305f",
    storageBucket: "shortcut-sensei-1305f.firebasestorage.app",
    messagingSenderId: "598536091157",
    appId: "1:598536091157:web:eff79326d42c5bba8e001c",
    measurementId: "G-WZCS73D2W5"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

let currentUser = null;
let currentFilter = 'recent';
let currentCategory = 'all';

auth.onAuthStateChanged(async (user) => {
    if (user && user.emailVerified) {
        currentUser = user;
        await ensureUserExists(user);
        loadPosts();
    }
});

async function ensureUserExists(user) {
    try {
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('firebase_uid', user.uid)
            .maybeSingle();

        if (!existingUser) {
            const { error } = await supabase
                .from('users')
                .insert([{
                    firebase_uid: user.uid,
                    email: user.email,
                    display_name: user.displayName || 'User',
                    avatar_url: user.photoURL
                }]);

            if (error) console.error('Error creating user:', error);
        }
    } catch (error) {
        console.error('Error checking user:', error);
    }
}

async function getCurrentUserId() {
    if (!currentUser) return null;

    const { data } = await supabase
        .from('users')
        .select('id')
        .eq('firebase_uid', currentUser.uid)
        .maybeSingle();

    return data?.id;
}

async function loadPosts() {
    const container = document.getElementById('postsContainer');
    container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading posts...</p></div>';

    try {
        let query = supabase
            .from('community_posts')
            .select(`
                *,
                users:user_id (display_name, avatar_url),
                post_reactions (reaction_type)
            `);

        if (currentCategory !== 'all') {
            query = query.eq('category', currentCategory);
        }

        if (currentFilter === 'recent') {
            query = query.order('created_at', { ascending: false });
        } else if (currentFilter === 'popular') {
            query = query.order('view_count', { ascending: false });
        }

        const { data: posts, error } = await query.limit(20);

        if (error) throw error;

        if (!posts || posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments"></i>
                    <h3>No posts yet</h3>
                    <p>Be the first to share something with the community!</p>
                </div>
            `;
            return;
        }

        const userId = await getCurrentUserId();
        container.innerHTML = posts.map(post => createPostCard(post, userId)).join('');

        document.querySelectorAll('.action-btn[data-action="like"]').forEach(btn => {
            btn.addEventListener('click', () => handleLike(btn.dataset.postId));
        });

        document.querySelectorAll('.action-btn[data-action="comment"]').forEach(btn => {
            btn.addEventListener('click', () => handleComment(btn.dataset.postId));
        });

    } catch (error) {
        console.error('Error loading posts:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error loading posts</h3>
                <p>Please try again later</p>
            </div>
        `;
    }
}

function createPostCard(post, currentUserId) {
    const likeCount = post.post_reactions?.length || 0;
    const isLiked = post.post_reactions?.some(r => r.user_id === currentUserId) || false;
    const timeAgo = getTimeAgo(new Date(post.created_at));
    const avatar = post.users?.avatar_url || `https://via.placeholder.com/48/8B5FBF/FFFFFF?text=${(post.users?.display_name || 'U').charAt(0)}`;

    return `
        <div class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <img src="${avatar}" alt="${post.users?.display_name || 'User'}" class="post-avatar">
                <div class="post-author-info">
                    <h4>${post.users?.display_name || 'Anonymous'}</h4>
                    <div class="post-meta">
                        <span>${timeAgo}</span>
                        ${post.view_count ? `<span> • ${post.view_count} views</span>` : ''}
                    </div>
                </div>
            </div>
            <h3 class="post-title">${escapeHtml(post.title)}</h3>
            <p class="post-content">${escapeHtml(post.content)}</p>
            ${post.tags && post.tags.length > 0 ? `
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
            <div class="post-actions">
                <button class="action-btn ${isLiked ? 'liked' : ''}" data-action="like" data-post-id="${post.id}">
                    <i class="fas fa-heart"></i>
                    <span>${likeCount}</span>
                </button>
                <button class="action-btn" data-action="comment" data-post-id="${post.id}">
                    <i class="fas fa-comment"></i>
                    <span>Comment</span>
                </button>
                <button class="action-btn" data-action="share" data-post-id="${post.id}">
                    <i class="fas fa-share"></i>
                    <span>Share</span>
                </button>
            </div>
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
        }
    }

    return 'just now';
}

async function handleLike(postId) {
    if (!currentUser) return;

    try {
        const userId = await getCurrentUserId();
        if (!userId) return;

        const { data: existing } = await supabase
            .from('post_reactions')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', userId)
            .maybeSingle();

        if (existing) {
            await supabase
                .from('post_reactions')
                .delete()
                .eq('id', existing.id);
        } else {
            await supabase
                .from('post_reactions')
                .insert([{
                    post_id: postId,
                    user_id: userId,
                    reaction_type: 'like'
                }]);
        }

        loadPosts();
    } catch (error) {
        console.error('Error toggling like:', error);
    }
}

async function handleComment(postId) {
    alert('Comment feature coming soon!');
}

window.openNewPostModal = function() {
    document.getElementById('newPostModal').classList.add('active');
};

window.closeNewPostModal = function() {
    document.getElementById('newPostModal').classList.remove('active');
    document.getElementById('newPostForm').reset();
};

window.handleSubmitPost = async function(event) {
    event.preventDefault();

    if (!currentUser) {
        alert('You must be logged in to post');
        return;
    }

    const title = document.getElementById('postTitle').value.trim();
    const category = document.getElementById('postCategory').value;
    const content = document.getElementById('postContent').value.trim();
    const tagsInput = document.getElementById('postTags').value.trim();
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];

    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            alert('Error: User not found');
            return;
        }

        const { error } = await supabase
            .from('community_posts')
            .insert([{
                user_id: userId,
                title,
                content,
                category,
                tags
            }]);

        if (error) throw error;

        closeNewPostModal();
        loadPosts();
        alert('Post created successfully!');
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post. Please try again.');
    }
};

document.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        currentCategory = this.dataset.category;
        loadPosts();
    });
});

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        loadPosts();
    });
});

document.getElementById('newPostModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeNewPostModal();
    }
});
