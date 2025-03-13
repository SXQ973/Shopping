// Environment variables configuration
require("dotenv").config();
// Core web framework for Node.js
const express = require('express');
// Enable Cross-Origin Resource Sharing (CORS)
const cors = require('cors');
// Node.js built-in module for handling file paths
const path = require('path');
// // Parse incoming request bodies
// const bodyParser = require('body-parser');
// Security middleware that sets various HTTP headers
const helmet = require('helmet');
// CSRF protection middleware
const csrf = require("csurf");
// Parse Cookie header and populate req.cookies
const cookieParser = require('cookie-parser');
// Express session middleware
const session = require('express-session'); 
// Import routes and utilities
const SecurityUtils = require('./utils/security');
const authRoutes = require('./routes/auth');
const pageRoutes = require('./routes/pages');
const productRoutes = require('./routes/product');

// Initialize Express application
const app = express();

// Security Middleware
app.use(helmet());

// JSON and Cookie parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// app.use(bodyParser.json({limit: '50mb'}));
// // Size limit for URL-encoded data // Allow rich objects and arrays in URL-encoded format
// app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
// Parse cookies with signing secret
app.use(cookieParser(process.env.COOKIE_SECRET));

// CORS Configuration
app.use(cors({
    origin:['http://localhost:5500', 'http://127.0.0.1:5500'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'Origin'],
    credentials: true // Allow credentials (cookies, authorization headers)
}));

// Session Configuration
// app.use(session({
//     secret: process.env.SESSION_SECRET,
//     name: 'sessionId',  // Custom session cookie name
//     resave: false,  // Don't save session if unmodified
//     saveUninitialized: false,  // Don't create session until something stored
//     cookie: {
//         secure: false,  // Require HTTPS in production， for test, set false
//         httpOnly: true,  // Prevent client-side access to cookie
//         maxAge: 24 * 60 * 60 * 1000,  // 24 hours
//         sameSite: 'lax'  // CSRF protection
//     }
// }));

/*
CSRF Protection: Protects against Cross-Site Request Forgery
Double Submit pattern:
-- One stored in an httpOnly cookie (automatically sent)
-- One stored in a form or request header (which needs to be manually added)
*/
// app.use(csrf({
//     cookie: {
//         httpOnly: true,      // Avoid client side read js
//         secure: false,  // 生产环境需要 HTTPS
//   //      maxAge: 3600,        // cookie expire time
//         sameSite: 'lax'   // CSRF protection
//     }
// }));

// Config security header
app.use((req, res, next) => {
    // Generate unique cryptographic nonce for CSP
    const nonce = SecurityUtils.generateNonce();
    // Make nonce available to views/templates
    res.locals.nonce = nonce;
    // Prevents XSS attacks by controlling resource loading
    res.setHeader('Content-Security-Policy', SecurityUtils.generateCSP(nonce));
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Clickjacking protection
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// static files
app.use(express.static('client', {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));
app.use(pageRoutes);
app.use(authRoutes);
app.use(productRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.log('Request URL:', req.url);
    console.log('Request Method:', req.method);
    console.log('Request Headers:', req.headers);
    console.log('Request Cookies:', req.cookies);
    if (err.code === 'EBADCSRFTOKEN') {
        console.log('CSRF error:', err);
        return res.status(403).json({
            error: 'Invalid CSRF token',
            message: 'Form submission failed. Please try again.'
        });
    }
    // Other error message
    console.error("Server Error:", err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// Start server
app.listen(process.env.PORT, process.env.IP, () => {
    console.log('Server is running at '+ process.env.IP + ":" + process.env.PORT);
});
