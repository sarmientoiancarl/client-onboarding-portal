const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  id: String,
  type: {
    type: String,
    enum: ['text', 'email', 'url', 'textarea', 'select', 'file'],
    required: true,
  },
  label: { type: String, required: true },
  placeholder: String,
  required: { type: Boolean, default: false },
  options: [String],
  helperText: { type: String, default: '' },
  attachmentUrl: { type: String, default: '' },
  attachmentName: { type: String, default: '' },
  attachmentMimetype: { type: String, default: '' },
});

const formTemplateSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    title: { type: String, default: 'Client Intake Form' },
    introNote: { type: String, default: '' },
    introImageUrl: { type: String, default: '' },
    introImageName: { type: String, default: '' },
    fields: [fieldSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('FormTemplate', formTemplateSchema);