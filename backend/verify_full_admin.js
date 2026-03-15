const jwt = require('jsonwebtoken');

const JWT_SECRET = 'super_secret_jwt_key_amu_portal';
const adminUser = { id: '69a52fb8cf9caef0a9ea8ef8', role: 'admin', name: 'Rahul' };

const token = jwt.sign(adminUser, JWT_SECRET, { expiresIn: '1h' });

async function verify() {
  try {
    console.log('Testing /api/admin/stats...');
    const sRes = await fetch('http://localhost:5000/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const sData = await sRes.json();
    console.log('Stats Success!');
    console.log('Summary:', sData.summary);
    console.log('Pipeline Data:', JSON.stringify(sData.pipelineData, null, 2));
    console.log('Daily Prescriptions:', JSON.stringify(sData.dailyPrescriptions, null, 2));

    console.log('\nTesting /api/admin/all-data...');
    const dRes = await fetch('http://localhost:5000/api/admin/all-data', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const dData = await dRes.json();
    console.log('All Data Success!');
    console.log('Counts:', {
      users: dData.users?.length,
      animals: dData.animals?.length,
      queries: dData.queries?.length,
      prescriptions: dData.prescriptions?.length
    });
  } catch (err) {
    console.error('Fetch failed:', err.message);
  }
}

verify();
