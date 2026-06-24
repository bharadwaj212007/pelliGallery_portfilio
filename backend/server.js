import './dns-preload.js';
import dotenv from 'dotenv';
dotenv.config();

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
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';

// Import routes
import authRoutes from './routes/auth.js';
import galleryRoutes from './routes/gallery.js';
import packageRoutes from './routes/packages.js';
import bookingRoutes from './routes/bookings.js';
import dashboardRoutes from './routes/dashboard.js';
import errorHandler from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect MongoDB
connectDB();

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/dashboard', dashboardRoutes);

// API 404
app.use('/api/*', (req, res, next) => {
  const err = new Error(
    `Resource ${req.originalUrl} not found`
  );
  err.status = 404;
  next(err);
});

// Frontend
if (process.env.NODE_ENV === 'production') {
  const frontendBuild = path.join(
    __dirname,
    '../frontend/dist'
  );

  app.use(express.static(frontendBuild));

  app.get('*', (req, res) => {
    res.sendFile(
      path.join(frontendBuild, 'index.html')
    );
  });
} else {
  app.get('*', (req, res) => {
    res.send(
      'PelliGallery API Server is running in development mode. API is live at /api/*'
    );
  });
}

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