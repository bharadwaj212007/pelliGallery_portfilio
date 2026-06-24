import nodemailer from 'nodemailer';

const isMailConfigured = 
  process.env.SMTP_HOST && 
  process.env.SMTP_USER && 
  process.env.SMTP_PASS;

let transporter = null;

if (isMailConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  console.log('Nodemailer SMTP service initialized successfully.');
} else {
  console.warn('Nodemailer SMTP details missing in .env. Falling back to terminal log output for email notifications.');
}

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

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"${bookingDetails.customer_name} via PelliGallery" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
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
  } else {
    console.log('\n--- SIMULATED BOOKING EMAIL SENT ---');
    console.log(`To: ${process.env.STUDIO_EMAIL || 'pellipusthakamphotography@gmail.com'}`);
    console.log(`Subject: ${mailSubject}`);
    console.log(`Content HTML:\n${mailBodyHtml}`);
    console.log('------------------------------------\n');
    return true;
  }
};

export default transporter;
