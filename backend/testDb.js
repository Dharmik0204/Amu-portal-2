require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const stores = await User.find({ role: 'medical' });
  console.log('Stores:', stores);
  process.exit(0);
}
run();
