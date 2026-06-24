import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'pellipusthakam_super_secret_key_2026';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    console.error('JWT Verification error:', err.message);
    return res.status(403).json({ error: 'Invalid or expired token. Authentication failed.' });
  }
};

export default verifyToken;
