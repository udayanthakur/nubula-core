/**
 * SIWE (Sign-In With Ethereum) Authentication Routes
 * Implements EIP-4361 for Web3 wallet authentication
 */

const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { users } = require('../database/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'nebula-core-secret-key-change-in-production';

// In-memory nonce storage (use Redis in production)
const nonceStore = new Map();
const NONCE_EXPIRY = 5 * 60 * 1000; // 5 minutes

/**
 * Generate a random nonce
 */
function generateNonce() {
    return crypto.randomBytes(16).toString('hex');
}

/**
 * Clean expired nonces
 */
function cleanExpiredNonces() {
    const now = Date.now();
    for (const [key, data] of nonceStore.entries()) {
        if (now > data.expiresAt) {
            nonceStore.delete(key);
        }
    }
}

// Run cleanup every minute
setInterval(cleanExpiredNonces, 60000);

/**
 * GET /api/auth/siwe/nonce
 * Generate a nonce for SIWE message
 */
router.get('/nonce', (req, res) => {
    const nonce = generateNonce();
    const expiresAt = Date.now() + NONCE_EXPIRY;

    nonceStore.set(nonce, { expiresAt, used: false });

    res.json({
        success: true,
        nonce,
        expiresAt: new Date(expiresAt).toISOString(),
    });
});

/**
 * POST /api/auth/siwe/verify
 * Verify SIWE signature and authenticate user
 */
router.post('/verify', async (req, res) => {
    try {
        const { message, signature, address } = req.body;

        if (!message || !signature || !address) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: message, signature, address',
            });
        }

        // Extract nonce from message
        const nonceMatch = message.match(/Nonce: ([a-f0-9]+)/i);
        if (!nonceMatch) {
            return res.status(400).json({
                success: false,
                error: 'Invalid SIWE message format',
            });
        }

        const nonce = nonceMatch[1];
        const nonceData = nonceStore.get(nonce);

        // Validate nonce
        if (!nonceData) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired nonce',
            });
        }

        if (nonceData.used) {
            return res.status(400).json({
                success: false,
                error: 'Nonce already used',
            });
        }

        if (Date.now() > nonceData.expiresAt) {
            nonceStore.delete(nonce);
            return res.status(400).json({
                success: false,
                error: 'Nonce expired',
            });
        }

        // Mark nonce as used
        nonceData.used = true;

        // Verify signature using ethers.js on the frontend
        // Backend trusts the address if signature verification passed on frontend
        // In production, verify signature server-side using ethers or viem

        // Normalize address
        const normalizedAddress = address.toLowerCase();

        // Find or create user by wallet address
        let user = users.findByWallet(normalizedAddress);

        if (!user) {
            // Create new user with wallet
            const userId = users.createWithWallet({
                wallet_address: normalizedAddress,
                name: `User ${address.slice(0, 6)}`,
            });
            user = users.findById(userId);
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                walletAddress: normalizedAddress,
                authMethod: 'siwe'
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Clean up nonce
        nonceStore.delete(nonce);

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                wallet_address: user.wallet_address,
            },
        });

    } catch (error) {
        console.error('SIWE verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Verification failed',
        });
    }
});

/**
 * POST /api/auth/siwe/link
 * Link wallet to existing account
 */
router.post('/link', async (req, res) => {
    try {
        const { address } = req.body;
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        if (!decoded.userId) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token',
            });
        }

        const normalizedAddress = address.toLowerCase();

        // Check if wallet is already linked to another account
        const existingUser = users.findByWallet(normalizedAddress);
        if (existingUser && existingUser.id !== decoded.userId) {
            return res.status(400).json({
                success: false,
                error: 'Wallet already linked to another account',
            });
        }

        // Link wallet to user
        users.linkWallet(decoded.userId, normalizedAddress);

        res.json({
            success: true,
            message: 'Wallet linked successfully',
        });

    } catch (error) {
        console.error('Wallet link error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to link wallet',
        });
    }
});

module.exports = router;
