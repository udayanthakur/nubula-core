const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users, sessions } = require('../database/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'nebula-core-secret-key-change-in-production';

// Helper function to generate JWT token
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Helper function to clean expired sessions
function cleanExpiredSessions() {
  sessions.deleteExpired();
}

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Check if user already exists
    const existingUser = users.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = users.create(name, email, hashedPassword);

    // Generate token
    const token = generateToken(newUser.id);

    // Create session (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    sessions.create(newUser.id, token, expiresAt.toISOString());

    // Clean expired sessions
    cleanExpiredSessions();

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser.id,
        name,
        email,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = users.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id);

    // Create session (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    sessions.create(user.id, token, expiresAt.toISOString());

    // Clean expired sessions
    cleanExpiredSessions();

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify token route
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;

    if (!token) {
      return res.status(401).json({ message: 'Token required' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const session = sessions.findByToken(token);

    if (!session) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    res.json({
      valid: true,
      user: {
        id: session.user_id,
        name: session.name,
        email: session.email,
      },
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.body.token;

    if (token) {
      sessions.deleteByToken(token);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

