const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
    index: true,
  },
  endDate: {
    type: Date,
    required: true,
    index: true,
  },
  zones: {
    type: [String],
    required: true,
    index: true,
  },
}, { timestamps: true });

EventSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Event', EventSchema);