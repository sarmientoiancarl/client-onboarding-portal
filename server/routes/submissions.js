const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const Submission = require('../models/Submission');
const Provider = require('../models/Provider');

// Submit a brief (public — for clients)
router.post('/', upload.any(), async (req, res) => {
  try {
    const { portalLink, templateId, answers } = req.body;
    const parsedAnswers = typeof answers === 'string' ? JSON.parse(answers) : answers;

    const provider = await Provider.findOne({ portalLink });
    if (!provider) {
      return res.status(404).json({ message: 'Portal not found' });
    }

    const files = (req.files || []).map((file) => ({
      fieldId: file.fieldname,
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: `http://localhost:5000/uploads/${file.filename}`,
    }));

    const submission = await Submission.create({
      providerId: provider._id,
      portalLink,
      templateId: templateId || null,
      clientName: parsedAnswers['field-001'] || 'Unknown',
      clientEmail: parsedAnswers['field-003'] || 'Unknown',
      clientBusiness: parsedAnswers['field-002'] || '',
      answers: parsedAnswers,
      files,
      status: 'completed',
    });

    res.status(201).json({ success: true, id: submission._id });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
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

// Get one submission by ID (authenticated)
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