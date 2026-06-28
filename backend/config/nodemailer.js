import nodemailer from 'nodemailer';

// Startup Logging (Requirement 11 & 12)
console.log('=== SMTP CONFIGURATION AUDIT ===');
console.log('SMTP Host:', process.env.SMTP_HOST || 'Not Configured');
console.log('SMTP Port:', process.env.SMTP_PORT || 'Not Configured');
console.log('SMTP Secure:', process.env.SMTP_SECURE || 'Not Configured');
console.log('SMTP User:', process.env.SMTP_USER || 'Not Configured');
console.log('SMTP From:', process.env.SMTP_FROM || 'Not Configured');
console.log('Studio Email:', process.env.STUDIO_EMAIL || 'Not Configured');
if (process.env.RENDER) {
  console.log('Running on Render Production');
}
console.log('================================');

// Verify required environment variables (Requirement 3 & new instruction)
const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.warn(`⚠️ Warning: Missing required SMTP environment variables: ${missingVars.join(', ')}`);
}

// SMTP_FROM optional fallback and logging (Requirement 1, 5)
const FROM_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER;
if (!process.env.SMTP_FROM) {
  console.log('SMTP_FROM not configured.');
  console.log('Using SMTP_USER as sender.');
}

// Brevo Fallback Transporter configuration (Requirement 14)
const useBrevo = process.env.SMTP_PROVIDER === 'brevo' || !!process.env.BREVO_SMTP_HOST;
const host = useBrevo ? (process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com') : process.env.SMTP_HOST;
const port = Number(useBrevo ? (process.env.BREVO_SMTP_PORT || '587') : process.env.SMTP_PORT);
const secure = useBrevo ? (process.env.BREVO_SMTP_SECURE === 'true') : (process.env.SMTP_SECURE === 'true');
const user = useBrevo ? process.env.BREVO_SMTP_USER : process.env.SMTP_USER;
const pass = useBrevo ? process.env.BREVO_SMTP_PASS : process.env.SMTP_PASS;

const transporterOptions = {
  host,
  port,
  secure,
  auth: {
    user,
    pass,
  },
  connectionTimeout: 120000,
  greetingTimeout: 120000,
  socketTimeout: 120000,
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  tls: {
    rejectUnauthorized: false,
  },
  logger: true,
  debug: true,
};

// Gmail STARTTLS Compatibility (Requirement 13)
if (!secure) {
  transporterOptions.requireTLS = true;
}

// Log transporter configuration (except password)
const loggedConfig = { ...transporterOptions };
if (loggedConfig.auth) {
  loggedConfig.auth = {
    user: loggedConfig.auth.user,
    pass: loggedConfig.auth.pass ? '[LOADED]' : '[MISSING]'
  };
}
console.log("Centralized Nodemailer Transporter Options (nodemailer.js):", JSON.stringify(loggedConfig, null, 2));

const transporter = nodemailer.createTransport(transporterOptions);
console.log('Nodemailer SMTP service initialized successfully.');

export const sendBookingEmail = async (bookingDetails, packagesList) => {
  const mailSubject = `New Wedding Booking Inquiry - ${bookingDetails.customer_name}`;
  
  const packageDetailsHtml = packagesList.map(item => `
    <div style="border-bottom: 1px solid #eee; padding-bottom: 12px; margin-bottom: 12px;">
      <h3 style="color: #D4AF37; margin: 0 0 6px 0;">${item.package_name}</h3>
      <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Base Price:</strong> INR ${parseFloat(item.package_price).toLocaleString('en-IN')}</p>
      <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Quantity:</strong> ${item.quantity}</p>
      ${item.selected_customizations && item.selected_customizations.length > 0 
        ? `<p style="margin: 0; font-size: 13px; color: #555;"><strong>Customizations:</strong> ${item.selected_customizations.map(c => `${c.name} (+INR ${parseFloat(c.price).toLocaleString('en-IN')})`).join(', ')}</p>`
        : ''
      }
    </div>
  `).join('');

  const mailBodyHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      <div style="background-color: #1a1a1a; padding: 24px; text-align: center; border-bottom: 3px solid #D4AF37;">
        <h1 style="color: #FAF9F6; margin: 0; font-family: 'Georgia', serif; font-size: 24px; letter-spacing: 2px;">Pellipusthakam Photography</h1>
        <p style="color: #D4AF37; margin: 4px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px;">Hyderabad</p>
      </div>
      <div style="padding: 24px; background-color: #FAF9F6;">
        <h2 style="font-family: 'Georgia', serif; font-weight: normal; font-size: 20px; color: #1a1a1a; margin-top: 0; border-bottom: 1px solid #e5e5e5; padding-bottom: 8px;">New Booking Inquiry Recieved</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 35%;">Customer Name:</td>
            <td style="padding: 8px 0;">${bookingDetails.customer_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Email Address:</td>
            <td style="padding: 8px 0;"><a href="mailto:${bookingDetails.customer_email}" style="color: #D4AF37; text-decoration: none;">${bookingDetails.customer_email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Event Date:</td>
            <td style="padding: 8px 0;">${new Date(bookingDetails.event_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Event Location:</td>
            <td style="padding: 8px 0;">${bookingDetails.event_location}</td>
          </tr>
          ${bookingDetails.special_requirements ? `
          <tr>
            <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Special Requests:</td>
            <td style="padding: 8px 0; font-style: italic;">${bookingDetails.special_requirements}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 12px 0; font-weight: bold; font-size: 16px; border-top: 2px solid #e5e5e5;">Estimated Total:</td>
            <td style="padding: 12px 0; font-weight: bold; font-size: 18px; color: #D4AF37; border-top: 2px solid #e5e5e5;">INR ${parseFloat(bookingDetails.total_price).toLocaleString('en-IN')}</td>
          </tr>
        </table>

        <h3 style="font-family: 'Georgia', serif; font-weight: normal; font-size: 16px; border-bottom: 1px solid #e5e5e5; padding-bottom: 6px; margin-bottom: 12px;">Selected Packages</h3>
        ${packageDetailsHtml}
      </div>
      <div style="background-color: #f5f5f5; padding: 16px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eaeaea;">
        <p style="margin: 0;">This inquiry has been stored securely in the database. Please contact the client within 24 hours.</p>
        <p style="margin: 4px 0 0 0;">&copy; 2026 Pellipusthakam Photography. Hyderabad, India.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"PelliGallery" <${FROM_EMAIL}>`,
      to: process.env.STUDIO_EMAIL || 'pellipusthakamphotography@gmail.com',
      subject: mailSubject,
      html: mailBodyHtml,
    });
    console.log('Notification email successfully sent to studio.');
    return true;
  } catch (err) {
    console.error('Error sending booking confirmation email:', err.message);
    return false;
  }
};

export default transporter;
export { FROM_EMAIL };
