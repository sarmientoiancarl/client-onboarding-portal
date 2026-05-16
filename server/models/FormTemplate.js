const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  id: String,
  type: {
    type: String,
    enum: ['text', 'email', 'textarea', 'select'],
    required: true,
  },
  label: { type: String, required: true },
  placeholder: String,
  required: { type: Boolean, default: false },
  options: [String],
});

const formTemplateSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    title: {
      type: String,
      default: 'Client Intake Form',
    },
    fields: [fieldSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('FormTemplate', formTemplateSchema);