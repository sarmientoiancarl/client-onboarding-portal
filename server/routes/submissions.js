const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const Submission = require('../models/Submission');
const Provider = require('../models/Provider');
const FormTemplate = require('../models/FormTemplate');

// Helper — find a field value by matching common label names
const findFieldValue = (answers, fields, keywords) => {
  if (!fields || !answers) return '';
  const match = fields.find((f) =>
    keywords.some((kw) => f.label.toLowerCase().includes(kw.toLowerCase()))
  );
  if (!match) return '';
  return answers[match.id] || '';
};

// Submit a brief (public — for clients)
router.post('/', upload.any(), async (req, res) => {
  try {
    const { portalLink, templateId, answers } = req.body;
    const parsedAnswers = typeof answers === 'string' ? JSON.parse(answers) : answers;

    const provider = await Provider.findOne({ portalLink });
    if (!provider) {
      return res.status(404).json({ message: 'Portal not found' });
    }

    // Load the form template to find name/email/business fields dynamically
    let templateFields = [];
    if (templateId) {
      const tmpl = await FormTemplate.findById(templateId);
      if (tmpl) templateFields = tmpl.fields;
    } else {
      const tmpl = await FormTemplate.findOne({ providerId: provider._id });
      if (tmpl) templateFields = tmpl.fields;
    }

    // Try to find name, email, business by matching field labels
    const clientName =
      findFieldValue(parsedAnswers, templateFields, ['full name', 'name']) ||
      Object.values(parsedAnswers)[0] ||
      'Unknown';

    const clientEmail =
      findFieldValue(parsedAnswers, templateFields, ['email']) ||
      'Unknown';

    const clientBusiness =
      findFieldValue(parsedAnswers, templateFields, ['business', 'company', 'organization']) ||
      '';

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
      clientName,
      clientEmail,
      clientBusiness,
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