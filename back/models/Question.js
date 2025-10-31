const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    competence: { type: String, required: true },
    niveau: { type: Number, required: true, min: 1, max: 3 },
    question: { type: String, required: true },
    reponse: { type: String, required: true },
    options: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', questionSchema);
