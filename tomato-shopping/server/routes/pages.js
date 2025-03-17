const SecurityUtils = require('../utils/security');
const express = require('express');
const path = require('path'); 
const pool = require('../config/db');
const router = express.Router();

const checkAuth = (req, res, next) => {
    const sessionId = req.signedCookies[process.env.SESSION_COOKIE_NAME];
    if (!sessionId) {
        console.log("No session cookie found",sessionId);
        return res.redirect('/login');
    }
    next();
};

// Check admin middleware
const checkAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.redirect('/');
    }
    next();
};

// Add security headers for every html requests
const addSecurityHeaders = (req, res, next) => {
    const nonce = SecurityUtils.generateNonce();
    res.locals.nonce = nonce;  
    // 设置CSP
    res.setHeader('Content-Security-Policy', SecurityUtils.generateCSP(nonce));
    // 其他安全headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    next();
};

router.use(addSecurityHeaders);

// Default router
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/login.html'));
});

// Login page
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/login.html'));
});

// Register page
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/register.html'));
});

// index page(main page)
router.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/index.html'));
});

// Admin page
router.get('/admin', checkAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/admin.html'));
});

// change password page
router.get('/change-password', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/change-password.html'));
});

module.exports = router;