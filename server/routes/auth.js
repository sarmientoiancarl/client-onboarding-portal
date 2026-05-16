const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Provider = require('../models/Provider');
const FormTemplate = require('../models/FormTemplate');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await Provider.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const portalLink = crypto.randomBytes(6).toString('hex');

    const provider = await Provider.create({
      name,
      email,
      password: hashed,
      portalLink,
    });

    // Create a default form template for the new provider
    await FormTemplate.create({
      providerId: provider._id,
      title: 'Client Intake Form',
      fields: [
        { id: 'field-001', type: 'text', label: 'Full Name', placeholder: 'Enter your full name', required: true },
        { id: 'field-002', type: 'text', label: 'Business Name', placeholder: 'Enter your business name', required: true },
        { id: 'field-003', type: 'email', label: 'Email Address', placeholder: 'Enter your email', required: true },
        { id: 'field-004', type: 'textarea', label: 'Project Goals', placeholder: 'Describe what you want to achieve', required: true },
        { id: 'field-005', type: 'textarea', label: 'Target Audience', placeholder: 'Who are your target customers?', required: false },
        { id: 'field-006', type: 'select', label: 'Project Budget', required: true, options: ['Below ₱10,000', '₱10,000 - ₱25,000', '₱25,000 - ₱50,000', 'Above ₱50,000'] },
        { id: 'field-007', type: 'text', label: 'Preferred Timeline', placeholder: 'e.g. 2 weeks, 1 month', required: false },
      ],
    });

    const token = jwt.sign({ id: provider._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      success: true,
      token,
      name: provider.name,
      portalLink: provider.portalLink,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const provider = await Provider.findOne({ email });
    if (!provider) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, provider.password);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: provider._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      success: true,
      token,
      name: provider.name,
      portalLink: provider.portalLink,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;