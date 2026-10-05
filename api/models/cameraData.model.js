const mongoose = require('mongoose');

// Schema principale per la zona
const CameraDataSchema = new mongoose.Schema({
  zone: {
    type: String,
    required: true,
    index: true,
  },
  data: [
    {
      density: Number,
      timestamp: Number,
    }
  ]
}, { timestamps: true });

CameraDataSchema.index({ zone: 1, updatedAt: -1 });

module.exports = mongoose.model('CameraData', CameraDataSchema);
