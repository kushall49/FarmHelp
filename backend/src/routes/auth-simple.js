const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Signup endpoint
router.post('/signup', async (req, res) => {
  try {
    const { email, password, username, displayName } = req.body;

    // Validation
    if (!email || !password || !username) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields',
        details: {
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null,
          username: !username ? 'Username is required' : null
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email format',
        field: 'email'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters long',
        field: 'password'
      });
    }

    // Validate username
    if (username.length < 3) {
      return res.status(400).json({ 
        success: false,
        message: 'Username must be at least 3 characters long',
        field: 'username'
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ 
        success: false,
        message: 'An account with this email already exists',
        field: 'email'
      });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username: username });
    if (existingUsername) {
      return res.status(400).json({ 
        success: false,
        message: 'This username is already taken',
        field: 'username'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      username: username || email.split('@')[0],
      displayName: displayName || username || email.split('@')[0],
      createdAt: new Date()
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, userId: user._id, email: user.email },  // ✅ FIX: Include both
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        success: false,
        message: `This ${field} is already registered`,
        field: field
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error during signup. Please try again.',
      error: error.message
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields',
        details: {
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email format',
        field: 'email'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'No account found with this email',
        field: 'email'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Incorrect password',
        field: 'password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, userId: user._id, email: user.email },  // ✅ FIX: Include both 'id' and 'userId'
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login. Please try again.',
      error: error.message
    });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get user profile by ID (public route)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password -passwordHash');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar,
        location: user.location,
        farmSize: user.farmSize,
        expertise: user.expertise,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

module.exports = router;
