const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Submission = require('../models/Submission');
const Provider = require('../models/Provider');

// Submit a brief (public — for clients)
router.post('/', async (req, res) => {
  try {
    const { portalLink, answers } = req.body;

    const provider = await Provider.findOne({ portalLink });
    if (!provider) {
      return res.status(404).json({ message: 'Portal not found' });
    }

    const submission = await Submission.create({
      providerId: provider._id,
      portalLink,
      clientName: answers['field-001'] || 'Unknown',
      clientEmail: answers['field-003'] || 'Unknown',
      clientBusiness: answers['field-002'] || '',
      answers,
      status: 'completed',
    });

    res.status(201).json({ success: true, id: submission._id });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all submissions for a provider (authenticated)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const submissions = await Submission.find({
      providerId: req.providerId,
    }).sort({ createdAt: -1 });

    res.json(submissions);
  } catch (err) {
    console.error('Get submissions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get one submission by client ID (authenticated)
router.get('/:clientId', authMiddleware, async (req, res) => {
  try {
    const submission = await Submission.findOne({
      _id: req.params.clientId,
      providerId: req.providerId,
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json(submission);
  } catch (err) {
    console.error('Get submission error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;