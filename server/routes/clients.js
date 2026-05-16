const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Submission = require('../models/Submission');

// Get all clients (submissions) for a provider
router.get('/', authMiddleware, async (req, res) => {
  try {
    const submissions = await Submission.find({
      providerId: req.providerId,
    }).sort({ createdAt: -1 });

    const clients = submissions.map((s) => ({
      id: s._id,
      name: s.clientName,
      business: s.clientBusiness,
      email: s.clientEmail,
      status: s.status,
      submittedAt: s.createdAt,
      portalLink: s.portalLink,
    }));

    res.json(clients);
  } catch (err) {
    console.error('Get clients error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;