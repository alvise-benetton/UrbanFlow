var mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 } // scadenza automatica in 1 ora
});
module.exports = mongoose.model('Session', sessionSchema);