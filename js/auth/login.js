import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    GithubAuthProvider
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const googleSignInBtn = document.getElementById('googleSignIn');
    const githubSignInBtn = document.getElementById('githubSignIn');

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
            await signInWithPopup(auth, provider);
            window.location.href = '../index.html'; // Redirect to home page
        } catch (error) {
            showError(error.message);
        }
    });

    // GitHub Sign In
    githubSignInBtn.addEventListener('click', async () => {
        const provider = new GithubAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            window.location.href = '../index.html'; // Redirect to home page
        } catch (error) {
            showError(error.message);
        }
    });

    // Error handling
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'auth-error-message mt-4';
        errorDiv.textContent = message;
        
        // Remove any existing error messages
        const existingError = loginForm.querySelector('.auth-error-message');
        if (existingError) {
            existingError.remove();
        }
        
        loginForm.appendChild(errorDiv);
        
        // Remove error message after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
});

