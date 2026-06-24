import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pellipusthakam_super_secret_key_2026';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

// Admin Login
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Please provide both username and password.' });
  }

  try {
    // Check in database first
    const dbAdmin = await Admin.findOne({ username });
    let isValid = false;
    let userId = '1';

    if (dbAdmin) {
      isValid = await bcrypt.compare(password, dbAdmin.password);
      userId = dbAdmin._id.toString();
    } else {
      // Fallback for default dev credentials
      if (username === 'admin' && password === 'admin123') {
        isValid = true;
      }
    }

    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid administrator username or password.'
      });
    }

    const token = jwt.sign(
      {
        id: userId,
        username: username
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRY
      }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      admin: {
        id: userId,
        username: username
      }
    });
  } catch (err) {
    next(err);
  }
});

// Verify Token (Used by Frontend Router Guards)
router.get('/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid.',
    admin: req.admin
  });
});

export default router;
