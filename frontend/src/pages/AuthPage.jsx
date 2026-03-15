import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Activity, Lock, User, Mail } from 'lucide-react';
import api from '../api';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'farmer' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let data;
      if (isLogin) {
        const response = await api.post('/auth/login', { email: formData.email, password: formData.password });
        data = response.data;
        login(data.user, data.token);
      } else {
        const response = await api.post('/auth/register', formData);
        data = response.data;
        login(data.user, data.token);
      }
      navigate(`/${data.user.role}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0fdf4' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: 'var(--primary-color)', borderRadius: '16px', marginBottom: '1rem', boxShadow: '0 10px 15px -3px rgba(0, 147, 102, 0.3)' }}>
          <Activity color="white" size={32} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>AgriHealth Portal</h1>
        <p style={{ color: 'var(--text-muted)' }}>Digital Farm Monitoring — AMU & AMR</p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '2rem', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
        
        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '0.25rem', marginBottom: '1.5rem' }}>
          <button 
            type="button"
            onClick={() => setIsLogin(true)}
            style={{ 
              flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', 
              backgroundColor: isLogin ? 'white' : 'transparent', 
              fontWeight: '600', color: isLogin ? 'var(--text-dark)' : 'var(--text-muted)',
              boxShadow: isLogin ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
            }}
          >
            <Lock size={16} color={isLogin ? "var(--warning)" : "var(--text-muted)"} /> Login
          </button>
          <button 
            type="button"
            onClick={() => setIsLogin(false)}
            style={{ 
              flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', 
              backgroundColor: !isLogin ? 'white' : 'transparent', 
              fontWeight: '600', color: !isLogin ? 'var(--text-dark)' : 'var(--text-muted)',
              boxShadow: !isLogin ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
            }}
          >
            <User size={16} color={!isLogin ? "#fca5a5" : "var(--text-muted)"} /> Register
          </button>
        </div>

        {error && <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-dark)' }}>Full Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="John Doe" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required={!isLogin} 
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-dark)' }}>Email</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="you@example.com" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              required 
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-dark)' }}>Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              required 
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-dark)' }}>Role</label>
              <select 
                className="input-field" 
                value={formData.role} 
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="farmer">Farmer</option>
                <option value="vet">Veterinarian</option>
                <option value="medical">Medical Store</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ color: 'var(--primary-color)', fontWeight: '600', cursor: 'pointer' }}
          >
            {isLogin ? 'Register here' : 'Sign in here'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
