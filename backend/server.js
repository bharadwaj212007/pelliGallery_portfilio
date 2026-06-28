import 'dotenv/config';
import './dns-preload.js';

// Debugging (remove later)
console.log(
  'CLOUDINARY_CLOUD_NAME:',
  process.env.CLOUDINARY_CLOUD_NAME || 'Missing'
);
console.log(
  'CLOUDINARY_API_KEY:',
  process.env.CLOUDINARY_API_KEY ? 'Loaded' : 'Missing'
);
console.log(
  'CLOUDINARY_API_SECRET:',
  process.env.CLOUDINARY_API_SECRET ? 'Loaded' : 'Missing'
);

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import connectDB from './config/db.js';
import { verifySMTPConnection, sendTestEmail } from './services/mailService.js';

// Import routes
import authRoutes from './routes/auth.js';
import galleryRoutes from './routes/gallery.js';
import packageRoutes from './routes/packages.js';
import bookingRoutes from './routes/bookings.js';
import dashboardRoutes from './routes/dashboard.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect MongoDB
connectDB();

// Verify SMTP Connection
verifySMTPConnection();

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
    database_mode: 'MongoDB Atlas'
  });
});

// Test Email Route (GET and POST - Requirement 10)
const testEmailHandler = async (req, res) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
      const missingVars = requiredEnvVars.filter(v => !process.env[v]);
      if (missingVars.length > 0) {
        console.warn(`⚠️ Warning: Missing required SMTP environment variables: ${missingVars.join(', ')}`);
        return res.status(400).json({
          success: false,
          error: `Missing required environment variables: ${missingVars.join(', ')}`
        });
      }
    }

    await verifySMTPConnection();
    const testRecipient = process.env.SMTP_USER || process.env.SMTP_FROM || 'pellipusthakamweb@gmail.com';
    await sendTestEmail(testRecipient);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Test email route failed:', err.message);
    res.status(500).json({ success: false, error: err.stack || err.message || err });
  }
};

app.get('/api/test-email', testEmailHandler);
app.post('/api/test-email', testEmailHandler);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/dashboard', dashboardRoutes);

// API 404
app.use('/api', (req, res, next) => {
  const err = new Error(`Resource ${req.originalUrl} not found`);
  err.status = 404;
  next(err);
});

// Root Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PelliGallery Backend API is live'
  });
});

// Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log('===================================================');
  console.log(
    `✅ PelliGallery API server active on port ${PORT}`
  );
  console.log(
    `Mode: ${process.env.NODE_ENV || 'development'}`
  );
  console.log('Database: MongoDB Atlas');
  console.log(
    `API health endpoint: http://localhost:${PORT}/api/health`
  );
  console.log('===================================================');
});

export default app;
// Trigger watch reload