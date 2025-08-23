import { initializeModularFirebase } from '../firebase-init.js';
import { 
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    GithubAuthProvider,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize Firebase
    let firebaseServices;
    try {
        firebaseServices = await initializeModularFirebase();
        console.log('✅ Firebase initialized for login page');
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        showError('Firebase initialization failed. Please refresh the page.');
        return;
    }
    
    const { auth, db } = firebaseServices;
    const loginForm = document.getElementById('loginForm');
    const googleSignInBtn = document.getElementById('googleSignIn');
    const githubSignInBtn = document.getElementById('githubSignIn');

    // Function to ensure user profile exists in Firestore
    async function ensureUserProfile(user) {
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (!userDoc.exists()) {
                // Create user profile if it doesn't exist
                const displayName = user.displayName || '';
                const nameParts = displayName.split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';
                
                const userProfile = {
                    uid: user.uid,
                    email: user.email,
                    firstName: firstName,
                    lastName: lastName,
                    displayName: user.displayName || '',
                    photoURL: user.photoURL || '',
                    role: 'user', // Default role
                    status: 'active',
                    emailVerified: user.emailVerified,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    lastLogin: serverTimestamp(),
                    preferences: {
                        notifications: true,
                        newsletter: false
                    }
                };
                
                await setDoc(userDocRef, userProfile);
                console.log('✅ User profile created in Firestore');
            } else {
                // Update last login time
                await updateDoc(userDocRef, {
                    lastLogin: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                console.log('✅ User profile updated with last login');
            }
        } catch (error) {
            console.error('❌ Error ensuring user profile:', error);
            // Don't throw error here to avoid breaking the login flow
        }
    }
    
    // Check if user is already logged in
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, redirect to home
            window.location.href = '../index.html';
        }
    });

    // Email/Password Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitButton = loginForm.querySelector('button[type="submit"]');
        
        // Add loading state
        submitButton.classList.add('btn-loading');
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Successful login
            const user = userCredential.user;
            
            // Ensure user profile exists in Firestore
            await ensureUserProfile(user);
            
            window.location.href = '../index.html'; // Redirect to home page
        } catch (error) {
            // Handle errors
            showError(error.message);
        } finally {
            submitButton.classList.remove('btn-loading');
        }
    });

    // Google Sign In
    googleSignInBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            // Ensure user profile exists in Firestore
            await ensureUserProfile(user);
            
            window.location.href = '../index.html'; // Redirect to home page
        } catch (error) {
            showError(error.message);
        }
    });

    // GitHub Sign In
    githubSignInBtn.addEventListener('click', async () => {
        const provider = new GithubAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            // Ensure user profile exists in Firestore
            await ensureUserProfile(user);
            
            window.location.href = '../index.html'; // Redirect to home page
        } catch (error) {
            showError(error.message);
        }
    });

    // Enhanced error handling with Firebase v10 error codes
    function showError(error) {
        let message = 'An error occurred. Please try again.';
        
        if (typeof error === 'string') {
            message = error;
        } else if (error.code) {
            switch (error.code) {
                case 'auth/user-not-found':
                    message = 'No account found with this email address.';
                    break;
                case 'auth/wrong-password':
                    message = 'Incorrect password.';
                    break;
                case 'auth/invalid-email':
                    message = 'Invalid email address.';
                    break;
                case 'auth/user-disabled':
                    message = 'This account has been disabled.';
                    break;
                case 'auth/too-many-requests':
                    message = 'Too many failed attempts. Please try again later.';
                    break;
                case 'auth/network-request-failed':
                    message = 'Network error. Please check your connection.';
                    break;
                case 'auth/popup-closed-by-user':
                    message = 'Sign-in popup was closed. Please try again.';
                    break;
                case 'auth/cancelled-popup-request':
                    message = 'Only one popup request is allowed at a time.';
                    break;
                default:
                    message = error.message || message;
            }
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'auth-error-message mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm';
        errorDiv.innerHTML = `
            <div class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                ${message}
            </div>
        `;
        
        // Remove any existing error messages
        const existingError = loginForm.querySelector('.auth-error-message');
        if (existingError) {
            existingError.remove();
        }
        
        loginForm.appendChild(errorDiv);
        
        // Remove error message after 7 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 7000);
    }
    
    // Success message helper
    function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'auth-success-message mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm';
        successDiv.innerHTML = `
            <div class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                ${message}
            </div>
        `;
        
        // Remove any existing messages
        const existingMessage = loginForm.querySelector('.auth-success-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        loginForm.appendChild(successDiv);
    }
});

