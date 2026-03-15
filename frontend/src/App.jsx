import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import FarmerDashboard from './pages/FarmerDashboard';
import VetDashboard from './pages/VetDashboard';
import MedicalStoreDashboard from './pages/MedicalStoreDashboard';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return children;
};

// Based on user role, route to their specific dashboard
const RouteManager = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;

  if (user) {
    if (user.role === 'farmer') return <Navigate to="/farmer" />;
    if (user.role === 'vet') return <Navigate to="/vet" />;
    if (user.role === 'medical') return <Navigate to="/medical" />;
    if (user.role === 'admin') return <Navigate to="/admin" />;
  }
  return <AuthPage />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RouteManager />} />
        
        <Route path="/farmer" element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/vet" element={
          <ProtectedRoute allowedRoles={['vet']}>
            <VetDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/medical" element={
          <ProtectedRoute allowedRoles={['medical']}>
            <MedicalStoreDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
