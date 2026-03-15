const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const Animal = require('../models/Animal');
const Query = require('../models/Query');
const Prescription = require('../models/Prescription');
const User = require('../models/User');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
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
    const { vet_id, animal_id, text_message } = req.body;
    const audio_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    const query = new Query({
      farmer_id: req.user.id,
      vet_id,
      animal_id,
      text_message,
      audio_url
    });
    await query.save();
    res.json(query);
  } catch (err) {
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

module.exports = router;
