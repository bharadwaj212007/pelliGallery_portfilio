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
  console.log(`\n[API AUDIT] Received POST ${req.originalUrl}`);
  const { username, password } = req.body;
  console.log(`[API AUDIT] Request Body: username="${username}", password="[REDACTED]"`);

  if (!username || !password) {
    console.log(`[API AUDIT] Final JSON response sent: { error: 'Please provide both username and password.' }`);
    return res.status(400).json({ error: 'Please provide both username and password.' });
  }

  try {
    // Check in database first
    console.log(`[API AUDIT] Executing MongoDB Query on Admin: findOne({ username: "${username}" })`);
    const dbAdmin = await Admin.findOne({ username });
    console.log(`[API AUDIT] Database Name: ${Admin.db.name}`);
    console.log(`[API AUDIT] Collection Name: ${Admin.collection.name}`);
    console.log(`[API AUDIT] Document Found in Database: ${dbAdmin ? 'Yes' : 'No'}`);
    if (dbAdmin) {
      console.log(`[API AUDIT] Admin Document: ${JSON.stringify({ _id: dbAdmin._id, username: dbAdmin.username })}`);
    }

    let isValid = false;
    let userId = '1';

    if (dbAdmin) {
      isValid = await bcrypt.compare(password, dbAdmin.password);
      userId = dbAdmin._id.toString();
      console.log(`[API AUDIT] Password match check for DB admin: ${isValid}`);
    } else {
      // Fallback for default dev credentials
      console.log(`[API AUDIT] Admin not found in DB. Falling back to default credentials...`);
      if (username === 'admin' && password === 'admin123') {
        isValid = true;
      }
      console.log(`[API AUDIT] Default credentials match: ${isValid}`);
    }

    if (!isValid) {
      console.log(`[API AUDIT] Final JSON response sent: { error: 'Invalid administrator username or password.' }`);
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

    const responseData = {
      success: true,
      message: 'Login successful.',
      token: token.substring(0, 20) + '...',
      admin: {
        id: userId,
        username: username
      }
    };
    console.log(`[API AUDIT] Final JSON response sent: ${JSON.stringify(responseData)}`);

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
    console.error(`[API AUDIT] Error in POST /login:`, err.message);
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
