import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const user = process.env.SMTP_USER || process.env.EMAIL_USER;
const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = parseInt(process.env.SMTP_PORT || '465', 10);
const secure = process.env.SMTP_SECURE !== undefined ? (process.env.SMTP_SECURE === 'true') : (port === 465);
const fromEmail = process.env.SMTP_FROM || user;

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user,
    pass
  }
});

// Verification function
export const verifySMTPConnection = async () => {
  console.log('🔍 Verifying SMTP Connection...');
  console.log(`SMTP Host: ${host}`);
  console.log(`SMTP Port: ${port}`);
  console.log(`SMTP Secure: ${secure}`);
  console.log(`SMTP User: ${user}`);
  console.log(`SMTP Pass Loaded: ${pass ? 'YES' : 'NO'}`);

  try {
    await transporter.verify();
    console.log('✅ SMTP Connection verified successfully. Transporter is ready to send emails.');
    return true;
  } catch (err) {
    console.error('❌ SMTP Connection verification failed:');
    console.error(err.message);
    console.error(err.stack);
    return false;
  }
};

// Reusable send function with single retry
export const sendEmailWithRetry = async (mailOptions, attempt = 1) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully (Attempt ${attempt}): ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ Email send failed (Attempt ${attempt}):`, err.message);
    console.error(err.stack); // Log complete stack trace
    if (attempt === 1) {
      console.log('🔄 Retrying email send...');
      // Wait 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      return sendEmailWithRetry(mailOptions, 2);
    }
    console.error('❌ Email send failed after retry.');
    return null;
  }
};

// Send customer booking confirmation (Pending status received)
export const sendCustomerBookingReceivedEmail = async (booking) => {
  try {
    console.log('✓ Customer email started');
    // Parse event_type from special_requirements
    const typeMatch = booking.special_requirements?.match(/\[Event Type:\s*(.*?)\]/);
    const event_type = typeMatch ? typeMatch[1] : 'N/A';

    const packagesStr = booking.items.map(i => i.package_name).join(', ');
    const formattedPrice = parseFloat(booking.total_price).toLocaleString('en-IN');

    const mailOptions = {
      from: fromEmail,
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

    const info = await sendEmailWithRetry(mailOptions);
    if (info) {
      console.log('✓ Customer email sent successfully');
    }
    return info;
  } catch (err) {
    console.error('Error in sendCustomerBookingReceivedEmail:');
    console.error(err.message);
    console.error(err.stack);
  }
};

// Send admin booking notification
export const sendAdminBookingReceivedEmail = async (booking) => {
  try {
    console.log('✓ Admin email started');
    // Parse phone & event_type from special_requirements
    const phoneMatch = booking.special_requirements?.match(/\[Phone:\s*(.*?)\]/);
    const typeMatch = booking.special_requirements?.match(/\[Event Type:\s*(.*?)\]/);
    const customer_phone = phoneMatch ? phoneMatch[1] : 'N/A';
    const event_type = typeMatch ? typeMatch[1] : 'N/A';

    const packagesStr = booking.items.map(i => i.package_name).join(', ');
    const formattedPrice = parseFloat(booking.total_price).toLocaleString('en-IN');

    const mailOptions = {
      from: fromEmail,
      to: fromEmail, // Admin email is fromEmail
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

    const info = await sendEmailWithRetry(mailOptions);
    if (info) {
      console.log('✓ Admin email sent successfully');
    }
    return info;
  } catch (err) {
    console.error('Error in sendAdminBookingReceivedEmail:');
    console.error(err.message);
    console.error(err.stack);
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
        from: fromEmail,
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
        from: fromEmail,
        to: booking.customer_email,
        subject: 'Booking Cancelled',
        text: `Hello ${booking.customer_name},

Your booking has been cancelled.

Please contact us for more information.`
      };
    }

    return sendEmailWithRetry(mailOptions);
  } catch (err) {
    console.error('Error in sendCustomerBookingStatusChangedEmail:');
    console.error(err.message);
    console.error(err.stack);
  }
};

// Send simple test email
export const sendTestEmail = async (toEmail) => {
  const mailOptions = {
    from: fromEmail,
    to: toEmail,
    subject: 'PelliGallery Test Email Connection',
    text: 'SMTP setup test succeeded.'
  };
  return transporter.sendMail(mailOptions);
};
