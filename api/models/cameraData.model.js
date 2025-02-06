const mongoose = require('mongoose');

// Schema per la struttura "latestData"
const LatestDataSchema = new mongoose.Schema({
  
});

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
  /* date:{
    type: Date,
    reqired: true
  } */

}, { timestamps: true }); // timestamps aggiunge createdAt e updatedAt automaticamente

module.exports = mongoose.model('CameraData', CameraDataSchema);
