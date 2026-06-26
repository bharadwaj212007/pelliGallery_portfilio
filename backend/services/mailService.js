import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Reusable send function with single retry
export const sendEmailWithRetry = async (mailOptions, attempt = 1) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully (Attempt ${attempt}): ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ Email send failed (Attempt ${attempt}):`, err.message);
    if (attempt === 1) {
      console.log('🔄 Retrying email send...');
      // Wait 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      return sendEmailWithRetry(mailOptions, 2);
    }
    // Never propagate errors to prevent failing booking flow
    console.error('❌ Email send failed after retry.');
    return null;
  }
};

// Send customer booking confirmation (Pending status received)
export const sendCustomerBookingReceivedEmail = async (booking) => {
  try {
    // Parse event_type from special_requirements
    const typeMatch = booking.special_requirements?.match(/\[Event Type:\s*(.*?)\]/);
    const event_type = typeMatch ? typeMatch[1] : 'N/A';

    const packagesStr = booking.items.map(i => i.package_name).join(', ');
    const formattedPrice = parseFloat(booking.total_price).toLocaleString('en-IN');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: booking.customer_email,
      subject: 'Booking Confirmation - Pellipusthakam Photography',
      text: `Hello ${booking.customer_name},

Thank you for choosing Pellipusthakam Photography.

Your booking has been successfully received.

Booking Details:
• Booking ID: ${booking._id || booking.id}
• Package: ${packagesStr}
• Event Date: ${booking.event_date}
• Event Type: ${event_type}
• Location: ${booking.event_location}
• Estimated Amount: INR ${formattedPrice}
• Current Status (Pending)

Our team will review your request and contact you shortly.

Thank you.`
    };

    return sendEmailWithRetry(mailOptions);
  } catch (err) {
    console.error('Error in sendCustomerBookingReceivedEmail:', err.message);
  }
};

// Send admin booking notification
export const sendAdminBookingReceivedEmail = async (booking) => {
  try {
    // Parse phone & event_type from special_requirements
    const phoneMatch = booking.special_requirements?.match(/\[Phone:\s*(.*?)\]/);
    const typeMatch = booking.special_requirements?.match(/\[Event Type:\s*(.*?)\]/);
    const customer_phone = phoneMatch ? phoneMatch[1] : 'N/A';
    const event_type = typeMatch ? typeMatch[1] : 'N/A';

    const packagesStr = booking.items.map(i => i.package_name).join(', ');
    const formattedPrice = parseFloat(booking.total_price).toLocaleString('en-IN');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Admin email is EMAIL_USER
      subject: 'New Booking Received',
      text: `New Booking Received

Customer Name: ${booking.customer_name}
Email: ${booking.customer_email}
Phone: ${customer_phone}
Package: ${packagesStr}
Amount: INR ${formattedPrice}
Event Date: ${booking.event_date}
Location: ${booking.event_location}
Booking ID: ${booking._id || booking.id}`
    };

    return sendEmailWithRetry(mailOptions);
  } catch (err) {
    console.error('Error in sendAdminBookingReceivedEmail:', err.message);
  }
};

// Send customer booking status changed email (Confirmed/Cancelled)
export const sendCustomerBookingStatusChangedEmail = async (booking, status) => {
  try {
    if (status !== 'Confirmed' && status !== 'Cancelled') return null;

    const packagesStr = booking.items.map(i => i.package_name).join(', ');
    const formattedPrice = parseFloat(booking.total_price).toLocaleString('en-IN');
    const formattedDate = new Date(booking.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    let mailOptions = {};

    if (status === 'Confirmed') {
      mailOptions = {
        from: process.env.EMAIL_USER,
        to: booking.customer_email,
        subject: 'Booking Confirmed - Pellipusthakam Photography',
        text: `Hello ${booking.customer_name},

Your booking has been confirmed successfully.

Event: ${booking.event_location}
Date: ${formattedDate}
Package: ${packagesStr}
Amount: INR ${formattedPrice}

Thank you for choosing Pellipusthakam Photography.`
      };
    } else if (status === 'Cancelled') {
      mailOptions = {
        from: process.env.EMAIL_USER,
        to: booking.customer_email,
        subject: 'Booking Cancelled',
        text: `Hello ${booking.customer_name},

Your booking has been cancelled.

Please contact us for more information.`
      };
    }

    return sendEmailWithRetry(mailOptions);
  } catch (err) {
    console.error('Error in sendCustomerBookingStatusChangedEmail:', err.message);
  }
};
