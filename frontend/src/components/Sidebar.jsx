import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, Users, Activity, Settings, LogOut, FileText, Pill } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getMenuItems = () => {
    switch (user?.role) {
      case 'farmer':
        return [
          { name: 'My Farm', icon: <Home size={20} />, path: '/farmer' }
        ];
      case 'vet':
        return [
          { name: 'Consultations', icon: <Activity size={20} />, path: '/vet' }
        ];
      case 'medical':
        return [
          { name: 'Dispensary', icon: <Pill size={20} />, path: '/medical' }
        ];
      case 'admin':
        return [
          { name: 'Analytics', icon: <Activity size={20} />, path: '/admin' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <Activity color="var(--primary-color)" size={28} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-dark)' }}>AgriHealth</h2>
      </div>

      <div className="card" style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8fafc', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontWeight: 'bold' }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--primary-color)' }}>{user?.name}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</p>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {getMenuItems().map((item) => (
          <div
            key={item.name}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '0.5rem',
              backgroundColor: location.pathname === item.path ? '#e6f4ef' : 'transparent',
              color: location.pathname === item.path ? 'var(--primary-color)' : 'var(--text-dark)',
              fontWeight: location.pathname === item.path ? '600' : '500',
              transition: 'background-color 0.2s'
            }}
          >
            {item.icon}
            {item.name}
          </div>
        ))}
      </nav>

      <button onClick={handleLogout} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
        <LogOut size={18} />
        Sign out
      </button>
    </div>
  );
};

export default Sidebar;
