const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const Query = require('../models/Query');
const Prescription = require('../models/Prescription');
const User = require('../models/User');

router.use(authMiddleware, roleMiddleware(['vet']));

router.get('/queries', async (req, res) => {
  try {
    const queries = await Query.find({ vet_id: req.user.id })
      .populate('farmer_id', 'name')
      .populate('animal_id')
      .lean();
      
    const queryIds = queries.map(q => q._id);
    const prescriptions = await Prescription.find({ query_id: { $in: queryIds } }).lean();
    
    const queriesWithPrescriptions = queries.map(q => {
      const presc = prescriptions.find(p => p.query_id.toString() === q._id.toString());
      return { ...q, prescription_status: presc ? presc.status : null };
    });

    res.json(queriesWithPrescriptions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/medical-stores', async (req, res) => {
  try {
    const stores = await User.find({ role: 'medical' }).select('-password');
    res.json(stores);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/prescription', async (req, res) => {
  try {
    const { query_id, medical_store_id, medicine_name, dosage, withdrawal_period, risk_level, lab_mrl } = req.body;
    const query = await Query.findById(query_id);
    if (!query) return res.status(404).json({ error: 'Query not found' });

    const prescription = new Prescription({
      query_id,
      farmer_id: query.farmer_id,
      vet_id: req.user.id,
      animal_id: query.animal_id,
      medical_store_id,
      medicine_name,
      dosage,
      withdrawal_period,
      risk_level,
      food_type: query.food_type,
      lab_mrl
    });
    await prescription.save();
    
    query.status = 'Responded';
    await query.save();

    res.json(prescription);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
