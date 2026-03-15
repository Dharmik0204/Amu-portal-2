const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  farmer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vet_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  animal_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  text_message: { type: String },
  audio_url: { type: String },
  status: { type: String, enum: ['Pending', 'Responded'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Query', querySchema);
