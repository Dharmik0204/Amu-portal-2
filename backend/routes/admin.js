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
    const totalUsers = await User.countDocuments();
    const totalPrescriptions = await Prescription.countDocuments();
    const activeFarmsCount = await Animal.distinct('farmer_id').length || await Animal.countDocuments();
    
    const highRiskAlerts = await Prescription.countDocuments({ risk_level: 'High Risk' });

    // Risk distribution
    const safe = await Prescription.countDocuments({ risk_level: 'Safe Risk' });
    const medium = await Prescription.countDocuments({ risk_level: 'Medium Risk' });
    const high = await Prescription.countDocuments({ risk_level: 'High Risk' });

    // Users by Role
    const farmers = await User.countDocuments({ role: 'farmer' });
    const vets = await User.countDocuments({ role: 'vet' });
    const medicalStores = await User.countDocuments({ role: 'medical' });
    const admins = await User.countDocuments({ role: 'admin' });

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
        { name: 'High Risk', value: high }
      ],
      usersByRole: [
        { name: 'Farmers', value: farmers },
        { name: 'Vets', value: vets },
        { name: 'Medical Stores', value: medicalStores },
        { name: 'Admins', value: admins }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
