import express from 'express';
import mongoose from 'mongoose';
import { verifyToken } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Package from '../models/Package.js';
import transporter from '../config/email.js';

const router = express.Router();


// =======================
// CREATE BOOKING
// =======================
router.post('/', async (req, res) => {
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

    console.log(
      '✅ Booking saved:',
      booking._id
    );

    // =======================
    // CUSTOMER EMAIL
    // =======================
    try {
      const info =
        await transporter.sendMail(
          {
            from:
              process.env
                .EMAIL_USER,
            to: customer_email,
            subject:
              'PelliGallery Booking Confirmation',
            html: `
              <h2>Thank you for booking with Pellipusthakam Photography</h2>

              <p>Dear ${customer_name},</p>

              <p>Your booking has been received successfully.</p>

              <p><b>Event Date:</b> ${event_date}</p>
              <p><b>Location:</b> ${event_location}</p>
              <p><b>Total Amount:</b> ₹${total}</p>

              <br>

              <p>Our team will contact you shortly.</p>

              <br>

              <p>Pellipusthakam Photography Team</p>
            `
          }
        );

      console.log(
        '✅ Customer email sent:',
        info.messageId
      );
    } catch (err) {
      console.error(
        '❌ Customer email failed:',
        err.message
      );
    }

    // =======================
    // ADMIN EMAIL
    // =======================
    try {
      const info =
        await transporter.sendMail(
          {
            from:
              process.env
                .EMAIL_USER,
            to:
              process.env
                .EMAIL_USER,
            subject:
              'New Booking Received',
            html: `
              <h2>New Booking Received</h2>

              <p><b>Name:</b> ${customer_name}</p>
              <p><b>Email:</b> ${customer_email}</p>
              <p><b>Date:</b> ${event_date}</p>
              <p><b>Location:</b> ${event_location}</p>
              <p><b>Total:</b> ₹${total}</p>
            `
          }
        );

      console.log(
        '✅ Admin email sent:',
        info.messageId
      );
    } catch (err) {
      console.error(
        '❌ Admin email failed:',
        err.message
      );
    }

    res.status(201).json({
      success: true,
      message:
        'Booking created successfully.',
      booking
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
      const bookings =
        await Booking.find().sort(
          {
            createdAt: -1
          }
        );

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

      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({
          error: 'Booking not found.'
        });
      }

      booking.status = status;
      await booking.save({ validateBeforeSave: false });

      // Send email notifications
      if (status === 'Confirmed' || status === 'Cancelled') {
        try {
          let mailOptions = {};
          if (status === 'Confirmed') {
            mailOptions = {
              from: process.env.EMAIL_USER,
              to: booking.customer_email,
              subject: 'PelliGallery Booking Confirmed',
              text: `Dear ${booking.customer_name},

We are delighted to inform you that your photography booking has been CONFIRMED.

Booking Details:
Event Date: ${booking.event_date}
Location: ${booking.event_location}
Booking Status: Confirmed

Our team will contact you shortly regarding further arrangements.

Thank you for choosing Pellipusthakam Photography.

Warm Regards,
PelliGallery Team
Hyderabad`
            };
          } else if (status === 'Cancelled') {
            mailOptions = {
              from: process.env.EMAIL_USER,
              to: booking.customer_email,
              subject: 'PelliGallery Booking Status Update',
              text: `Dear ${booking.customer_name},

We regret to inform you that your booking has been marked as CANCELLED.

Booking Details:
Event Date: ${booking.event_date}
Location: ${booking.event_location}
Booking Status: Cancelled

If this was unexpected, please contact our team for assistance.

Thank you for choosing Pellipusthakam Photography.

Warm Regards,
PelliGallery Team
Hyderabad`
            };
          }

          const info = await transporter.sendMail(mailOptions);
          console.log(`✅ Status email sent for booking ${booking._id}: ${info.messageId}`);
        } catch (emailErr) {
          console.error(`❌ Status email failed for booking ${booking._id}:`, emailErr.message);
        }
      }

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