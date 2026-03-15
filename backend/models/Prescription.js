const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  query_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Query', required: true },
  farmer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vet_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  animal_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  medical_store_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  medicine_name: { type: String, required: true },
  dosage: { type: String, required: true },
  withdrawal_period: { type: String, required: true }, // e.g., "4 days"
  food_type: { type: String, enum: ['Milk', 'Meat', 'None'], default: 'None' },
  mrl_admin: { type: String, default: '0' },
  lab_mrl: { type: String, default: '0' },
  risk_level: { type: String, enum: ['Safe Risk', 'Medium Risk', 'High Risk', 'Safe', 'Low'], required: true },
  status: { type: String, enum: ['SaveToMedical', 'Dispensed', 'Cleared', 'Pending'], default: 'SaveToMedical' }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
