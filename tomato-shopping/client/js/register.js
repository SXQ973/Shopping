//const API_URL = 'http://127.0.0.1:5500';

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const submitButton = document.getElementById('submitButton');
    const loader = document.getElementById('loader');
    const passwordInput = document.getElementById('password');
    const passwordStrength = document.querySelector('.password-strength');
    const notification = document.getElementById('notification');
    let csrfToken = null;

    // Fetch CSRF token
    async function fetchCsrfToken() {
        try {
            const response = await fetch('/api/csrf-token');
            const data = await response.json();
            console.log("data.token: ", data.token);
            csrfToken = data.token;
            document.getElementById('csrfToken').value = csrfToken;
        } catch (error) {
            showNotification('Failed to initialize security features. Please refresh the page.', false);
        }
    }

    // Show error messages
    function showError(message, field = 'general') {
        const errorElement = field === 'general' 
            ? document.getElementById('generalError')
            : document.querySelector(`[data-error="${field}"]`);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    function showNotification(message, isError = false) {
        notification.textContent = message;
        notification.style.backgroundColor = isError ? "#ff5000" : "#4CAF50";
        notification.style.display = 'block';
        // Hide after 3s
        setTimeout(() => {
            notification.style.display = 'none';
            // reset color
            notification.style.backgroundColor = "#4CAF50";
        }, 3000);
    }
    
    // Clear error messages
    function clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
    }

    // Check password strength
    function checkPasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/\d/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    }

    // Update password strength indicator
    function updatePasswordStrength(password) {
        const strength = checkPasswordStrength(password);
        
        passwordStrength.className = 'password-strength';
        if (strength < 3) {
            passwordStrength.classList.add('strength-weak');
        } else if (strength < 5) {
            passwordStrength.classList.add('strength-medium');
        } else {
            passwordStrength.classList.add('strength-strong');
        }
    }

    // Validate form
    function validateForm(email, password, confirmPassword) {
        let isValid = true;
        clearErrors();
        // Validate email address
        if (!email) {
            showError('Email is required', 'email');
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('Please enter a valid email address', 'email');
            isValid = false;
        }
        // Validate password strength
        if (!password) {
            showError('Password is required', 'password');
            isValid = false;
        } else if (checkPasswordStrength(password) < 5) {
            showError('Password does not meet security requirements', 'password');
            isValid = false;
        }
        // Confirm password
        if (password !== confirmPassword) {
            showError('Passwords do not match', 'confirmPassword');
            isValid = false;
        }
        return isValid;
    }

    // Handle resigter
    async function handleRegister(email, password) {
        loader.style.display = 'block';
        submitButton.disabled = true;
        //const token = await fetchCsrfToken();
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                credentials: 'include', 
                body: JSON.stringify({ email, password, csrf_token: csrfToken })
            });
            const data = await response.json();
            console.log("data", data);
            if (response.ok) {
                // Show success and redirect to login page
                showNotification('Registration successful! Redirecting to login page...', false);
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                console.log("Why???????? registration failed?")
                showNotification(data.error || 'Registration failed', true);
                // if csrf error, renew token
                if (response.status === 403) {
                    await fetchCsrfToken();
                }
            }
        } catch (error) {
            showNotification('An unexpected error occurred. Please try again.'+error.message, true);
        } finally {
            loader.style.display = 'none';
            submitButton.disabled = false;
        }
    }

    // listen on password input
    passwordInput.addEventListener('input', function() {
        updatePasswordStrength(this.value);
    });

    // Click on submit
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (validateForm(email, password, confirmPassword)) {
            await handleRegister(email, password);
        }
    });

    // Initialize CSRF token
    fetchCsrfToken();
});