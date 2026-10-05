const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  zones: {
    type: [String],
    required: true,
  },
}, { timestamps: true }); // timestamps aggiunge createdAt e updatedAt

module.exports = mongoose.model('Event', EventSchema);;