const express = require('express');
const pool = require('../config/db');
const SecurityUtils = require('../utils/security');

const router = express.Router();

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
router.post('/register', async (req, res) => {
    try {
        const { email, password, csrf_token } = SecurityUtils.sanitizeInput(req.body);

        // 验证CSRF Token
        const [tokens] = await pool.execute(
            'SELECT * FROM csrf_tokens WHERE token = ? AND expires > NOW()', 
            [csrf_token]
        );

        if (tokens.length === 0) {
            return res.status(403).json({ error: 'Invalid CSRF token' });
        }

        // 验证输入
        if (!SecurityUtils.isValidEmail(email) || !SecurityUtils.isValidPassword(password)) {
            return res.status(400).json({ error: 'Invalid input format' });
        }

        // 检查邮箱是否已存在
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // 哈希密码并创建用户
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
router.post('/login', async (req, res) => {
    try {
        const { email, password, csrf_token } = SecurityUtils.sanitizeInput(req.body);
        // 验证CSRF Token
        const [tokens] = await pool.execute(
            'SELECT * FROM csrf_tokens WHERE token = ? AND expires > NOW()',
            [csrf_token]
        );
        if (!tokens || tokens.length === 0) {
            return res.status(403).json({ error: 'Invalid CSRF token' });
        }
        // 获取用户
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        const user = users[0];
        if (!user || !(await SecurityUtils.verifyPassword(password, user.password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // 创建会话
        const sessionId = SecurityUtils.generateSessionId();
        const expires = new Date(Date.now() + parseInt(process.env.COOKIE_MAX_AGE));

        await pool.execute(
            'INSERT INTO sessions (session_id, user_id, expires) VALUES (?, ?, ?)',
            [sessionId, user.id, expires]
        );

        // 设置会话cookie
        res.cookie(process.env.SESSION_COOKIE_NAME, sessionId, {
            expires,
            httpOnly: process.env.COOKIE_HTTP_ONLY === 'true',
            secure: process.env.COOKIE_SECURE === 'true',
            sameSite: process.env.COOKIE_SAME_SITE,
            signed: true
        });

        res.json({
            success: true,
            redirect: user.is_admin ? '/admin' : '/index'
        });
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
        res.json({ success: true, redirect: '/login' });
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