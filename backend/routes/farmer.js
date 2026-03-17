const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const Animal = require('../models/Animal');
const Query = require('../models/Query');
const Prescription = require('../models/Prescription');
const User = require('../models/User');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(authMiddleware, roleMiddleware(['farmer']));

router.post('/animal', async (req, res) => {
  try {
    const animal = new Animal({ ...req.body, farmer_id: req.user.id });
    await animal.save();
    res.json(animal);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/animals', async (req, res) => {
  try {
    const animals = await Animal.find({ farmer_id: req.user.id });
    res.json(animals);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/vets', async (req, res) => {
  try {
    const vets = await User.find({ role: 'vet' }).select('-password');
    res.json(vets);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/query', upload.single('audio'), async (req, res) => {
  try {
    const { vet_id, animal_id, text_message, food_type } = req.body;
    let audio_url = null;
    
    if (req.file) {
      const base64Audio = req.file.buffer.toString('base64');
      audio_url = `data:${req.file.mimetype};base64,${base64Audio}`;
    }
    
    const query = new Query({
      farmer_id: req.user.id,
      vet_id,
      animal_id,
      text_message,
      audio_url,
      food_type
    });
    await query.save();
    res.json(query);
  } catch (err) {
    console.error('Query Creation Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/queries', async (req, res) => {
  try {
    const queries = await Query.find({ farmer_id: req.user.id })
      .populate('vet_id', 'name')
      .populate('animal_id');
    res.json(queries);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/prescriptions', async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ farmer_id: req.user.id })
      .populate('vet_id', 'name')
      .populate('animal_id');
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/query/:id', async (req, res) => {
  try {
    const query = await Query.findOne({ _id: req.params.id, farmer_id: req.user.id });
    if (!query) return res.status(404).json({ error: 'Query not found' });
    if (query.status !== 'Responded') return res.status(400).json({ error: 'Only completed queries can be deleted' });
    await Query.findByIdAndDelete(req.params.id);
    res.json({ message: 'Query deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
