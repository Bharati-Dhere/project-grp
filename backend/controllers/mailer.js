const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL, // Your admin Gmail address
    pass: process.env.ADMIN_EMAIL_PASSWORD // App password or Gmail password
  }
});

async function sendMail({ to, subject, text, html }) {
  const mailOptions = {
    from: process.env.ADMIN_EMAIL,
    to,
    subject,
    text,
    html
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendMail };
