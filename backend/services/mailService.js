import dotenv from 'dotenv';
import transporter from '../config/nodemailer.js';

dotenv.config();

const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'STUDIO_EMAIL'];

const getFromEmail = () => process.env.SMTP_FROM || process.env.SMTP_USER;

// Verification function (called at startup or endpoint)
export const verifySMTPConnection = async (attempt = 1) => {
  const currentMissing = requiredEnvVars.filter(v => !process.env[v]);
  if (currentMissing.length > 0) {
    console.error(`❌ SMTP Connection Verification aborted: missing variables: ${currentMissing.join(', ')}`);
    return false;
  }

  console.log(`SMTP connection started (Attempt ${attempt}/3)`);
  try {
    await transporter.verify();
    console.log('SMTP verified');
    return true;
  } catch (error) {
    console.error(`❌ SMTP Connection Failed (Attempt ${attempt}/3):`);
    console.error(error);
    if (error.code) console.error('Error Code:', error.code);
    if (error.command) console.error('Error Command:', error.command);
    if (error.response) console.error('Error Response:', error.response);
    if (error.stack) console.error('Error Stack:', error.stack);

    // Explain exactly why Render is timing out while localhost works (Requirement 13 & 14)
    if (process.env.SMTP_HOST?.includes('gmail') || transporter.options.host?.includes('gmail')) {
      console.warn(`
        💡 Gmail Troubleshooting Advice:
        If Gmail blocks the connection or times out (Connection timeout / ETIMEDOUT / CONN):
        1. App Password: Make sure you are using a 16-character App Password, NOT your regular password.
        2. 2-Step Verification: Ensure 2-Step Verification is enabled on your Google Account to generate App Passwords.
        3. SMTP environment variables: Verify that host, port, secure, and user are correctly defined.
        4. Firewall/Timeout: Outbound SMTP ports (25, 465, 587) are blocked by default on Render's hosting environment to prevent spam.
        
        If Gmail SMTP repeatedly times out on Render, we highly recommend switching to Brevo SMTP.
        You can enable the Brevo SMTP configuration simply by setting SMTP_PROVIDER=brevo in your Render environment variables.
      `);
    }

    if (attempt < 3) {
      console.log(`🔄 Retrying SMTP connection (Attempt ${attempt + 1}/3) in 2 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return verifySMTPConnection(attempt + 1);
    }
    return false;
  }
};

// Reusable send function with verification and retry (Requirement 5, 9, 15)
export const sendEmailWithRetry = async (mailOptions, attempt = 1) => {
  const currentMissing = requiredEnvVars.filter(v => !process.env[v]);
  if (currentMissing.length > 0) {
    const errorMsg = `SMTP send aborted: missing environment variables: ${currentMissing.join(', ')}`;
    console.error(`❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // 15. Log SMTP Verify Started
  console.log('SMTP Verify Started');
  try {
    // 5. Verify SMTP Connection before sending
    await transporter.verify();
    console.log('SMTP Verified');
  } catch (error) {
    console.error(`❌ SMTP Verify Failed (Attempt ${attempt}/3):`);
    console.error(error);
    if (error.code) console.error('Error Code:', error.code);
    if (error.command) console.error('Error Command:', error.command);
    if (error.response) console.error('Error Response:', error.response);
    if (error.stack) console.error('Error Stack:', error.stack);

    // Gmail connection failures suggestions (Requirement 13 & 14)
    if (process.env.SMTP_HOST?.includes('gmail') || transporter.options.host?.includes('gmail')) {
      console.warn(`
        💡 Gmail Troubleshooting Advice:
        If Gmail blocks the connection or times out (Connection timeout / ETIMEDOUT / CONN):
        1. App Password: Make sure you are using a 16-character App Password, NOT your regular password.
        2. 2-Step Verification: Ensure 2-Step Verification is enabled on your Google Account to generate App Passwords.
        3. SMTP environment variables: Verify that host, port, secure, and user are correctly defined.
        4. Firewall/Timeout: Outbound SMTP ports (25, 465, 587) are blocked by default on Render's hosting environment to prevent spam.
        
        If Gmail SMTP repeatedly times out on Render, we highly recommend switching to Brevo SMTP.
        You can enable the Brevo SMTP configuration simply by setting SMTP_PROVIDER=brevo in your Render environment variables.
      `);
    }

    if (attempt < 3) {
      console.log(`Waiting 2 seconds before retry (Attempt ${attempt + 1}/3)...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return sendEmailWithRetry(mailOptions, attempt + 1);
    }
    throw error;
  }

  // Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (err) {
    console.error(`❌ SMTP Send Failed (Attempt ${attempt}/3):`);
    console.error(err);
    if (err.code) console.error('Error Code:', err.code);
    if (err.command) console.error('Error Command:', err.command);
    if (err.response) console.error('Error Response:', err.response);
    if (err.stack) console.error('Error Stack:', err.stack);

    if (attempt < 3) {
      console.log(`Waiting 2 seconds before retry (Attempt ${attempt + 1}/3)...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return sendEmailWithRetry(mailOptions, attempt + 1);
    }
    throw err;
  }
};

// Send customer booking confirmation (Pending status received - Requirement 7)
export const sendCustomerBookingReceivedEmail = async (booking) => {
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
            <td style="padding: 8px 0;"><span style="background-color: #fcf8e3; color: #c09853; border: 1px solid #fbeed5; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase;">${booking.status || 'Pending Approval'}</span></td>
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

  return sendEmailWithRetry(mailOptions);
};

// Send admin booking notification (Studio Email - Requirement 8)
export const sendAdminBookingReceivedEmail = async (booking) => {
  const phoneMatch = booking.special_requirements?.match(/\[Phone:\s*(.*?)\]/);
  const typeMatch = booking.special_requirements?.match(/\[Event Type:\s*(.*?)\]/);
  const customer_phone = phoneMatch ? phoneMatch[1] : 'N/A';
  const event_type = typeMatch ? typeMatch[1] : 'N/A';

  const packagesStr = booking.items.map(i => i.package_name).join(', ');
  const formattedPrice = parseFloat(booking.total_price).toLocaleString('en-IN');

  const mailOptions = {
    from: `"PelliGallery System" <${getFromEmail()}>`,
    to: process.env.STUDIO_EMAIL || getFromEmail(), // Send to STUDIO_EMAIL (Requirement 8)
    subject: `New Booking Received from ${booking.customer_name}`,
    text: `New Booking Received\n\nCustomer Name: ${booking.customer_name}\nEmail: ${booking.customer_email}\nPhone: ${customer_phone}\nPackage: ${packagesStr}\nAmount: INR ${formattedPrice}\nEvent Date: ${booking.event_date}\nLocation: ${booking.event_location}\nBooking ID: ${booking._id || booking.id}`
  };

  return sendEmailWithRetry(mailOptions);
};

// Send customer booking status changed email (Confirmed/Cancelled)
export const sendCustomerBookingStatusChangedEmail = async (booking, status) => {
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
};

// Send simple test email
export const sendTestEmail = async (toEmail) => {
  const mailOptions = {
    from: getFromEmail(),
    to: toEmail,
    subject: 'PelliGallery Test Email Connection',
    text: 'SMTP setup test succeeded.'
  };
  return sendEmailWithRetry(mailOptions);
};
