const express = require('express');
const pool = require('../config/db');
const SecurityUtils = require('../utils/security');

const router = express.Router();

const validateCsrfToken = async(req, res, next) => {
    // Skip CSRF validation for GET, HEAD, and OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    try {
        // Get CSRF token from headers
        const token = req.headers['x-csrf-token'];
        // Check if token is present
        if (!token) {
            return res.status(403).json({
                error: 'CSRF token missing in headers'
            });
        }
        // Check if token is valid
        const [tokens] = await pool.execute(
            'SELECT * FROM csrf_tokens WHERE token = ? AND expires > NOW()', 
            [token]
        );
        if (tokens.length === 0) {
            return res.status(403).json({ error: 'Invalid CSRF token' });
        }
        next();
    } catch (error) {
        console.error('CSRF Validation Error:', error);
        return res.status(500).json({
            error: 'CSRF validation failed'
        });
    }
};

// CSRF token generation
router.get('/csrf-token', async (req, res) => {
    try {
        const token = SecurityUtils.generateToken();
        const expires = new Date(Date.now() + 3600000); // 1小时后过期

        await pool.execute(
            'INSERT INTO csrf_tokens (token, expires) VALUES (?, ?)',
            [token, expires]
        );
        res.json({ token });
    } catch (error) {
        console.error('CSRF token generation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User registration
router.post('/register', validateCsrfToken, async (req, res) => {
    try {
        const { email, password} = SecurityUtils.sanitizeInput(req.body);
        // validate email and password
        if (!SecurityUtils.isValidEmail(email) || !SecurityUtils.isValidPassword(password)) {
            return res.status(400).json({ error: 'Invalid input format' });
        }
        // check if email is already registered
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        // hash password
        const hashedPassword = await SecurityUtils.hashPassword(password);
        await pool.execute(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );
        res.json({ success: true, message: 'Registration successful' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Log in 
router.post('/login', validateCsrfToken, async (req, res) => {
    try {
        const { email, password} = SecurityUtils.sanitizeInput(req.body);
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        const user = users[0];
        if (!user || !(await SecurityUtils.verifyPassword(password, user.password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // Generate session id
        const sessionId = SecurityUtils.generateSessionId();
        const expires = new Date(Date.now() + parseInt(process.env.COOKIE_MAX_AGE));

        await pool.execute(
            'INSERT INTO sessions (session_id, user_id, expires) VALUES (?, ?, ?)',
            [sessionId, user.id, expires]
        );
        // Set session user
        req.session.user = { id: user.id, email: user.email, isAdmin: Boolean(user.isAdmin) };
        // Set session cookie
        res.cookie(process.env.SESSION_COOKIE_NAME, sessionId, {
            expires,
            httpOnly: process.env.COOKIE_HTTP_ONLY === 'true',
            secure: process.env.COOKIE_SECURE === 'true',
            sameSite: process.env.COOKIE_SAME_SITE,
            signed: true,
            path: '/' // cookie path makes it accessible to all routes
        });
        
        res.json({
            success: true,
            redirect: Boolean(user.isAdmin)? '/admin' : '/index'
        });
        console.log("auth.js:login:redirect:",Boolean(user.isAdmin)? '/admin' : '/index');
      //  console.log("auth.js:login:res",res);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Log out
router.post('/logout', async (req, res) => {
    try {
        const sessionId = req.signedCookies[process.env.SESSION_COOKIE_NAME];
        
        if (sessionId) {
            await pool.execute(
                'DELETE FROM sessions WHERE session_id = ?',
                [sessionId]
            );
        }
        res.clearCookie(process.env.SESSION_COOKIE_NAME);
        res.json({ success: true});
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify password
router.post('/verify-password', async (req, res) => {
    try {
        const { email, password, csrf_token } = req.body;
        // Verify CSRF Token
        const [tokens] = await pool.execute(
            'SELECT * FROM csrf_tokens WHERE token = ? AND expires > NOW()',
            [csrf_token]
        );
        if (!tokens || tokens.length === 0) {
            return res.status(403).json({ error: 'Invalid CSRF token' });
        }
        // find user
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        const user = users[0];
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // verify password
        const isMatch = await SecurityUtils.verifyPassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        res.json({ message: 'Password verified successfully' });
    } catch (error) {
        console.error('Error in verify-password:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Change password
router.post('/change-password', async (req, res) => {
    try {
        const { email, currentPassword, newPassword,csrf_token } = req.body;
        // Verify CSRF Token
        const [tokens] = await pool.execute(
            'SELECT * FROM csrf_tokens WHERE token = ? AND expires > NOW()',
            [csrf_token]
        );
        if (!tokens || tokens.length === 0) {
            return res.status(403).json({ error: 'Invalid CSRF token' });
        }
        console.log("auth.js:email:",email,"currentPassword:",currentPassword,"newPassword:",newPassword);
        // find user
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        const user = users[0];
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Verify current password
        let isMatch = await SecurityUtils.verifyPassword(currentPassword, user.password)
        if(!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        // verify if password does not change
        isMatch = await SecurityUtils.verifyPassword(newPassword, user.password);
        if (isMatch) {
            return res.status(400).json({ message: 'Current password does not change' });
        }
        // password strength check
        if (!SecurityUtils.isValidPassword(newPassword)) {
            return res.status(400).json({ 
                message: 'Password must contain at least 8 characters, including uppercase, lowercase, numbers and special characters' 
            });
        }
        // hash new password
        const hashedPassword = await SecurityUtils.hashPassword(newPassword);
        // Renew password
        user.password = hashedPassword;
        await pool.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, user.id]
        );
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error in change-password:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;