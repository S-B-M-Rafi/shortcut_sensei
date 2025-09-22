/**
 * Modern Authentication System
 * Features: Social login, email verification, password validation, user management
 */

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.apiBaseUrl = '/api/auth'; // Backend API endpoint
        
        this.init();
    }

    init() {
        this.createAuthHTML();
        this.bindEvents();
        this.checkExistingAuth();
        this.initializePasswordValidation();
        this.initializeSocialAuth();
    }

    createAuthHTML() {
        const authHTML = `
            <!-- Authentication Overlay -->
            <div id="authOverlay" class="auth-overlay">
                <div class="auth-popup">
                    <button class="auth-close" id="authClose">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <div class="auth-header">
                        <h2>Welcome to Shortcut Sensei</h2>
                        <p>Join thousands of users mastering productivity shortcuts</p>
                    </div>

                    <div class="auth-tabs">
                        <button class="auth-tab active" data-tab="login">Sign In</button>
                        <button class="auth-tab" data-tab="signup">Sign Up</button>
                    </div>

                    <!-- Social Login -->
                    <div class="social-login">
                        <div class="social-buttons">
                            <button class="social-btn google" id="googleAuth">
                                <i class="fab fa-google"></i>
                                Google
                            </button>
                            <button class="social-btn facebook" id="facebookAuth">
                                <i class="fab fa-facebook-f"></i>
                                Facebook
                            </button>
                        </div>
                        
                        <div class="divider">
                            <span>or continue with email</span>
                        </div>
                    </div>

                    <!-- Login Form -->
                    <form class="auth-form active" id="loginForm">
                        <div class="form-group">
                            <input type="email" class="form-input" id="loginEmail" placeholder="Email address" required>
                            <div class="form-validation" id="loginEmailValidation"></div>
                        </div>
                        
                        <div class="form-group">
                            <input type="password" class="form-input" id="loginPassword" placeholder="Password" required>
                            <button type="button" class="password-toggle" id="loginPasswordToggle">
                                <i class="fas fa-eye"></i>
                            </button>
                            <div class="form-validation" id="loginPasswordValidation"></div>
                        </div>

                        <div class="remember-forgot">
                            <label class="remember-me">
                                <input type="checkbox" id="rememberMe">
                                <span>Remember me</span>
                            </label>
                            <a href="#" class="forgot-password" id="forgotPassword">Forgot password?</a>
                        </div>

                        <button type="submit" class="auth-submit" id="loginSubmit">
                            <span class="text">Sign In</span>
                            <span class="loading"></span>
                        </button>
                    </form>

                    <!-- Signup Form -->
                    <form class="auth-form" id="signupForm">
                        <div class="form-group">
                            <input type="text" class="form-input" id="signupName" placeholder="Full name" required>
                            <div class="form-validation" id="signupNameValidation"></div>
                        </div>
                        
                        <div class="form-group">
                            <input type="email" class="form-input" id="signupEmail" placeholder="Email address" required>
                            <div class="form-validation" id="signupEmailValidation"></div>
                        </div>
                        
                        <div class="form-group">
                            <input type="password" class="form-input" id="signupPassword" placeholder="Password" required>
                            <button type="button" class="password-toggle" id="signupPasswordToggle">
                                <i class="fas fa-eye"></i>
                            </button>
                            <div class="form-validation" id="signupPasswordValidation"></div>
                            <div class="password-strength" id="passwordStrength">
                                <div class="strength-bar">
                                    <div class="strength-progress"></div>
                                </div>
                                <div class="strength-text">Password strength: <span id="strengthText">Weak</span></div>
                            </div>
                        </div>

                        <div class="form-group">
                            <input type="password" class="form-input" id="confirmPassword" placeholder="Confirm password" required>
                            <div class="form-validation" id="confirmPasswordValidation"></div>
                        </div>

                        <button type="submit" class="auth-submit" id="signupSubmit">
                            <span class="text">Create Account</span>
                            <span class="loading"></span>
                        </button>

                        <div class="terms-text">
                            By signing up, you agree to our 
                            <a href="#" target="_blank">Terms of Service</a> and 
                            <a href="#" target="_blank">Privacy Policy</a>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Email Verification Popup -->
            <div id="verificationOverlay" class="auth-overlay">
                <div class="auth-popup verification-popup">
                    <button class="auth-close" id="verificationClose">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <div class="verification-icon">
                        <i class="fas fa-envelope"></i>
                    </div>
                    
                    <h3>Check Your Email</h3>
                    <p id="verificationText">We've sent a verification link to your email address. Please click the link to activate your account.</p>
                    
                    <button class="auth-submit" id="verificationOk">Got it</button>
                    <button class="resend-email" id="resendVerification">Resend verification email</button>
                </div>
            </div>

            <!-- User Profile Dropdown -->
            <div class="user-profile" id="userProfile">
                <button class="profile-btn" id="profileBtn">
                    <div class="profile-avatar" id="profileAvatar">U</div>
                    <span id="profileName">User</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                
                <div class="profile-dropdown" id="profileDropdown">
                    <a href="#" class="dropdown-item" id="myProfile">
                        <i class="fas fa-user"></i>
                        <span>My Profile</span>
                    </a>
                    <a href="#" class="dropdown-item" id="settings">
                        <i class="fas fa-cog"></i>
                        <span>Settings</span>
                    </a>
                    <a href="#" class="dropdown-item" id="logout">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </a>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', authHTML);
    }

    bindEvents() {
        // Open auth popup
        const getStartedBtn = document.querySelector('.get-started a');
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openAuthPopup();
            });
        }

        // Close auth popup
        document.getElementById('authClose').addEventListener('click', () => this.closeAuthPopup());
        document.getElementById('authOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'authOverlay') this.closeAuthPopup();
        });

        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Form submissions
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signupForm').addEventListener('submit', (e) => this.handleSignup(e));

        // Password toggles
        document.getElementById('loginPasswordToggle').addEventListener('click', () => this.togglePassword('loginPassword', 'loginPasswordToggle'));
        document.getElementById('signupPasswordToggle').addEventListener('click', () => this.togglePassword('signupPassword', 'signupPasswordToggle'));

        // Social auth
        document.getElementById('googleAuth').addEventListener('click', () => this.handleSocialAuth('google'));
        document.getElementById('facebookAuth').addEventListener('click', () => this.handleSocialAuth('facebook'));

        // Profile dropdown
        document.getElementById('profileBtn').addEventListener('click', () => this.toggleProfileDropdown());
        document.getElementById('logout').addEventListener('click', () => this.handleLogout());

        // Verification popup
        document.getElementById('verificationClose').addEventListener('click', () => this.closeVerificationPopup());
        document.getElementById('verificationOk').addEventListener('click', () => this.closeVerificationPopup());
        document.getElementById('resendVerification').addEventListener('click', () => this.resendVerification());

        // Forgot password
        document.getElementById('forgotPassword').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleForgotPassword();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!document.getElementById('userProfile').contains(e.target)) {
                document.getElementById('profileDropdown').classList.remove('active');
            }
        });

        // ESC key to close popups
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAuthPopup();
                this.closeVerificationPopup();
            }
        });
    }

    openAuthPopup() {
        document.getElementById('authOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeAuthPopup() {
        document.getElementById('authOverlay').classList.remove('active');
        document.body.style.overflow = '';
        this.resetForms();
    }

    closeVerificationPopup() {
        document.getElementById('verificationOverlay').classList.remove('active');
        document.body.style.overflow = '';
    }

    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update forms
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.getElementById(tab === 'login' ? 'loginForm' : 'signupForm').classList.add('active');

        this.resetForms();
    }

    resetForms() {
        document.querySelectorAll('.auth-form').forEach(form => form.reset());
        document.querySelectorAll('.form-validation').forEach(val => {
            val.style.display = 'none';
            val.classList.remove('error', 'success');
        });
        document.getElementById('passwordStrength').style.display = 'none';
    }

    togglePassword(inputId, toggleId) {
        const input = document.getElementById(inputId);
        const toggle = document.getElementById(toggleId);
        const icon = toggle.querySelector('i');

        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }

    initializePasswordValidation() {
        const signupPassword = document.getElementById('signupPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        const strengthBar = document.querySelector('.strength-progress');
        const strengthText = document.getElementById('strengthText');
        const strengthContainer = document.getElementById('passwordStrength');

        signupPassword.addEventListener('input', (e) => {
            const password = e.target.value;
            if (password.length > 0) {
                strengthContainer.style.display = 'block';
                const strength = this.calculatePasswordStrength(password);
                this.updatePasswordStrength(strength, strengthBar, strengthText);
            } else {
                strengthContainer.style.display = 'none';
            }
        });

        confirmPassword.addEventListener('input', () => this.validatePasswordMatch());
    }

    calculatePasswordStrength(password) {
        let strength = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        strength = Object.values(checks).filter(Boolean).length;
        return { strength, checks };
    }

    updatePasswordStrength(result, strengthBar, strengthText) {
        const { strength } = result;
        const colors = ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#0f5132'];
        const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        
        const percentage = (strength / 5) * 100;
        strengthBar.style.width = `\${percentage}%`;
        strengthBar.style.backgroundColor = colors[strength - 1] || colors[0];
        strengthText.textContent = texts[strength - 1] || texts[0];
        strengthText.style.color = colors[strength - 1] || colors[0];
    }

    validatePasswordMatch() {
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const validation = document.getElementById('confirmPasswordValidation');

        if (confirmPassword.length > 0) {
            if (password === confirmPassword) {
                this.showValidation('confirmPasswordValidation', 'Passwords match', 'success');
            } else {
                this.showValidation('confirmPasswordValidation', 'Passwords do not match', 'error');
            }
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showValidation(elementId, message, type) {
        const element = document.getElementById(elementId);
        element.textContent = message;
        element.className = `form-validation \${type}`;
        element.style.display = 'block';
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Validation
        if (!this.validateEmail(email)) {
            this.showValidation('loginEmailValidation', 'Please enter a valid email address', 'error');
            return;
        }

        if (password.length < 6) {
            this.showValidation('loginPasswordValidation', 'Password must be at least 6 characters', 'error');
            return;
        }

        this.setLoadingState('loginSubmit', true);

        try {
            const response = await fetch(`\${this.apiBaseUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, rememberMe })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.emailVerified) {
                    this.handleSuccessfulLogin(data.user, data.token);
                } else {
                    this.showEmailVerificationPopup(email);
                }
            } else {
                this.showValidation('loginPasswordValidation', data.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showValidation('loginPasswordValidation', 'Network error. Please try again.', 'error');
        } finally {
            this.setLoadingState('loginSubmit', false);
        }
    }

    async handleSignup(e) {
        e.preventDefault();

        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (name.length < 2) {
            this.showValidation('signupNameValidation', 'Name must be at least 2 characters', 'error');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showValidation('signupEmailValidation', 'Please enter a valid email address', 'error');
            return;
        }

        const passwordStrength = this.calculatePasswordStrength(password);
        if (passwordStrength.strength < 3) {
            this.showValidation('signupPasswordValidation', 'Password is too weak', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showValidation('confirmPasswordValidation', 'Passwords do not match', 'error');
            return;
        }

        this.setLoadingState('signupSubmit', true);

        try {
            const response = await fetch(`\${this.apiBaseUrl}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.closeAuthPopup();
                this.showEmailVerificationPopup(email);
            } else {
                this.showValidation('signupEmailValidation', data.message || 'Signup failed', 'error');
            }
        } catch (error) {
            console.error('Signup error:', error);
            this.showValidation('signupEmailValidation', 'Network error. Please try again.', 'error');
        } finally {
            this.setLoadingState('signupSubmit', false);
        }
    }

    initializeSocialAuth() {
        // Initialize Google Auth
        if (typeof gapi !== 'undefined') {
            gapi.load('auth2', () => {
                gapi.auth2.init({
                    client_id: 'YOUR_GOOGLE_CLIENT_ID'
                });
            });
        }

        // Initialize Facebook SDK
        if (typeof FB !== 'undefined') {
            FB.init({
                appId: 'YOUR_FACEBOOK_APP_ID',
                cookie: true,
                xfbml: true,
                version: 'v18.0'
            });
        }
    }

    async handleSocialAuth(provider) {
        try {
            let socialData = null;

            if (provider === 'google') {
                socialData = await this.authenticateWithGoogle();
            } else if (provider === 'facebook') {
                socialData = await this.authenticateWithFacebook();
            }

            if (socialData) {
                const response = await fetch(`\${this.apiBaseUrl}/social-login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ provider, socialData })
                });

                const data = await response.json();

                if (response.ok) {
                    this.handleSuccessfulLogin(data.user, data.token);
                } else {
                    alert(data.message || 'Social login failed');
                }
            }
        } catch (error) {
            console.error('Social auth error:', error);
            alert('Social login failed. Please try again.');
        }
    }

    async authenticateWithGoogle() {
        return new Promise((resolve, reject) => {
            if (typeof gapi === 'undefined') {
                reject('Google API not loaded');
                return;
            }

            const authInstance = gapi.auth2.getAuthInstance();
            authInstance.signIn().then(googleUser => {
                const profile = googleUser.getBasicProfile();
                resolve({
                    id: profile.getId(),
                    name: profile.getName(),
                    email: profile.getEmail(),
                    picture: profile.getImageUrl(),
                    token: googleUser.getAuthResponse().id_token
                });
            }).catch(reject);
        });
    }

    async authenticateWithFacebook() {
        return new Promise((resolve, reject) => {
            if (typeof FB === 'undefined') {
                reject('Facebook SDK not loaded');
                return;
            }

            FB.login(response => {
                if (response.authResponse) {
                    FB.api('/me', { fields: 'name,email,picture' }, userInfo => {
                        resolve({
                            id: userInfo.id,
                            name: userInfo.name,
                            email: userInfo.email,
                            picture: userInfo.picture.data.url,
                            token: response.authResponse.accessToken
                        });
                    });
                } else {
                    reject('Facebook login failed');
                }
            }, { scope: 'email' });
        });
    }

    handleSuccessfulLogin(user, token) {
        this.currentUser = user;
        this.isLoggedIn = true;
        
        // Store auth data
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        this.closeAuthPopup();
        this.updateUIForLoggedInUser();
        this.showWelcomeMessage(user.name);
    }

    updateUIForLoggedInUser() {
        // Hide get started button, show profile
        const getStartedItem = document.querySelector('.get-started');
        const userProfile = document.getElementById('userProfile');
        
        if (getStartedItem) getStartedItem.style.display = 'none';
        if (userProfile) userProfile.classList.add('active');

        // Update profile display
        const profileName = document.getElementById('profileName');
        const profileAvatar = document.getElementById('profileAvatar');
        
        if (profileName) profileName.textContent = this.currentUser.name.split(' ')[0];
        if (profileAvatar) profileAvatar.textContent = this.currentUser.name.charAt(0).toUpperCase();
    }

    showEmailVerificationPopup(email) {
        document.getElementById('verificationText').innerHTML = 
            `We've sent a verification link to <strong>\${email}</strong>. Please click the link to activate your account.`;
        document.getElementById('verificationOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    async resendVerification() {
        // Implementation for resending verification email
        try {
            const response = await fetch(`\${this.apiBaseUrl}/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: this.currentUser?.email })
            });

            if (response.ok) {
                alert('Verification email sent!');
            } else {
                alert('Failed to send verification email');
            }
        } catch (error) {
            console.error('Resend verification error:', error);
            alert('Network error. Please try again.');
        }
    }

    toggleProfileDropdown() {
        document.getElementById('profileDropdown').classList.toggle('active');
    }

    handleLogout() {
        this.currentUser = null;
        this.isLoggedIn = false;
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        
        // Update UI
        const getStartedItem = document.querySelector('.get-started');
        const userProfile = document.getElementById('userProfile');
        
        if (getStartedItem) getStartedItem.style.display = 'block';
        if (userProfile) userProfile.classList.remove('active');
        
        document.getElementById('profileDropdown').classList.remove('active');
    }

    checkExistingAuth() {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('currentUser');
        
        if (token && userData) {
            this.currentUser = JSON.parse(userData);
            this.isLoggedIn = true;
            this.updateUIForLoggedInUser();
        }
    }

    setLoadingState(buttonId, isLoading) {
        const button = document.getElementById(buttonId);
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    showWelcomeMessage(name) {
        // Create a temporary welcome notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #06a3be, #8a2be2);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 10000;
            font-weight: 500;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        notification.innerHTML = `Welcome back, \${name}! 🎉`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.style.transform = 'translateX(0)', 100);
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    async handleForgotPassword() {
        const email = prompt('Enter your email address:');
        if (email && this.validateEmail(email)) {
            try {
                const response = await fetch(`\${this.apiBaseUrl}/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                if (response.ok) {
                    alert('Password reset link sent to your email!');
                } else {
                    alert('Failed to send reset link. Please try again.');
                }
            } catch (error) {
                console.error('Forgot password error:', error);
                alert('Network error. Please try again.');
            }
        }
    }
}

// Initialize the authentication system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});

// Email verification handler (for when user clicks verification link)
function handleEmailVerification(token) {
    fetch(`/api/auth/verify-email?token=\${token}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Email verified successfully! You can now log in.');
                window.location.href = '/';
            } else {
                alert('Verification failed. Please try again.');
            }
        })
        .catch(error => {
            console.error('Verification error:', error);
            alert('Verification failed. Please try again.');
        });
}
