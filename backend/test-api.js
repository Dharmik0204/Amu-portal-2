(async () => {
    try {
        const res = await fetch('http://127.0.0.1:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@system.com', password: 'password123' })
        });
        const loginData = await res.json();
        const token = loginData.token;
        console.log("Logged in:", !!token);
        
        const dataRes = await fetch('http://127.0.0.1:5000/api/admin/all-data', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await dataRes.json();
        console.log("Users API:", data.users ? data.users.length : "undefined");
        console.log("Prescriptions API:", data.prescriptions ? data.prescriptions.length : "undefined");
        if (data.error) console.log("API Error:", data.error);
    } catch (err) {
        console.error("Error:", err);
    }
})();
