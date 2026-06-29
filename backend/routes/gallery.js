import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import GalleryCategory from '../models/GalleryCategory.js';
import GalleryImage from '../models/GalleryImage.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';

const router = express.Router();

// Get Categories
router.get('/categories', async (req, res) => {
  console.log(`\n[API AUDIT] Received GET ${req.originalUrl}`);
  try {
    const queryFilter = {};
    console.log(`[API AUDIT] Executing MongoDB Query on GalleryCategory: find(${JSON.stringify(queryFilter)})`);
    const dbCategories = await GalleryCategory.find(queryFilter);
    console.log(`[API AUDIT] Database Name: ${GalleryCategory.db.name}`);
    console.log(`[API AUDIT] Collection Name: ${GalleryCategory.collection.name}`);
    console.log(`[API AUDIT] Documents Returned: ${dbCategories.length}`);
    
    // Map to match the frontend expectations: id, name, slug
    const formatted = dbCategories.map(cat => ({
      id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug
    }));
    console.log(`[API AUDIT] Final JSON response sent: ${JSON.stringify(formatted).substring(0, 300)}...`);
    res.json(formatted);
  } catch (err) {
    console.error(`[API AUDIT] Error in GET /categories:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get Gallery Images
router.get('/', async (req, res) => {
  console.log(`\n[API AUDIT] Received GET ${req.originalUrl}`);
  try {
    const queryFilter = {};
    console.log(`[API AUDIT] Executing MongoDB Query on GalleryImage: find(${JSON.stringify(queryFilter)}).populate('category_id')`);
    const dbImages = await GalleryImage.find(queryFilter)
      .populate('category_id')
      .sort({ sort_order: 1, createdAt: 1 });
    console.log(`[API AUDIT] Database Name: ${GalleryImage.db.name}`);
    console.log(`[API AUDIT] Collection Name: ${GalleryImage.collection.name}`);
    console.log(`[API AUDIT] Documents Returned: ${dbImages.length}`);

    // Map to match the frontend expectations: id, title, imageUrl, image_url, public_id, category_id, category_name, category_slug, sort_order
    const formatted = dbImages.map(img => {
      const url = img.imageUrl || img.image_url || '';
      const categoryName = img.category_id?.name || img.category || 'Uncategorized';
      const categorySlug = img.category_id?.slug || img.category?.toLowerCase()?.replace(/[^a-z0-9]+/g, '-') || 'uncategorized';
      return {
        id: img._id.toString(),
        title: img.title || '',
        imageUrl: url,
        image_url: url,
        public_id: img.public_id,
        sort_order: img.sort_order || 0,
        category_id: img.category_id?._id?.toString() || img.category_id?.toString() || '',
        category_name: categoryName,
        category_slug: categorySlug
      };
    });
    console.log(`[API AUDIT] Final JSON response sent: [${formatted.length} items] (Sample: ${JSON.stringify(formatted[0] || {}).substring(0, 300)}...)`);
    res.json(formatted);
  } catch (err) {
    console.error(`[API AUDIT] Error in GET /:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Upload Image
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { category_id, title, sort_order } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image file.' });
    }

    if (!category_id) {
      return res.status(400).json({ error: 'Category ID is required.' });
    }

    // Verify category exists
    const category = await GalleryCategory.findById(category_id);
    if (!category) {
      return res.status(404).json({ error: 'Gallery category not found.' });
    }

    // Upload to Cloudinary
    const cloudinaryResult = await uploadImage(req.file, title || 'gallery_image');

    // Save to MongoDB
    const newImage = await GalleryImage.create({
      category_id,
      title: title || '',
      imageUrl: cloudinaryResult.secure_url,
      image_url: cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id,
      sort_order: Number(sort_order) || 0
    });

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully.',
      image: {
        id: newImage._id.toString(),
        title: newImage.title,
        imageUrl: newImage.imageUrl || newImage.image_url,
        image_url: newImage.image_url || newImage.imageUrl,
        public_id: newImage.public_id,
        sort_order: newImage.sort_order,
        category_id: newImage.category_id.toString(),
        category_name: category.name,
        category_slug: category.slug
      }
    });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Reorder Images
router.put('/reorder', verifyToken, async (req, res) => {
  try {
    const { reorders } = req.body;

    if (!reorders || !Array.isArray(reorders)) {
      return res.status(400).json({ error: 'reorders array required.' });
    }

    // Perform updates in parallel
    const updatePromises = reorders.map(item =>
      GalleryImage.findByIdAndUpdate(item.id, { sort_order: Number(item.sort_order) })
    );
    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Gallery reordered successfully.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Image
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const image = await GalleryImage.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ error: 'Image not found.' });
    }

    // Delete from Cloudinary if public_id exists
    if (image.public_id) {
      try {
        await deleteImage(image.public_id);
      } catch (cloudinaryErr) {
        console.warn('Failed to delete image from Cloudinary:', cloudinaryErr.message);
        // Continue deleting from MongoDB anyway
      }
    }

    await GalleryImage.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Image deleted successfully.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;