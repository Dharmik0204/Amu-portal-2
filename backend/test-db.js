const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Prescription = require('./models/Prescription');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("Connected");
  const users = await User.find().lean();
  console.log("Users:", users.length);
  const pSent = await Prescription.countDocuments({ status: 'SaveToMedical' });
  const pDispensed = await Prescription.countDocuments({ status: 'Dispensed' });
  const pCleared = await Prescription.countDocuments({ status: 'Cleared' });
  console.log("Stats Pipeline:", { pSent, pDispensed, pCleared });
  const pRaw = await Prescription.find().lean();
  console.log("Prescriptions:", pRaw.length);
  process.exit(0);
}).catch(console.error);
