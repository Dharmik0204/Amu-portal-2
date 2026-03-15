const mongoose = require('mongoose');
const User = require('./models/User');
const Query = require('./models/Query');
require('dotenv').config();

async function testSubmit() {
  try {
    // connect to DB to get IDs directly
    await mongoose.connect(process.env.MONGO_URI);
    const vets = await User.find({ role: 'vet' });
    const medStores = await User.find({ role: 'medical' });
    const queries = await Query.find({ status: 'Pending' });
    
    if (vets.length === 0 || medStores.length === 0 || queries.length === 0) {
      console.log('Not enough data to test submit. Vets:', vets.length, ' Med:', medStores.length, ' Queries:', queries.length);
      process.exit(0);
    }
    
    // Test login
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email: vets[0].email, password: '123' })
    });
    const { token } = await loginRes.json();
    
    console.log('Submitting prescription for query:', queries[0]._id, ' to store:', medStores[0]._id);
    
    const prescRes = await fetch('http://localhost:5000/api/vet/prescription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        query_id: queries[0]._id,
        medical_store_id: medStores[0]._id,
        medicine_name: 'Test Med',
        dosage: '1 day',
        withdrawal_period: '2 days',
        risk_level: 'High Risk'
      })
    });
    
    const prescData = await prescRes.json();
    console.log('Result:', prescRes.status, prescData);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
testSubmit();
