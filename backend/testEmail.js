import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendTestEmail() {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'PelliGallery Test Email',
            text: 'Congratulations! Email setup is working.',
        });

        console.log('✅ Email sent successfully');
        console.log(info.messageId);
    } catch (err) {
        console.log('❌ Email failed');
        console.error(err);
    }
}

sendTestEmail();