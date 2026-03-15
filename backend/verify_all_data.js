const jwt = require('jsonwebtoken');

const JWT_SECRET = 'super_secret_jwt_key_amu_portal';
const adminUser = { id: '69a52fb8cf9caef0a9ea8ef8', role: 'admin', name: 'Rahul' };

const token = jwt.sign(adminUser, JWT_SECRET, { expiresIn: '1h' });

async function verifyAllData() {
  try {
    console.log('Token signed. Fetching /api/admin/all-data...');
    const start = Date.now();
    const res = await fetch('http://localhost:5000/api/admin/all-data', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const end = Date.now();
    const data = await res.json();
    console.log(`Success! Status: ${res.status}, Time: ${end - start}ms`);
    console.log('Data keys:', Object.keys(data));
    console.log('Users count:', data.users?.length);
    console.log('Animals count:', data.animals?.length);
    console.log('Queries count:', data.queries?.length);
    console.log('Prescriptions count:', data.prescriptions?.length);
  } catch (err) {
    console.error('Fetch failed:', err.message);
  }
}

verifyAllData();
