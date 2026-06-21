const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const FormTemplate = require('../models/FormTemplate');
const Provider = require('../models/Provider');

// Get all templates by portal link (public — for clients)
router.get('/portal/:portalLink', async (req, res) => {
  try {
    const provider = await Provider.findOne({ portalLink: req.params.portalLink });
    if (!provider) {
      return res.status(404).json({ message: 'Portal not found' });
    }
    const forms = await FormTemplate.find({ providerId: provider._id });
    if (!forms || forms.length === 0) {
      return res.status(404).json({ message: 'No forms found' });
    }
    res.json(forms);
  } catch (err) {
    console.error('Get forms error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all templates for a provider (authenticated)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const forms = await FormTemplate.find({ providerId: req.providerId });
    res.json(forms);
  } catch (err) {
    console.error('Get forms error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get one template by ID (authenticated)
router.get('/:templateId', authMiddleware, async (req, res) => {
  try {
    const form = await FormTemplate.findOne({
      _id: req.params.templateId,
      providerId: req.providerId,
    });
    if (!form) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json(form);
  } catch (err) {
    console.error('Get form error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new template (authenticated)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, fields } = req.body;
    const form = await FormTemplate.create({
      providerId: req.providerId,
      title: title || 'New Form',
      introNote: '',
      fields: fields || [],
    });
    res.status(201).json(form);
  } catch (err) {
    console.error('Create form error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a template with optional field attachments and intro image (authenticated)
router.patch('/:templateId', authMiddleware, upload.any(), async (req, res) => {
  try {
    const { title, introNote, fields } = req.body;
    const parsedFields = typeof fields === 'string' ? JSON.parse(fields) : fields;

    // Separate intro image from field attachments
    const fileMap = {};
    let introImageUrl = null;
    let introImageName = null;

    (req.files || []).forEach((file) => {
      if (file.fieldname === 'introImage') {
        introImageUrl = `http://localhost:5000/uploads/${file.filename}`;
        introImageName = file.originalname;
      } else {
        fileMap[file.fieldname] = {
          url: `http://localhost:5000/uploads/${file.filename}`,
          name: file.originalname,
          mimetype: file.mimetype,
        };
      }
    });

    // Merge uploaded file info into the matching field
    const updatedFields = parsedFields.map((field) => {
      if (fileMap[field.id]) {
        return {
          ...field,
          attachmentUrl: fileMap[field.id].url,
          attachmentName: fileMap[field.id].name,
          attachmentMimetype: fileMap[field.id].mimetype,
        };
      }
      return field;
    });

    // Build update object
    const updateData = {
      title,
      introNote: introNote || '',
      fields: updatedFields,
    };

    if (introImageUrl) {
      updateData.introImageUrl = introImageUrl;
      updateData.introImageName = introImageName;
    }

    const form = await FormTemplate.findOneAndUpdate(
      { _id: req.params.templateId, providerId: req.providerId },
      updateData,
      { new: true }
    );

    if (!form) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json(form);
  } catch (err) {
    console.error('Update form error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a template (authenticated)
router.delete('/:templateId', authMiddleware, async (req, res) => {
  try {
    const count = await FormTemplate.countDocuments({ providerId: req.providerId });
    if (count <= 1) {
      return res.status(400).json({ message: 'You must have at least one form template.' });
    }
    const form = await FormTemplate.findOneAndDelete({
      _id: req.params.templateId,
      providerId: req.providerId,
    });
    if (!form) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Delete form error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;