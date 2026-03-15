const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
  farmer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  age: { type: String, required: true },
  identifier: { type: String, required: true } // Name or tag
}, { timestamps: true });

module.exports = mongoose.model('Animal', animalSchema);
