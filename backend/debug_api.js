const axios = require('axios');

async function test() {
  try {
    console.log('Fetching all-data...');
    // Testing without token first - should give 401/403
    const res = await axios.get('http://localhost:5000/api/admin/all-data').catch(e => e.response);
    console.log('Status with no token:', res?.status);
    console.log('Response body:', res?.data);
  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

test();
