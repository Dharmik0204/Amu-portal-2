const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Animal = require('../models/Animal');
const Prescription = require('../models/Prescription');
const Query = require('../models/Query');

router.use(authMiddleware, roleMiddleware(['admin']));

router.get('/stats', async (req, res) => {
  try {
    console.log('Fetching admin stats (optimized)...');
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Run all count and distribution queries in parallel
    const [
      totalUsers,
      totalPrescriptions,
      activeFarmsResult,
      highRiskAlerts,
      safe,
      medium,
      farmers,
      vets,
      medicalStores,
      admins,
      pSentToMedical,
      pDispensed,
      pCleared,
      dailyDataRaw
    ] = await Promise.all([
      User.countDocuments(),
      Prescription.countDocuments(),
      Animal.distinct('farmer_id'),
      Prescription.countDocuments({ risk_level: { $in: ['High', 'High Risk'] } }),
      Prescription.countDocuments({ risk_level: { $in: ['Safe', 'Safe Risk'] } }),
      Prescription.countDocuments({ risk_level: { $in: ['Medium', 'Medium Risk'] } }),
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'vet' }),
      User.countDocuments({ role: 'medical' }),
      User.countDocuments({ role: 'admin' }),
      Prescription.countDocuments({ status: 'SaveToMedical' }),
      Prescription.countDocuments({ status: 'Dispensed' }),
      Prescription.countDocuments({ status: 'Cleared' }),
      Prescription.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { "_id": 1 } }
      ])
    ]);

    const activeFarmsCount = activeFarmsResult.length;

    // Map to last 7 days labels
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const match = dailyDataRaw.find(d => d._id === dateStr);
      last7Days.push({
        day: days[date.getDay()],
        count: match ? match.count : 0
      });
    }

    res.json({
      summary: {
        totalUsers,
        totalPrescriptions,
        highRiskAlerts,
        activeFarms: activeFarmsCount
      },
      riskDistribution: [
        { name: 'Safe', value: safe },
        { name: 'Medium Risk', value: medium },
        { name: 'High Risk', value: highRiskAlerts }
      ],
      usersByRole: [
        { name: 'Farmers', value: farmers },
        { name: 'Vets', value: vets },
        { name: 'Medical Stores', value: medicalStores },
        { name: 'Admins', value: admins }
      ],
      pipelineData: [
        { name: 'Sent to Medical', count: pSentToMedical },
        { name: 'Dispensed', count: pDispensed },
        { name: 'Cleared', count: pCleared }
      ],
      dailyPrescriptions: last7Days
    });
  } catch (err) {
    console.error('Stats fetch overall error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/all-data', async (req, res) => {
  try {
    console.log('Fetching all admin data (parallel)...');
    
    const [usersRes, animalsRes, queriesRes, prescriptionsRes] = await Promise.allSettled([
      User.find().select('-password').sort({ createdAt: -1 }).lean(),
      Animal.find().populate('farmer_id', 'name mobile').sort({ createdAt: -1 }).lean(),
      Query.find()
        .populate('farmer_id', 'name mobile')
        .populate('vet_id', 'name')
        .populate('animal_id', 'identifier type')
        .sort({ createdAt: -1 })
        .lean(),
      Prescription.find()
        .populate('farmer_id', 'name mobile')
        .populate('vet_id', 'name')
        .populate('animal_id', 'identifier type')
        .populate('query_id')
        .sort({ createdAt: -1 })
        .lean()
    ]);

    if (usersRes.status === 'rejected') console.error('Users query failed:', usersRes.reason);
    if (animalsRes.status === 'rejected') console.error('Animals query failed:', animalsRes.reason);
    if (queriesRes.status === 'rejected') console.error('Queries query failed:', queriesRes.reason);
    if (prescriptionsRes.status === 'rejected') console.error('Prescriptions query failed:', prescriptionsRes.reason);

    res.json({
      users: usersRes.status === 'fulfilled' ? usersRes.value : [],
      animals: animalsRes.status === 'fulfilled' ? animalsRes.value : [],
      queries: queriesRes.status === 'fulfilled' ? queriesRes.value : [],
      prescriptions: prescriptionsRes.status === 'fulfilled' ? prescriptionsRes.value : []
    });
  } catch (err) {
    console.error('All data fetch overall error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin creation routes
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: 'User already exists' });

    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json({ message: 'User created successfully', user: { id: user._id, name, email, role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/animals', async (req, res) => {
  try {
    const animal = new Animal(req.body);
    await animal.save();
    res.status(201).json({ message: 'Animal created successfully', animal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/users/:id', async (req, res) => {
  try {
    const { mobile } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { mobile },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Mobile updated', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
