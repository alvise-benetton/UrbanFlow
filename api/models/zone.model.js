const mongoose = require('mongoose');



// Schema principale per la zona
const ZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  coordinates: {
    type: [[Number]], 
    required: true,
    //unique: true
  },
  threshold: {
    type: Number,
    required: true,
  },
}, { timestamps: true }); // timestamps aggiunge createdAt e updatedAt automaticamente

module.exports = mongoose.model('Zone', ZoneSchema);
