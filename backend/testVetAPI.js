async function test() {
  try {
    let token = '';
     try {
       const res = await fetch('http://localhost:5000/api/auth/register', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           name: 'vet_tester',
           email: 'vettester@gmail.com',
           password: '123',
           role: 'vet'
         })
       });
       const data = await res.json();
       if (!res.ok) throw new Error('register fail');
       token = data.token;
       console.log('Registered vet, token:', token.substring(0, 10) + '...');
     } catch(err) {
       console.log('Register failed, trying login');
       const res = await fetch('http://localhost:5000/api/auth/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           email: 'vettester@gmail.com',
           password: '123'
         })
       });
       const data = await res.json();
       token = data.token;
       console.log('Logged in vet, token:', token.substring(0, 10) + '...');
     }

     const storesRes = await fetch('http://localhost:5000/api/vet/medical-stores', {
       headers: { Authorization: `Bearer ${token}` }
     });
     const storesData = await storesRes.json();
     console.log('STORES FETCHED:', storesData.length, 'stores');
     console.log(storesData);
  } catch (err) {
    console.error('API Error:', err.message);
  }
}

test();
