const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    department: { type: String, required: true },
    year: { type: String, required: true },
    photo: { type: String }, // URL to photo
    electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Candidate', candidateSchema);
