import express from 'express';
import mongoose from 'mongoose';
import { verifyToken } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Package from '../models/Package.js';
import {
  sendCustomerBookingReceivedEmail,
  sendAdminBookingReceivedEmail,
  sendCustomerBookingStatusChangedEmail
} from '../services/mailService.js';

const router = express.Router();


// =======================
// CREATE BOOKING
// =======================
router.post('/', async (req, res) => {
  console.log('✓ Booking received');
  try {
    const {
      customer_name,
      customer_email,
      event_date,
      event_location,
      special_requirements,
      items
    } = req.body;

    // Validation
    if (!customer_name) {
      return res.status(400).json({
        error: 'Customer name required.'
      });
    }

    if (
      !customer_email ||
      !customer_email.includes('@')
    ) {
      return res.status(400).json({
        error: 'Valid email required.'
      });
    }

    if (!event_date) {
      return res.status(400).json({
        error: 'Event date required.'
      });
    }

    const parsedDate = new Date(event_date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid event date format.'
      });
    }

    const year = parsedDate.getFullYear();
    if (year < 2020 || year > 2099) {
      return res.status(400).json({
        error: 'Event date year must be between 2020 and 2099.'
      });
    }

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        error: 'Cart cannot be empty.'
      });
    }

    // Get valid MongoDB ObjectIds
    const packageIds = items
      .map(item => item.package_id)
      .filter(id =>
        mongoose.Types.ObjectId.isValid(id)
      );

    // Fetch packages from MongoDB
    const dbPackages =
      await Package.find({
        _id: {
          $in: packageIds
        }
      });

    let total = 0;
    const resolvedItems = [];

    items.forEach(item => {
      if (!item.package_id) return;

      const pkg =
        dbPackages.find(
          p =>
            p._id.toString() ===
            item.package_id.toString()
        );

      if (!pkg) return;

      const quantity =
        Number(item.quantity) || 1;

      const basePrice =
        Number(pkg.price);

      const selectedCustoms =
        item.selected_customizations || [];

      const customsSum =
        selectedCustoms.reduce(
          (sum, opt) =>
            sum +
            parseFloat(
              opt.price || 0
            ),
          0
        );

      const itemTotal =
        (basePrice +
          customsSum) *
        quantity;

      total += itemTotal;

      resolvedItems.push({
        package_id:
          pkg._id.toString(),
        package_name:
          pkg.name,
        package_price:
          basePrice,
        quantity,
        selected_customizations:
          selectedCustoms
      });
    });

    if (
      resolvedItems.length === 0
    ) {
      return res.status(400).json({
        error:
          'No valid packages found.'
      });
    }

    // Save Booking
    const booking =
      await Booking.create({
        customer_name,
        customer_email,
        event_date,
        event_location,
        special_requirements,
        items: resolvedItems,
        total_price: total,
        status: 'Pending'
      });

    console.log('✓ Booking saved to MongoDB');

    // =======================
    // TRY SENDING EMAIL
    // =======================
    let emailStatus = true;
    try {
      console.log('Booking Created');
      
      // Try sending customer email
      try {
        console.log('Sending Customer Email');
        await sendCustomerBookingReceivedEmail(booking);
        console.log('Customer Email Sent');
      } catch (custErr) {
        console.error('Customer Email Failed:');
        console.error(custErr.stack || custErr);
        emailStatus = false;
      }

      // Try sending studio email
      try {
        console.log('Sending Studio Email');
        await sendAdminBookingReceivedEmail(booking);
        console.log('Studio Email Sent');
      } catch (adminErr) {
        console.error('Studio Email Failed:');
        console.error(adminErr.stack || adminErr);
        emailStatus = false;
      }
    } catch (err) {
      console.error('Email process encountered an unexpected error:');
      console.error(err.stack || err);
      emailStatus = false;
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      booking,
      emailStatus
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});


// =======================
// GET ALL BOOKINGS
// =======================
router.get(
  '/',
  verifyToken,
  async (req, res) => {
    try {
      const { status, search } = req.query;
      const query = {};

      if (status) {
        query.status = status;
      }

      if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [
          { customer_name: searchRegex },
          { customer_email: searchRegex },
          { event_location: searchRegex }
        ];
      }

      const bookings = await Booking.find(query).sort({
        createdAt: -1
      });

      res.json(bookings);
    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);


// =======================
// UPDATE STATUS
// =======================
router.put(
  '/:id/status',
  verifyToken,
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          error: 'Invalid booking ID format.'
        });
      }

      if (!['Pending', 'Confirmed', 'Cancelled'].includes(status)) {
        return res.status(400).json({
          error: 'Invalid status value.'
        });
      }

      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({
          error: 'Booking not found.'
        });
      }

      // Check status flow constraints
      if (booking.status === 'Confirmed' && status === 'Pending') {
        return res.status(400).json({
          error: 'Cannot change status from Confirmed back to Pending.'
        });
      }
      if (booking.status === 'Cancelled' && status !== 'Cancelled') {
        return res.status(400).json({
          error: 'Cannot change status of a Cancelled booking.'
        });
      }

      booking.status = status;
      await booking.save();

      // =======================
      // ASYNC STATUS EMAIL (Background)
      // =======================
      sendCustomerBookingStatusChangedEmail(booking, status).catch(err => console.error('Background status email failed:', err));

      res.json({
        success: true,
        message: 'Booking status updated successfully.',
        booking
      });

    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);

export default router;