const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendAdminNotification(type, data) {
  if (!transporter || !process.env.ADMIN_EMAIL) {
    console.log('Email notification skipped - not configured');
    return;
  }

  try {
    const subject = type === 'parent'
      ? 'New Parent Interest - Tahoe Night Nurse'
      : 'New Caregiver Application - Tahoe Night Nurse';

    let htmlContent = `<h2>${subject}</h2>`;
    htmlContent += '<table style="border-collapse: collapse; width: 100%;">';

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'company') {
        const label = key.split('_').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        htmlContent += `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${label}:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${value || 'N/A'}</td>
          </tr>
        `;
      }
    });

    htmlContent += '</table>';

    await transporter.sendMail({
      from: `"Tahoe Night Nurse" <noreply@tahoenightnurse.com>`,
      to: process.env.ADMIN_EMAIL,
      subject: subject,
      html: htmlContent
    });

    console.log('Admin notification sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = {
  sendAdminNotification
};