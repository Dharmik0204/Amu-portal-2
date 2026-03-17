const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const Prescription = require('../models/Prescription');

router.use(authMiddleware, roleMiddleware(['medical']));

router.get('/prescriptions', async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ medical_store_id: req.user.id })
      .populate('farmer_id', 'name')
      .populate('vet_id', 'name')
      .populate('animal_id');
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/dispense/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ error: 'Not found' });

    prescription.status = 'Dispensed';
    await prescription.save();
    
    res.json(prescription);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/prescription/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ _id: req.params.id, medical_store_id: req.user.id });
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
    if (prescription.status !== 'Dispensed') return res.status(400).json({ error: 'Only dispensed prescriptions can be deleted' });
    await Prescription.findByIdAndDelete(req.params.id);
    res.json({ message: 'Prescription deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
