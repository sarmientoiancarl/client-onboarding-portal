const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Submission = require('../models/Submission');
const Provider = require('../models/Provider');
const crypto = require('crypto');

// Get all clients for a provider
router.get('/', authMiddleware, async (req, res) => {
  try {
    const submissions = await Submission.find({
      providerId: req.providerId,
    })
      .sort({ createdAt: -1 })
      .populate('templateId', 'title');

    const clients = submissions.map((s) => ({
      id: s._id,
      name: s.clientName,
      business: s.clientBusiness,
      email: s.clientEmail,
      status: s.status,
      submittedAt: s.createdAt,
      portalLink: s.portalLink,
      formTitle: s.templateId?.title || null,
    }));

    res.json(clients);
  } catch (err) {
    console.error('Get clients error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a client manually
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, business, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    const provider = await Provider.findById(req.providerId);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found.' });
    }

    const portalLink = provider.portalLink;

    const submission = await Submission.create({
      providerId: req.providerId,
      portalLink,
      clientName: name,
      clientEmail: email,
      clientBusiness: business || '',
      answers: {},
      files: [],
      status: 'pending',
    });

    res.status(201).json({
      id: submission._id,
      name: submission.clientName,
      business: submission.clientBusiness,
      email: submission.clientEmail,
      status: submission.status,
      submittedAt: submission.createdAt,
      portalLink: submission.portalLink,
    });
  } catch (err) {
    console.error('Create client error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a client
router.patch('/:clientId', authMiddleware, async (req, res) => {
  try {
    const { name, business, email, status } = req.body;

    const submission = await Submission.findOneAndUpdate(
      { _id: req.params.clientId, providerId: req.providerId },
      {
        ...(name && { clientName: name }),
        ...(business !== undefined && { clientBusiness: business }),
        ...(email && { clientEmail: email }),
        ...(status && { status }),
      },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    res.json({
      id: submission._id,
      name: submission.clientName,
      business: submission.clientBusiness,
      email: submission.clientEmail,
      status: submission.status,
      submittedAt: submission.createdAt,
      portalLink: submission.portalLink,
    });
  } catch (err) {
    console.error('Update client error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a client
router.delete('/:clientId', authMiddleware, async (req, res) => {
  try {
    const submission = await Submission.findOneAndDelete({
      _id: req.params.clientId,
      providerId: req.providerId,
    });

    if (!submission) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Delete client error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;