const mongoose = require('mongoose');

// Schema per la struttura "latestData"
const LatestDataSchema = new mongoose.Schema({
  
});

// Schema principale per la zona
const ZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  zone: {
    type: [Number], 
    required: true,
    unique: true
  },
  threshold: {
    type: Number,
    required: true,
  },
}, { timestamps: true }); // timestamps aggiunge createdAt e updatedAt automaticamente

module.exports = mongoose.model('Zone', ZoneSchema);
