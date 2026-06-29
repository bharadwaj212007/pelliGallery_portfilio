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
    const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
    const missingVars = requiredEnvVars.filter(v => !process.env[v]);
    if (missingVars.length > 0) {
      console.warn(`⚠️ Warning: Missing required SMTP environment variables: ${missingVars.join(', ')}`);
      return res.status(400).json({
        success: false,
        error: `Missing required environment variables: ${missingVars.join(', ')}`
      });
    }

    await verifySMTPConnection();
    await sendTestEmail(process.env.SMTP_USER);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Test email route failed:', err.message);
    res.status(500).json({ success: false, error: err.stack || err.message || err });
  }
};

app.get('/api/test-email', testEmailHandler);
app.post('/api/test-email', testEmailHandler);

// Temporary Cloudinary upload test endpoint
app.get('/api/test-cloudinary', async (req, res) => {
  console.log('\n[API AUDIT] Received GET /api/test-cloudinary');
  try {
    const { default: cloudinary } = await import('./config/cloudinary.js');
    console.log('[test-cloudinary] Executing direct upload with cloudinary.uploader.upload()...');
    
    const testDataUri = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    
    // Log parameters before upload
    const rawKey = (process.env.CLOUDINARY_API_KEY || '').trim();
    let maskedKey = 'N/A';
    if (rawKey) {
      if (rawKey.length > 6) {
        maskedKey = rawKey.substring(0, 3) + '*'.repeat(rawKey.length - 6) + rawKey.substring(rawKey.length - 3);
      } else {
        maskedKey = rawKey.substring(0, 1) + '*'.repeat(rawKey.length - 2) + rawKey.substring(rawKey.length - 1);
      }
    }

    const uploadOptions = {
      folder: 'pelligallery_test',
      public_id: `direct_test_upload_${Date.now()}`,
      overwrite: true,
      resource_type: 'image',
    };

    console.log('[test-cloudinary] Diagnostics:');
    console.log(`- cloud_name: ${(process.env.CLOUDINARY_CLOUD_NAME || '').trim()}`);
    console.log(`- api_key: ${maskedKey}`);
    console.log(`- upload options:`, JSON.stringify(uploadOptions, null, 2));

    const result = await cloudinary.uploader.upload(testDataUri, uploadOptions);
    
    console.log('[test-cloudinary] Upload succeeded. URL:', result.secure_url);
    res.json({
      success: true,
      message: 'Test image uploaded successfully to Cloudinary using direct upload.',
      url: result.secure_url,
      result
    });
  } catch (error) {
    console.error('[test-cloudinary] Direct upload failed.');
    console.error(JSON.stringify(error, null, 2));
    console.error(error);
    console.error(error.message);
    console.error(error.http_code);
    console.error(error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Cloudinary upload failed.',
      error: {
        message: error.message,
        http_code: error.http_code,
        name: error.name,
        stack: error.stack,
        error
      }
    });
  }
});

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