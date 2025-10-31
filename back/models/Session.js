const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    usedQuestions: [String],
    timerSeconds: { type: Number, default: 0 },
    timerDuration: { type: Number, default: 30 },
    updatedAt: { type: Date, default: Date.now }
});

sessionSchema.index({ userId: 1 });

module.exports = mongoose.model('Session', sessionSchema);
