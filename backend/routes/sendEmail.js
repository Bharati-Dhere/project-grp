const express = require('express');
const router = express.Router();
const { sendMail } = require('../controllers/mailer');

// POST /api/send-email
router.post('/', async (req, res) => {
  const { to, subject, text, html } = req.body;
  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    await sendMail({ to, subject, text, html });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send email', details: err.message });
  }
});

module.exports = router;
