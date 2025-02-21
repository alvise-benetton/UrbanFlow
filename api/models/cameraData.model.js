const mongoose = require('mongoose');

// Schema principale per la zona
const CameraDataSchema = new mongoose.Schema({
  zone: {
    type: String,
    required: true,
  },
  data : [
    {
      density: Number,
      timestamp:Number
    }
  ]

}, { timestamps: true }); // timestamps aggiunge createdAt e updatedAt automaticamente

module.exports = mongoose.model('CameraData', CameraDataSchema);
