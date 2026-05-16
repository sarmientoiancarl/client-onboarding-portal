const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const FormTemplate = require('../models/FormTemplate');
const Provider = require('../models/Provider');

// Get form template by portal link (public — for clients)
router.get('/portal/:portalLink', async (req, res) => {
  try {
    const provider = await Provider.findOne({
      portalLink: req.params.portalLink,
    });
    if (!provider) {
      return res.status(404).json({ message: 'Portal not found' });
    }

    const form = await FormTemplate.findOne({ providerId: provider._id });
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.json(form);
  } catch (err) {
    console.error('Get form error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get form template (provider — authenticated)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const form = await FormTemplate.findOne({ providerId: req.providerId });
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.json(form);
  } catch (err) {
    console.error('Get form error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save / update form template (provider — authenticated)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, fields } = req.body;

    const form = await FormTemplate.findOneAndUpdate(
      { providerId: req.providerId },
      { title, fields },
      { new: true, upsert: true }
    );

    res.json(form);
  } catch (err) {
    console.error('Save form error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;