//const API_URL = 'http://127.0.0.1:5500';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const submitButton = document.getElementById('submitButton');
    const loader = document.getElementById('loader');
    const notification = document.getElementById('notification');
    let csrfToken = null;

    // Fetch CSRF token 
    async function fetchCsrfToken() {
        try {
            const response = await fetch('/api/csrf-token');
            const data = await response.json();
            csrfToken = data.token;
            document.getElementById('csrfToken').value = csrfToken;
        } catch (error) {
            showError('Failed to initialize security features. Please refresh the page.');
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

    // show notification
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
    
    // clear error messages
    function clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
    }

    // Validate email and password
    function validateForm(email, password) {
        let isValid = true;
        clearErrors();
        if (!email) {
            showError('Email is required', 'email');
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('Please enter a valid email address', 'email');
            isValid = false;
        }
        if (!password) {
            showError('Password is required', 'password');
            isValid = false;
        }
        return isValid;
    }

    // Handle log in
    async function handleLogin(email, password) {
        loader.style.display = 'block';
        submitButton.disabled = true;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({ email, password})
            });
            const data = await response.json();
            console.log("login.js:data",data)
            if (response.ok) {
                if (data.redirect) {
                    // Store user email to local storge
                    localStorage.setItem('userEmail', email);
                    // redirect to index.html or admin.html
                    window.location.href = data.redirect;
                }
            } else {
                showError(data.error || 'Login failed');
                // if csrf error, renew token
                if (response.status === 403) {
                    await fetchCsrfToken();
                }
            }
        } catch (error) {
            showNotification('An unexpected error occurred. Please try again.', true);
        } finally {
            loader.style.display = 'none';
            submitButton.disabled = false;
        }
    }

    // Click on submit form
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (validateForm(email, password)) {
            await handleLogin(email, password);
        }
    });
    // Initialize CSRF token
    fetchCsrfToken();
});