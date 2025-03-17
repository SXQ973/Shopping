const crypto = require('crypto');
const bcrypt = require('bcrypt');

class SecurityUtils {

    // Generate security token
    static generateToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    // Generate hashed password
    static async hashPassword(password) {
        const saltRounds = 12;
        return await bcrypt.hash(password, saltRounds);
    }

    // Validate if password is rightf
    static async verifyPassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    // // Generate CSRF Token
    // static generateCsrfToken() {
    //     return crypto.randomBytes(32).toString('hex');
    // }

    // Generate CSP nonce
    static generateNonce() {
        return crypto.randomBytes(16).toString('base64');
    }
    
    // Generate session id
    static generateSessionId() {
        return crypto.randomBytes(48).toString('hex');
    }

    // Generate CSP policy
    static generateCSP(nonce) {
        return `
            default-src 'self';
            script-src * 'nonce-${nonce}';
            style-src *;
            img-src *;
            font-src 'self';
            object-src 'none';
            base-uri 'none';
            form-action 'self';
            frame-ancestors 'none';
            block-all-mixed-content;
            upgrade-insecure-requests;
        `.replace(/\s+/g, ' ').trim();
    }

    // Tackle insecurity input
    static sanitizeInput(input) {
        if (typeof input === 'string') {
            return input.replace(/[<>'"]/g, '');
        } else if (typeof input === 'object') {
            const sanitized = {};
            for (let key in input) {
                sanitized[key] = this.sanitizeInput(input[key]);
            }
            return sanitized;
        }
        return input;
    }
    
    // Tackle insecurity input
    static sanitizeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Validate email at backend
    static isValidEmail(email) {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return typeof email === 'string' && 
               email.length <= 255 && 
               emailPattern.test(email);
    }

    // Validate password at backend
    static isValidPassword(password) {
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/;
        return typeof password === 'string' && 
               passwordPattern.test(password);
    }
}

module.exports = SecurityUtils;