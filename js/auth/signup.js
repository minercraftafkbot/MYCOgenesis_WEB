document.addEventListener('DOMContentLoaded', function() {
    const auth = firebase.auth();
    const signupForm = document.getElementById('signupForm');
    const googleSignUpBtn = document.getElementById('googleSignUp');
    const githubSignUpBtn = document.getElementById('githubSignUp');

    // Email/Password Sign Up
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const submitButton = signupForm.querySelector('button[type="submit"]');

        // Password validation
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        // Add loading state
        submitButton.classList.add('btn-loading');
        
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Update profile with user's name
                return userCredential.user.updateProfile({
                    displayName: `${firstName} ${lastName}`
                });
            })
            .then(() => {
                // Show success message and redirect
                showSuccess('Account created successfully!');
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 2000);
            })
            .catch((error) => {
                showError(error.message);
            })
            .finally(() => {
                submitButton.classList.remove('btn-loading');
            });
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
    googleSignUpBtn.addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        signUpWithProvider(provider);
    });

    // GitHub Sign Up
    githubSignUpBtn.addEventListener('click', () => {
        const provider = new firebase.auth.GithubAuthProvider();
        signUpWithProvider(provider);
    });

    // Generic provider sign up function
    function signUpWithProvider(provider) {
        auth.signInWithPopup(provider)
            .then((result) => {
                // Successful sign up
                showSuccess('Account created successfully!');
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 2000);
            })
            .catch((error) => {
                showError(error.message);
            });
    }

    // Error handling
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'auth-error-message mt-4';
        errorDiv.textContent = message;
        
        // Remove any existing error messages
        const existingError = signupForm.querySelector('.auth-error-message');
        if (existingError) {
            existingError.remove();
        }
        
        signupForm.appendChild(errorDiv);
        
        // Remove error message after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Success handling
    function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message mt-4';
        successDiv.textContent = message;
        
        // Remove any existing messages
        const existingMessage = signupForm.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        signupForm.appendChild(successDiv);
    }
});
