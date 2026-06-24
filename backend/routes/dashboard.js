import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Package from '../models/Package.js';
import GalleryImage from '../models/GalleryImage.js';

const router = express.Router();

router.get('/stats', verifyToken, async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const totalPackages = await Package.countDocuments();
    const totalImages = await GalleryImage.countDocuments();

    const dbBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Map bookings to make sure they have a serializable id
    const recentBookings = dbBookings.map(b => ({
      id: b._id.toString(),
      customer_name: b.customer_name,
      customer_email: b.customer_email,
      event_date: b.event_date,
      event_location: b.event_location,
      special_requirements: b.special_requirements,
      items: b.items,
      total_price: b.total_price,
      status: b.status,
      createdAt: b.createdAt
    }));

    const dbImages = await GalleryImage.find()
      .populate('category_id')
      .sort({ createdAt: -1 })
      .limit(5);

    // Map recent images to include formatted ids and category names/slugs
    const recentImages = dbImages.map(img => {
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

    res.json({
      totalBookings,
      totalPackages,
      totalImages,
      recentBookings,
      recentImages
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

export default router;