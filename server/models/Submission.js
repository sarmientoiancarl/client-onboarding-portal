const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  fieldId: String,
  originalName: String,
  filename: String,
  mimetype: String,
  size: Number,
  url: String,
});

const submissionSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    portalLink: {
      type: String,
      required: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    clientEmail: {
      type: String,
      required: true,
    },
    clientBusiness: {
      type: String,
    },
    answers: {
      type: Map,
      of: String,
    },
    files: [fileSchema],
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'completed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Submission', submissionSchema);