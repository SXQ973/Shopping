//const API_URL = 'http://127.0.0.1:5500';

document.addEventListener('DOMContentLoaded', function() {
    const changePasswordForm = document.getElementById('changePasswordForm');
    const submitButton = document.getElementById('submitButton');
    const loader = document.getElementById('loader');
    const newPasswordInput = document.getElementById('newPassword');
    const passwordStrength = document.querySelector('.password-strength');
    let csrfToken = null;
    const email = localStorage.getItem('userEmail');

    const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.addEventListener('click', function() {
                window.history.back();
            });
        }

    // Fetch CSRF token
    async function fetchCsrfToken() {
        try {
            const response = await fetch('/api/csrf-token');
            const data = await response.json();
            csrfToken = data.token;
            document.getElementById('csrfToken').value = csrfToken;
        } catch (error) {
            showNotification('Failed to initialize security features. Please refresh the page.', false);
        }
    }

    // Show notification
    function showNotification(message, isError = false) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.style.backgroundColor = isError ? "#ff5000" : "#4CAF50";
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
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
    function validateForm(currentPassword, newPassword, confirmPassword) {
        let isValid = true;
        clearErrors();
        if (!currentPassword) {
            showError('Current password is required', 'currentPassword');
            isValid = false;
        }
        if (!newPassword) {
            showError('New password is required', 'newPassword');
            isValid = false;
        } else if (checkPasswordStrength(newPassword) < 5) {
            showError('Password does not meet security requirements', 'newPassword');
            isValid = false;
        }
        if (newPassword === currentPassword) {
            showError('New password must be different from current password', 'newPassword');
            isValid = false;
        }
        if (newPassword !== confirmPassword) {
            showError('Passwords do not match', 'confirmPassword');
            isValid = false;
        }
        return isValid;
    }

    // Handle password change
    async function handlePasswordChange(currentPassword, newPassword) {
        loader.style.display = 'block';
        submitButton.disabled = true;
        try {
            const response = await fetch('/api/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({ 
                    email,
                    currentPassword, 
                    newPassword,
                    csrf_token: csrfToken 
                })
            });
            const data = await response.json();
            if (response.ok) {
                showNotification('Password changed successfully! Redirecting...', false);
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                showNotification(data.message || 'Failed to change password', true);
                if (response.status === 403) {
                    await fetchCsrfToken();
                }
            }
        } catch (error) {
            console.log("error:",error);
            showNotification('An unexpected error occurred. Please try again.??', true);
        } finally {
            loader.style.display = 'none';
            submitButton.disabled = false;
        }
    }

    // Listen for password input to show strength
    newPasswordInput.addEventListener('input', function() {
        updatePasswordStrength(this.value);
    });

    // Handle form submission
    changePasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (validateForm(currentPassword, newPassword, confirmPassword)) {
            //console.log("frontend: email:",email,"currentPassword:",currentPassword,"newPassword:",newPassword);
            if(!email)
                throw new Error('No user email in storage');
            await handlePasswordChange(currentPassword, newPassword);
        }
    });

    // Initialize
    fetchCsrfToken();
});