import express from 'express';
import Package from '../models/Package.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all packages
router.get('/', async (req, res) => {
  console.log(`\n[API AUDIT] Received GET ${req.originalUrl}`);
  try {
    const queryFilter = {};
    console.log(`[API AUDIT] Executing MongoDB Query on Package: find(${JSON.stringify(queryFilter)})`);
    const packages = await Package.find(queryFilter);
    console.log(`[API AUDIT] Database Name: ${Package.db.name}`);
    console.log(`[API AUDIT] Collection Name: ${Package.collection.name}`);
    console.log(`[API AUDIT] Documents Returned: ${packages.length}`);
    console.log(`[API AUDIT] Final JSON response sent: [${packages.length} items] (Sample: ${JSON.stringify(packages[0] || {}).substring(0, 300)}...)`);
    res.json(packages);
  } catch (err) {
    console.error(`[API AUDIT] Error in GET /packages:`, err.message);
    res.status(500).json({
      error: err.message
    });
  }
});

// Get one package
router.get('/:id', async (req, res) => {
  console.log(`\n[API AUDIT] Received GET ${req.originalUrl}`);
  try {
    console.log(`[API AUDIT] Executing MongoDB Query on Package: findById(${req.params.id})`);
    const pkg = await Package.findById(
      req.params.id
    );
    console.log(`[API AUDIT] Database Name: ${Package.db.name}`);
    console.log(`[API AUDIT] Collection Name: ${Package.collection.name}`);
    console.log(`[API AUDIT] Document Found: ${pkg ? 'Yes' : 'No'}`);

    if (!pkg) {
      console.log(`[API AUDIT] Final JSON response sent: { error: 'Package not found' }`);
      return res.status(404).json({
        error: 'Package not found'
      });
    }

    console.log(`[API AUDIT] Final JSON response sent: ${JSON.stringify(pkg).substring(0, 300)}...`);
    res.json(pkg);
  } catch (err) {
    console.error(`[API AUDIT] Error in GET /packages/:id:`, err.message);
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