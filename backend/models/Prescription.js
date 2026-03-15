const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  query_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Query', required: true },
  farmer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vet_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  animal_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  medical_store_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicine_name: { type: String, required: true },
  dosage: { type: String, required: true },
  withdrawal_period: { type: String, required: true }, // e.g., "4 days"
  risk_level: { type: String, enum: ['Safe Risk', 'Medium Risk', 'High Risk'], required: true },
  status: { type: String, enum: ['SaveToMedical', 'Dispensed', 'Cleared'], default: 'SaveToMedical' }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
