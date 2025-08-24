import { initializeModularFirebase } from '../firebase-init.js';
import { 
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    GithubAuthProvider,
    updateProfile,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize Firebase
    let firebaseServices;
    try {
        firebaseServices = await initializeModularFirebase();
    } catch (error) {
        console.error('Firebase initialization failed:', error);
        showError('Firebase initialization failed. Please refresh the page.');
        return;
    }
    
    const { auth, db } = firebaseServices;
    const signupForm = document.getElementById('signupForm');
    const googleSignUpBtn = document.getElementById('googleSignUp');
    const githubSignUpBtn = document.getElementById('githubSignUp');

    // Function to create user profile in Firestore
    async function createUserProfile(user, firstName, lastName, database) {
        try {
            const userProfile = {
                uid: user.uid,
                email: user.email,
                firstName: firstName || '',
                lastName: lastName || '',
                displayName: user.displayName || `${firstName} ${lastName}`.trim(),
                photoURL: user.photoURL || '',
                role: 'user',
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

            // Create user document in Firestore
            const userDocRef = doc(database, 'users', user.uid);
            await setDoc(userDocRef, userProfile);
            
            // Verify the document was created
            const userDoc = await getDoc(userDocRef);
            
            if (!userDoc.exists()) {
                throw new Error('Profile creation verification failed');
            }
            
        } catch (error) {
            console.error('Error creating user profile:', error);
            console.error('Error details:', {
                code: error.code,
                message: error.message,
                userUID: user.uid,
                userEmail: user.email,
                profileData: userProfile
            });
            
            if (error.code === 'permission-denied') {
                throw new Error('Permission denied: Unable to create user profile. Please check Firestore rules.');
            }
            
            throw error;
        }
    }
    
    // Check if user is already logged in (but don't redirect during signup process)
    let isSigningUp = false;
    onAuthStateChanged(auth, (user) => {
        if (user && !isSigningUp) {
            // User is signed in, redirect to home
            window.location.href = '../index.html';
        }
    });

    // Email/Password Sign Up
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const submitButton = signupForm.querySelector('button[type="submit"]');
        const termsCheckbox = document.getElementById('terms');

        // Validation
        if (!firstName || !lastName) {
            showError('Please enter your first and last name.');
            return;
        }

        if (!email) {
            showError('Please enter your email address.');
            return;
        }

        if (password.length < 6) {
            showError('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match.');
            return;
        }

        if (!termsCheckbox.checked) {
            showError('Please accept the Terms of Service and Privacy Policy.');
            return;
        }

        // Add loading state
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating Account...
        `;
        
        try {
            isSigningUp = true;
            
            // Create user account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Update profile with user's name
            await updateProfile(user, {
                displayName: `${firstName} ${lastName}`
            });
            
            // Create user profile in Firestore
            await createUserProfile(user, firstName, lastName, db);
            
            showSuccess('Account created successfully! Redirecting...');
            
            // Redirect after successful profile creation
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
            
        } catch (error) {
            console.error('Signup error:', error);
            showError(error);
        } finally {
            isSigningUp = false;
            // Restore button state
            submitButton.disabled = false;
            submitButton.innerHTML = 'Create Account';
        }
    });

    // Password strength check
    const passwordInput = document.getElementById('password');
    passwordInput.addEventListener('input', checkPasswordStrength);

    function checkPasswordStrength() {
        const password = passwordInput.value;
        let strength = 0;
        
        // Remove existing strength indicator
        const existingIndicator = document.querySelector('.password-strength');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/\d/) || password.match(/[^a-zA-Z\d]/)) strength++;

        // Create strength indicator
        const strengthDiv = document.createElement('div');
        strengthDiv.className = 'password-strength rounded';
        
        switch(strength) {
            case 1:
                strengthDiv.classList.add('password-strength-weak');
                break;
            case 2:
                strengthDiv.classList.add('password-strength-medium');
                break;
            case 3:
                strengthDiv.classList.add('password-strength-strong');
                break;
        }

        passwordInput.parentNode.appendChild(strengthDiv);
    }

    // Google Sign Up
    googleSignUpBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        await signUpWithProvider(provider, 'Google');
    });

    // GitHub Sign Up
    githubSignUpBtn.addEventListener('click', async () => {
        const provider = new GithubAuthProvider();
        provider.addScope('user:email');
        await signUpWithProvider(provider, 'GitHub');
    });

    // Generic provider sign up function
    async function signUpWithProvider(provider, providerName) {
        try {
            isSigningUp = true;
            
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            // Extract name from provider data
            const displayName = user.displayName || '';
            const nameParts = displayName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            // Create user profile in Firestore
            await createUserProfile(user, firstName, lastName, db);
            
            showSuccess(`Account created successfully with ${providerName}! Redirecting...`);
            
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
            
        } catch (error) {
            console.error(`${providerName} signup error:`, error);
            showError(error);
        } finally {
            isSigningUp = false;
        }
    }

    // Enhanced error handling with Firebase v10 error codes
    function showError(error) {
        let message = 'An error occurred. Please try again.';
        
        if (typeof error === 'string') {
            message = error;
        } else if (error.code) {
            switch (error.code) {
                case 'auth/email-already-in-use':
                    message = 'An account with this email already exists.';
                    break;
                case 'auth/invalid-email':
                    message = 'Invalid email address.';
                    break;
                case 'auth/operation-not-allowed':
                    message = 'Email/password accounts are not enabled.';
                    break;
                case 'auth/weak-password':
                    message = 'Password is too weak. Please choose a stronger password.';
                    break;
                case 'auth/network-request-failed':
                    message = 'Network error. Please check your connection.';
                    break;
                case 'auth/popup-closed-by-user':
                    message = 'Sign-up popup was closed. Please try again.';
                    break;
                case 'auth/cancelled-popup-request':
                    message = 'Only one popup request is allowed at a time.';
                    break;
                case 'auth/account-exists-with-different-credential':
                    message = 'An account already exists with the same email but different sign-in credentials.';
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
        const existingError = signupForm.querySelector('.auth-error-message');
        if (existingError) {
            existingError.remove();
        }
        
        signupForm.appendChild(errorDiv);
        
        // Remove error message after 7 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 7000);
    }

    // Success handling
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
        const existingMessage = signupForm.querySelector('.auth-success-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        signupForm.appendChild(successDiv);
    }
});
