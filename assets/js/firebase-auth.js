// Firebase imports
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Firebase Configuration for Shortcut Sensei
// Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id" // Optional, for Google Analytics
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Configure social authentication providers
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

const githubProvider = new GithubAuthProvider();
githubProvider.addScope('user:email');

// Authentication functions
class AuthService {
  
  // Email/Password Registration with Email Verification
  static async registerWithEmail(email, password, userData = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Send email verification
      await sendEmailVerification(user);
      
      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: new Date(),
        emailVerified: false,
        ...userData
      });
      
      return {
        success: true,
        user: user,
        message: 'Registration successful! Please check your email for verification.'
      };
    } catch (error) {
      return {
        success: false,
        error: error.code,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // Email/Password Sign In
  static async signInWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (!user.emailVerified) {
        return {
          success: false,
          error: 'email-not-verified',
          message: 'Please verify your email before signing in.'
        };
      }
      
      return {
        success: true,
        user: user,
        message: 'Sign in successful!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.code,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // Google Sign In
  static async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Store user data in Firestore
      await this.storeUserData(user, 'google');
      
      return {
        success: true,
        user: user,
        message: 'Google sign in successful!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.code,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // GitHub Sign In
  static async signInWithGithub() {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      
      // Store user data in Firestore
      await this.storeUserData(user, 'github');
      
      return {
        success: true,
        user: user,
        message: 'GitHub sign in successful!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.code,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // Password Reset
  static async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Password reset email sent successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.code,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign Out
  static async signOut() {
    try {
      await signOut(auth);
      return {
        success: true,
        message: 'Signed out successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.code,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // Store user data in Firestore
  static async storeUserData(user, provider) {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          provider: provider,
          createdAt: new Date(),
          emailVerified: user.emailVerified,
          lastSignIn: new Date()
        });
      } else {
        // Update last sign in
        await setDoc(userRef, {
          lastSignIn: new Date()
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  }

  // Authentication state observer
  static onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }

  // Get current user
  static getCurrentUser() {
    return auth.currentUser;
  }

  // Error message mapping
  static getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/email-already-in-use': 'This email is already registered. Please use a different email or sign in.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed before completing the process.',
      'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups for this site.',
      'email-not-verified': 'Please verify your email address before signing in.',
      'default': 'An error occurred. Please try again.'
    };
    
    return errorMessages[errorCode] || errorMessages['default'];
  }
}

// Export for use in other files
export { 
  auth, 
  db, 
  AuthService,
  googleProvider,
  githubProvider
};