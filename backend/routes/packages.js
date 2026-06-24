import express from 'express';
import Package from '../models/Package.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all packages
router.get('/', async (req, res) => {
  try {
    const packages = await Package.find();
    res.json(packages);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// Get one package
router.get('/:id', async (req, res) => {
  try {
    const pkg = await Package.findById(
      req.params.id
    );

    if (!pkg) {
      return res.status(404).json({
        error: 'Package not found'
      });
    }

    res.json(pkg);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// Create package
router.post(
  '/',
  verifyToken,
  async (req, res) => {
    try {
      const pkg =
        await Package.create(req.body);

      res.status(201).json(pkg);
    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);

// Update package
router.put(
  '/:id',
  verifyToken,
  async (req, res) => {
    try {
      const pkg =
        await Package.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true
          }
        );

      res.json(pkg);
    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);

// Delete package
router.delete(
  '/:id',
  verifyToken,
  async (req, res) => {
    try {
      await Package.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          'Package deleted successfully'
      });
    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);

export default router;