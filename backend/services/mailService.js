import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Startup Logging
console.log("SMTP_HOST:", process.env.SMTP_HOST);
console.log("SMTP_PORT:", process.env.SMTP_PORT);
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS Loaded:", !!process.env.SMTP_PASS);

// Verify Environment Variables (Warn, do not crash immediately at startup)
const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.warn(`⚠️ Warning: Missing SMTP environment variables: ${missingVars.join(', ')}`);
}

const getFromEmail = () => process.env.SMTP_FROM || process.env.SMTP_USER;

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true'; // false for 587
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: true,
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    auth: {
      user,
      pass
    }
  });
  return transporter;
};

// Verification function
export const verifySMTPConnection = async (attempt = 1) => {
  const currentMissing = requiredEnvVars.filter(v => !process.env[v]);
  if (currentMissing.length > 0) {
    console.error(`❌ SMTP Connection Verification aborted: missing variables: ${currentMissing.join(', ')}`);
    return false;
  }

  console.log('SMTP connection started');
  try {
    const currentTransporter = getTransporter();
    await currentTransporter.verify();
    console.log('SMTP verified');
    return true;
  } catch (error) {
    console.error(`❌ SMTP Connection Failed (Attempt ${attempt}/3):`);
    console.error(error);
    if (error.code) console.error('Error Code:', error.code);
    if (error.command) console.error('Error Command:', error.command);
    if (error.response) console.error('Error Response:', error.response);

    if (attempt < 3) {
      console.log(`🔄 Retrying SMTP connection (Attempt ${attempt + 1}/3) in 2 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return verifySMTPConnection(attempt + 1);
    }
    return false;
  }
};

// Reusable send function with up to 3 attempts
export const sendEmailWithRetry = async (mailOptions, attempt = 1) => {
  const currentMissing = requiredEnvVars.filter(v => !process.env[v]);
  if (currentMissing.length > 0) {
    const errorMsg = `SMTP send aborted: missing variables: ${currentMissing.join(', ')}`;
    console.error(`❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  try {
    const currentTransporter = getTransporter();
    const info = await currentTransporter.sendMail(mailOptions);
    return info;
  } catch (err) {
    console.error(`❌ Email send attempt ${attempt} failed:`);
    console.error(err);
    if (err.code) console.error('Error Code:', err.code);
    if (err.command) console.error('Error Command:', err.command);
    if (err.response) console.error('Error Response:', err.response);

    if (attempt < 3) {
      console.log(`🔄 Retrying email send (Attempt ${attempt + 1}/3) in 2 seconds...`);
      // Wait 2 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
      return sendEmailWithRetry(mailOptions, attempt + 1);
    }
    throw err;
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

    const htmlBody = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <div style="background-color: #1a1a1a; padding: 24px; text-align: center; border-bottom: 3px solid #D4AF37;">
          <h1 style="color: #FAF9F6; margin: 0; font-family: 'Georgia', serif; font-size: 24px; letter-spacing: 2px;">Pellipusthakam Photography</h1>
          <p style="color: #D4AF37; margin: 4px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px;">Hyderabad</p>
        </div>
        <div style="padding: 24px; background-color: #FAF9F6;">
          <h2 style="font-family: 'Georgia', serif; font-weight: normal; font-size: 20px; color: #1a1a1a; margin-top: 0; border-bottom: 1px solid #e5e5e5; padding-bottom: 8px;">Booking Request Received</h2>
          
          <p style="font-size: 14px; line-height: 1.6; color: #555;">
            Hello ${booking.customer_name},<br/><br/>
            Thank you for choosing Pellipusthakam Photography. We have successfully received your booking inquiry. Our team will review the details and get back to you shortly to schedule a consultation.
          </p>

          <h3 style="font-family: 'Georgia', serif; font-weight: normal; font-size: 16px; border-bottom: 1px solid #e5e5e5; padding-bottom: 6px; margin-top: 24px; margin-bottom: 12px; color: #1a1a1a;">Booking Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 35%; color: #555;">Booking Reference:</td>
              <td style="padding: 8px 0; color: #1a1a1a;">#${booking._id || booking.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Selected Packages:</td>
              <td style="padding: 8px 0; color: #1a1a1a;">${packagesStr}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Event Date:</td>
              <td style="padding: 8px 0; color: #1a1a1a;">${booking.event_date}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Event Type:</td>
              <td style="padding: 8px 0; color: #1a1a1a;">${event_type}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Location:</td>
              <td style="padding: 8px 0; color: #1a1a1a;">${booking.event_location}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-weight: bold; font-size: 15px; border-top: 1px solid #e5e5e5; color: #555;">Estimated Investment:</td>
              <td style="padding: 12px 0; font-weight: bold; font-size: 16px; color: #D4AF37; border-top: 1px solid #e5e5e5;">INR ${formattedPrice}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Status:</td>
              <td style="padding: 8px 0;"><span style="background-color: #fcf8e3; color: #c09853; border: 1px solid #fbeed5; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase;">Pending Approval</span></td>
            </tr>
          </table>
        </div>
        <div style="background-color: #1a1a1a; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 3px solid #D4AF37;">
          <p style="margin: 0; color: #FAF9F6;">Pellipusthakam Photography</p>
          <p style="margin: 4px 0 0 0; color: #777;">Gachibowli, Hyderabad, India | +91 98765 43210</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Pellipusthakam Photography" <${getFromEmail()}>`,
      to: booking.customer_email,
      subject: 'Booking Confirmation - Pellipusthakam Photography',
      text: `Hello ${booking.customer_name},\n\nThank you for choosing Pellipusthakam Photography. Your booking has been successfully received.\n\nBooking ID: ${booking._id || booking.id}\nPackage: ${packagesStr}\nAmount: INR ${formattedPrice}\n\nOur team will review your request and contact you shortly.`,
      html: htmlBody
    };

    const info = await sendEmailWithRetry(mailOptions);
    console.log('Customer email sent');
    return info;
  } catch (err) {
    console.error('Customer email failed:');
    console.error(err);
    if (err.code) console.error('Error Code:', err.code);
    if (err.command) console.error('Error Command:', err.command);
    if (err.response) console.error('Error Response:', err.response);
    return null;
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
      from: `"PelliGallery System" <${getFromEmail()}>`,
      to: getFromEmail(), // Admin email is getFromEmail()
      subject: `New Booking Received from ${booking.customer_name}`,
      text: `New Booking Received\n\nCustomer Name: ${booking.customer_name}\nEmail: ${booking.customer_email}\nPhone: ${customer_phone}\nPackage: ${packagesStr}\nAmount: INR ${formattedPrice}\nEvent Date: ${booking.event_date}\nLocation: ${booking.event_location}\nBooking ID: ${booking._id || booking.id}`
    };

    const info = await sendEmailWithRetry(mailOptions);
    console.log('Admin email sent');
    return info;
  } catch (err) {
    console.error('Admin email failed:');
    console.error(err);
    if (err.code) console.error('Error Code:', err.code);
    if (err.command) console.error('Error Command:', err.command);
    if (err.response) console.error('Error Response:', err.response);
    return null;
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
      const htmlBody = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          <div style="background-color: #1a1a1a; padding: 24px; text-align: center; border-bottom: 3px solid #D4AF37;">
            <h1 style="color: #FAF9F6; margin: 0; font-family: 'Georgia', serif; font-size: 24px; letter-spacing: 2px;">Pellipusthakam Photography</h1>
            <p style="color: #D4AF37; margin: 4px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px;">Hyderabad</p>
          </div>
          <div style="padding: 24px; background-color: #FAF9F6;">
            <h2 style="font-family: 'Georgia', serif; font-weight: normal; font-size: 20px; color: #1a1a1a; margin-top: 0; border-bottom: 1px solid #e5e5e5; padding-bottom: 8px; color: #468847;">Booking Confirmed!</h2>
            
            <p style="font-size: 14px; line-height: 1.6; color: #555;">
              Hello ${booking.customer_name},<br/><br/>
              We are thrilled to let you know that your booking has been <strong>confirmed</strong>! We are excited to capture your special day.
            </p>

            <h3 style="font-family: 'Georgia', serif; font-weight: normal; font-size: 16px; border-bottom: 1px solid #e5e5e5; padding-bottom: 6px; margin-top: 24px; margin-bottom: 12px; color: #1a1a1a;">Confirmed Details</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 35%; color: #555;">Booking Reference:</td>
                <td style="padding: 8px 0; color: #1a1a1a;">#${booking._id || booking.id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Packages:</td>
                <td style="padding: 8px 0; color: #1a1a1a;">${packagesStr}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Event Date:</td>
                <td style="padding: 8px 0; color: #1a1a1a;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Location:</td>
                <td style="padding: 8px 0; color: #1a1a1a;">${booking.event_location}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-weight: bold; font-size: 15px; border-top: 1px solid #e5e5e5; color: #555;">Amount Paid / Due:</td>
                <td style="padding: 12px 0; font-weight: bold; font-size: 16px; color: #D4AF37; border-top: 1px solid #e5e5e5;">INR ${formattedPrice}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Status:</td>
                <td style="padding: 8px 0;"><span style="background-color: #dff0d8; color: #468847; border: 1px solid #d6e9c6; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase;">Confirmed</span></td>
              </tr>
            </table>
          </div>
          <div style="background-color: #1a1a1a; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 3px solid #D4AF37;">
            <p style="margin: 0; color: #FAF9F6;">Pellipusthakam Photography</p>
            <p style="margin: 4px 0 0 0; color: #777;">Gachibowli, Hyderabad, India | +91 98765 43210</p>
          </div>
        </div>
      `;

      mailOptions = {
        from: `"Pellipusthakam Photography" <${getFromEmail()}>`,
        to: booking.customer_email,
        subject: 'Booking Confirmed - Pellipusthakam Photography',
        text: `Hello ${booking.customer_name},\n\nYour booking has been confirmed successfully.\n\nEvent: ${booking.event_location}\nDate: ${formattedDate}\nPackage: ${packagesStr}\nAmount: INR ${formattedPrice}`,
        html: htmlBody
      };
    } else if (status === 'Cancelled') {
      const htmlBody = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          <div style="background-color: #1a1a1a; padding: 24px; text-align: center; border-bottom: 3px solid #D4AF37;">
            <h1 style="color: #FAF9F6; margin: 0; font-family: 'Georgia', serif; font-size: 24px; letter-spacing: 2px;">Pellipusthakam Photography</h1>
            <p style="color: #D4AF37; margin: 4px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px;">Hyderabad</p>
          </div>
          <div style="padding: 24px; background-color: #FAF9F6;">
            <h2 style="font-family: 'Georgia', serif; font-weight: normal; font-size: 20px; color: #1a1a1a; margin-top: 0; border-bottom: 1px solid #e5e5e5; padding-bottom: 8px; color: #d9534f;">Booking Cancelled</h2>
            
            <p style="font-size: 14px; line-height: 1.6; color: #555;">
              Hello ${booking.customer_name},<br/><br/>
              Your booking inquiry reference <strong>#${booking._id || booking.id}</strong> has been cancelled. Please contact us if you have any questions.
            </p>
          </div>
          <div style="background-color: #1a1a1a; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 3px solid #D4AF37;">
            <p style="margin: 0; color: #FAF9F6;">Pellipusthakam Photography</p>
            <p style="margin: 4px 0 0 0; color: #777;">Gachibowli, Hyderabad, India | +91 98765 43210</p>
          </div>
        </div>
      `;

      mailOptions = {
        from: `"Pellipusthakam Photography" <${getFromEmail()}>`,
        to: booking.customer_email,
        subject: 'Booking Cancelled - Pellipusthakam Photography',
        text: `Hello ${booking.customer_name},\n\nYour booking reference #${booking._id || booking.id} has been cancelled. Please contact us for more information.`,
        html: htmlBody
      };
    }

    return sendEmailWithRetry(mailOptions);
  } catch (err) {
    console.error('Error in sendCustomerBookingStatusChangedEmail:');
    console.error(err);
    if (err.code) console.error('Error Code:', err.code);
    if (err.command) console.error('Error Command:', err.command);
    if (err.response) console.error('Error Response:', err.response);
    throw err;
  }
};

// Send simple test email
export const sendTestEmail = async (toEmail) => {
  const mailOptions = {
    from: getFromEmail(),
    to: toEmail,
    subject: 'PelliGallery Test Email Connection',
    text: 'SMTP setup test succeeded.'
  };
  const currentTransporter = getTransporter();
  return currentTransporter.sendMail(mailOptions);
};
